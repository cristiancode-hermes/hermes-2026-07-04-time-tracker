import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class RedirectIfAuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return false;
    }
    return true;
  }
}
