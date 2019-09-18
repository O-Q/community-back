import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig: JwtModuleOptions = {
  secret: 'A@4h2e#1IOL&&2$sSpM.DS?F56E!P>f{',
  signOptions: { expiresIn: 3600 },
};
