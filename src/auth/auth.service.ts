import {Injectable, Req} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {AuthDto} from "./dto";

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {
    }
    signup(dto: AuthDto) {
        console.log({
            dto,
        });
        return {
            message: 'Sign up!',
        };
    }

    signin(dto: AuthDto) {
        console.log({
            dto,
        });
        return {
            message: 'Sign in!',
        };
    }
}