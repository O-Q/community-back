import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Param,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { GetUser } from '../user/decorators/get-user.decorator';
import { User } from '../user/interfaces/user.interface';
import { AuthGuard } from '@nestjs/passport';
import { GroupParams } from './dto/group-params.dto';
import { GroupDto } from './dto/group.dto';
import { GroupQuery } from './dto/group-query.dto';
import { PrivateGroupGuard } from './guards/private-group.guard';

@Controller('group')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @Get()
  getGroups(@Query(ValidationPipe) query: GroupQuery) {
    if (query.text) {
      return this.groupService.getSearchedGroups(query);
    } else {
      return this.groupService.getGroups(query);
    }
  }
  @UseGuards(PrivateGroupGuard)
  @Get('/:gid')
  getGroupById(@Param(ValidationPipe) groupParams: GroupParams) {
    return this.groupService.getGroupById(groupParams.gid);
  }

  @UseGuards(AuthGuard())
  @Post()
  createGroup(@GetUser() user: User, @Body(ValidationPipe) groupDto: GroupDto) {
    return this.groupService.createGroup(user, groupDto);
  }

  @UseGuards(AuthGuard())
  @Post('/:gid/user')
  joinUserToGroup(
    @Param(ValidationPipe) groupParams: GroupParams,
    @GetUser() user: User,
  ) {
    return this.groupService.joinUserToGroup(groupParams.gid, user);
  }
}
