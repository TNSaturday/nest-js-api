import {Injectable, Req} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {
    }
    signup() {
        return {
            message: 'Sign up!',
        };
    }

    signin() {
        return {
            message: 'Sign in!',
        };
    }
}