import { JwtPayload } from '../../auth/jwt/jwt-payload.interface';
import atob = require('atob');

export function decodeToken(token: string): JwtPayload {
  token = token.split(' ')[1];
  return JSON.parse(
    '{' +
    atob(token)
      .split('{')[2]
      .split('}')[0] +
    '}',
  );
}
