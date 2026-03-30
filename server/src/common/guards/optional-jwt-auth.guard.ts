import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { UserRole } from 'src/generated/prisma/enums';
import type { RequestUser } from './roles.guard';

type JwtAccessPayload = {
  sub?: string;
  email?: string;
  role?: UserRole;
};

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: RequestUser }>();
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      req.user = undefined;
      return true;
    }
    const token = auth.slice('Bearer '.length).trim();
    if (!token) {
      req.user = undefined;
      return true;
    }
    try {
      const payload = this.jwtService.verify<JwtAccessPayload>(token);
      if (payload.sub && payload.email && payload.role) {
        req.user = { id: payload.sub, email: payload.email, role: payload.role };
      } else {
        req.user = undefined;
      }
    } catch {
      req.user = undefined;
    }
    return true;
  }
}
