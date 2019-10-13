import { createParamDecorator } from '@nestjs/common';
import { User } from '../interfaces/user.interface';
import { Reflector } from '@nestjs/core';

export const GetUser = createParamDecorator(
  (_, req): User => {
    return req.user;
  },
);
