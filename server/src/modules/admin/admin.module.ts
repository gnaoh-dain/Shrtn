import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AdminController } from './admin.controller';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Module({
  imports: [AuthModule, AnalyticsModule],
  controllers: [AdminController],
  providers: [RolesGuard],
})
export class AdminModule {}
