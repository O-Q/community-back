import { Controller, Get, Query, ValidationPipe, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { SocialQuery } from '../social/dto/social-query.dto';
import { SearchHomepageQuery } from './dto/search-query.dto';
import { UserGetterGuard } from '../user/guards/user-getter.guard';
import { GetUser } from '../user/decorators/get-user.decorator';
import { User } from '../user/interfaces/user.interface';

@Controller('search')
export class SearchController {
    constructor(private searchService: SearchService) { }
    @Get()
    search(@Query(ValidationPipe) searchQuery: SocialQuery) {
        return this.searchService.searchSocial(searchQuery);
    }

    @Get('/homepage/social')
    getHomepageSocialData(@Query() query: SearchHomepageQuery) {
        return this.searchService.getHomepageSocialData(query);
    }

    @UseGuards(UserGetterGuard)
    @Get('/homepage/post')
    getHomepagePostData(@Query() query: SearchHomepageQuery, @GetUser() user: User) {
        return this.searchService.getHomepagePostData(query, user);
    }
}
