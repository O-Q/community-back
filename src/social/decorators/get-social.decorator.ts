import { createParamDecorator } from '@nestjs/common';
import { Forum } from '../../forum/interfaces/forum.interface';

export const GetSocial = createParamDecorator(
    (_, req): Forum => {
        return req?.args[0].social || req[0]?.handshake.social;
    },
);
