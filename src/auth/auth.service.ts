import {ForbiddenException, Injectable, Req} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {AuthDto} from "./dto";
import * as argon from "argon2";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime";

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {
    }
    async signup(dto: AuthDto) {
        const hash = await argon.hash(dto.password);
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                },
            });

            delete user.hash;

            return {
                user,
            };
        } catch (e) {
            if (e instanceof PrismaClientKnownRequestError) {
                if (e.code === 'P2002') {
                    throw new ForbiddenException('User with such email already exists');
                }
            }
        }

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