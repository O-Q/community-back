import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { UserStatus } from '../enums/user-status.enum';

@Injectable()
export class ActiveUserGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const user: User = req.user;
    return user.status === UserStatus.ACTIVE;
  }
}
