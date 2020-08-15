import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Post } from './interfaces/post.interface';
import { PostSortBy } from './enums/sort-post.enum';
jest.mock('../auth/auth.module.ts');
describe('PostController', () => {
    let postController: PostController;
    let postService: PostService;

    beforeEach(async () => {
        function mockModel(dto: any) {
            this.data = dto;
            this.save = () => {
                return this.data;
            };
        }
        const moduleRef = await Test.createTestingModule({
            controllers: [PostController],
            providers: [PostService,
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
        postService = await moduleRef.resolve(PostService);

        postController = moduleRef.get<PostController>(PostController);
    });

    describe('Posts', () => {
        it('should return an array of posts', async () => {
            const result = ['test'];
            jest.spyOn(postService, 'getPostsBySocialName').mockImplementation(() => Promise.resolve(result));
            expect(await postController.getPostsBySocialName(
                undefined,
                { n: 'test', page: 1, itemsPerPage: 10, flair: 'some', sortBy: PostSortBy.HOT })
            ).toBe(result);
        });
        it('should react to Post By ID', async () => {
            const result = { reaction: 66 };
            jest.spyOn(postService, 'reactToPostById').mockImplementation(() => Promise.resolve(result));
            expect(await postController.reactToPostById({ pid: 'test' }, { reaction: 'LIKE' }, undefined)).toBe(result);
        });
        it('should create post by social ID', async () => {
            const result: Post = { text: 'test', title: 'test' } as any;
            jest.spyOn(postService, 'createPostBySocialId').mockImplementation(() => Promise.resolve(result));
            expect(await postController.
                createPostBySocialId(
                    { sid: '1545454' },
                    { title: 'title', text: 'some text' },
                    { socials: [] } as any) // warn: it's user. for simplicity disabled type!
            ).toBe(result);
        });
        it('should delete post by ID', async () => {
            const result = { message: 'test message' };
            jest.spyOn(postService, 'deletePostById').mockImplementation(() => Promise.resolve(result));
            expect(await postController.deletePostById({ pid: 'test' }, undefined)).toBe(result);
        });
    });
});
