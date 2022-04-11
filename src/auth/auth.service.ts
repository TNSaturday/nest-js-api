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

    async signin(dto: AuthDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                // @ts-ignore
                email: dto.email,
            }
        });

        if (!user) {
            throw new ForbiddenException('User with such email doesn\'t exist');
        }

        const pwMatches = await argon.verify(user.hash, dto.password);

        if (!pwMatches) {
            throw new ForbiddenException('Incorrect password');
        }

        delete user.hash;

        return user;
    }
}