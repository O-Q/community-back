import { createParamDecorator } from '@nestjs/common';
import { User } from '../interfaces/user.interface';

export const GetUser = createParamDecorator(
  (_, req): User => {

    return req?.args[0].user || req[0]?.handshake.user;
  },
);
