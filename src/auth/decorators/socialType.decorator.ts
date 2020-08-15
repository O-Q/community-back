import { SetMetadata } from '@nestjs/common';

export const SocialTypes = (...socialTypes: any[]) => SetMetadata('socialType', socialTypes);
