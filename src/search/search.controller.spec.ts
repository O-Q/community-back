import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { PostSortBy } from '../post/enums/sort-post.enum';
import { AppLogger } from '../logger/logger';
import { Post } from '../post/interfaces/post.interface';
describe('SearchController', () => {
    let searchController: SearchController;
    let searchService: SearchService;
    function mockModel(dto: any) {
        this.data = dto;
        this.save = () => {
            return this.data;
        };
    }
    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [SearchController],
            providers: [SearchService, AppLogger,
                {
                    provide: getModelToken('Post'),
                    useValue: mockModel,
                },
                {
                    provide: getModelToken('Social'),
                    useValue: mockModel,
                },
                {
                    provide: getModelToken('User'),
                    useValue: mockModel,
                }],
        }).overrideGuard(AuthGuard()).useValue({ canActivate: () => true }).compile();
        searchService = await moduleRef.resolve(SearchService);
        searchController = moduleRef.get<SearchController>(SearchController);
    });
    it('should get posts from getHomepagePostData from service and return it', async () => {
        const result = { length: 2, posts: [{} as Post, {} as Post] };
        jest.spyOn(searchService, 'getHomepagePostData').mockImplementation(() => Promise.resolve(result));
        expect(await searchController.getHomepagePostData({ page: '1', itemsPerPage: '10', sortBy: PostSortBy.NEWEST }, undefined))
            .toBe(result);
    });
});
