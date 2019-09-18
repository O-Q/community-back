import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Param,
  UseGuards,
  Get,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { GetUser } from '../user/decorators/get-user.decorator';
import { User } from '../user/interfaces/user.interface';
import { AuthGuard } from '@nestjs/passport';
import { GroupParams } from './dto/group-params.dto';
import { GroupDto } from './dto/group.dto';

@Controller('group')
export class GroupController {
  constructor(private groupService: GroupService) {}
  @Get('/:id')
  getGroupById(@Param(ValidationPipe) groupParams: GroupParams) {
    return this.groupService.getGroupById(groupParams.id);
  }

  @UseGuards(AuthGuard())
  @Post()
  createGroup(@GetUser() user: User, @Body(ValidationPipe) groupDto: GroupDto) {
    return this.groupService.CreateGroup(user, groupDto);
  }

  @UseGuards(AuthGuard())
  @Post('/:id/user')
  addUserToGroup(
    @Param(ValidationPipe) groupParams: GroupParams,
    @GetUser() user: User,
  ) {
    return this.groupService.addUserToGroup(groupParams.id, user);
  }
}
