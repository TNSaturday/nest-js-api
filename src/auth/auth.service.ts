import {ForbiddenException, Injectable, Req} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {AuthDto} from "./dto";
import * as argon from "argon2";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime";
import {JwtService} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService,
    ) {
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

            return this.signToken(user.id, user.email);
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

        return this.signToken(user.id, user.email);
    }

    async signToken(userId: number, email: string) {
        const payload = {
            sub: userId,
            email
        };
        const secret = this.config.get('JWT_SECRET');
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '60m',
            secret: secret,
        });

        return {
            access_token: token,
        };
    }
}