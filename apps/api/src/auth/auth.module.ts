import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RedisService } from '../services/redis.service';
import { SendGridService } from '../services/sendgrid.service';

@Module({
    imports: [],
    controllers: [AuthController],
    providers: [AuthService, RedisService, SendGridService],
    exports: [AuthService], // Export so TenantsModule can use it
})
export class AuthModule { }
