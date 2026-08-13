import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class FlexibleAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Login required');
    }

    const token = authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') {
      throw new UnauthorizedException('Invalid token');
    }

    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        throw new UnauthorizedException('Invalid token format');
      }

      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString('utf8'),
      );
      const email = payload.email || payload.sub || null;

      if (!email || typeof email !== 'string') {
        throw new UnauthorizedException('Token missing email');
      }

      request.userEmail = email;
      request.user = { email, id: payload.sub || email };
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid token');
    }
  }
}
