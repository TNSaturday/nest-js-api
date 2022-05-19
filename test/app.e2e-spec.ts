import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';

describe('App e2e', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        app = moduleRef.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({whitelist: true})
        );
        await app.init();
        await app.listen(3333);

        prisma = app.get(PrismaService);

        await prisma.cleanDb();
    });

    afterAll(() => {
        app.close();
    });

    const dto: AuthDto = {
        email: "tnsaturday@gmail.com",
        password: "supersecret",
    }

    describe('Auth', () => {
        describe('Signup', () => {
            it('should throw if email is invalid', () => {
                return pactum
                  .spec()
                  .post('http://localhost:3333/auth/signup')
                  .withBody({
                      email: "tnsaturday",
                      password: "some89pass"
                  })
                  .expectStatus(400);
            });

            it('should throw if password is empty', () => {
                return pactum
                  .spec()
                  .post('http://localhost:3333/auth/signup')
                  .withBody({
                      email: "tnsaturday",
                      password: ""
                  })
                  .expectStatus(400);
            });

            it('Should signup', () => {
                return pactum
                  .spec()
                  .post('http://localhost:3333/auth/signup')
                  .withBody(dto)
                  .expectStatus(201);
            });
        });

        describe('Signin', () => {
            it('Should signin', () => {
                return pactum
                  .spec()
                  .post('http://localhost:3333/auth/signin')
                  .withBody(dto)
                  .expectStatus(200)
                  .stores('userAccessToken', 'access_token');
            });

            it('should throw if email is invalid', () => {
                return pactum
                  .spec()
                  .post('http://localhost:3333/auth/signin')
                  .withBody({
                      email: "tnsaturday",
                      password: "some89pass"
                  })
                  .expectStatus(400);
            });

            it('should throw if password is empty', () => {
                return pactum
                  .spec()
                  .post('http://localhost:3333/auth/signin')
                  .withBody({
                      email: "tnsaturday",
                      password: ""
                  })
                  .expectStatus(400);
            });
        });
    });

    describe('User', () => {
        describe('Get me', () => {
            it('should get current user', () => {
                return pactum
                  .spec()
                  .get('http://localhost:3333/users/me')
                  .withHeaders({
                      Authorization: 'Bearer $S{userAccessToken}'
                  })
                  .expectStatus(200);
            });
        });
    });

    describe('Bookmark', () => {
        describe('Create bookmark', () => {
            it.todo('Should Create bookmark');
        });

        describe('Get bookmarks', () => {
            it.todo('Should get bookmarks');
        });

        describe('Get bookmark by id', () => {
            it.todo('Should get bookmark by id');
        });

        describe('Edit bookmark by id', () => {
            it.todo('Should edit bookmark by id');
        });

        describe('Delete bookmark', () => {
            it.todo('Should delete bookmark');
        });
    });

    it.todo('should pass');
});