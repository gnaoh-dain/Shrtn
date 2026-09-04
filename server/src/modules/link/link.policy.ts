import { ForbiddenException } from '@nestjs/common';
import { UserRole } from 'src/generated/prisma/enums';
import type { RequestUser } from 'src/common/guards/roles.guard';

/**
 * Guest links (user_id === null) are mutable by anyone who knows the short code.
 * Owned links are mutable only by their owner or an admin.
 */
export function assertCanMutateLink(link: { user_id: string | null }, user?: RequestUser): void {
  if (link.user_id === null) {
    return;
  }
  if (user?.role === UserRole.ADMIN) {
    return;
  }
  if (user?.id === link.user_id) {
    return;
  }
  throw new ForbiddenException();
}
