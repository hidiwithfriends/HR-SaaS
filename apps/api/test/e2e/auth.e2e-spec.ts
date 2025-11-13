import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../../src/common/interceptors/response.interceptor';

describe('Auth API (e2e)', () => {
  let app: INestApplication;
  let createdUserId: string;
  let createdStoreId: string;
  let accessToken: string;
  let refreshToken: string;

  // 테스트용 고유 이메일 생성
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test1234';
  const testName = '테스트 점주';
  const testStoreName = '테스트 매장';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same configuration as main.ts
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    });

    app.useGlobalFilters(new HttpExceptionFilter());

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/signup/owner', () => {
    it('should create a new owner user and store successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/signup/owner')
        .send({
          email: testEmail,
          password: testPassword,
          name: testName,
          storeName: testStoreName,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('userId');
          expect(res.body.data).toHaveProperty('email', testEmail);
          expect(res.body.data).toHaveProperty('role', 'OWNER');
          expect(res.body.data).toHaveProperty('storeId');
          expect(res.body.data).not.toHaveProperty('passwordHash');

          // Save for later tests
          createdUserId = res.body.data.userId;
          createdStoreId = res.body.data.storeId;
        });
    });

    it('should fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/signup/owner')
        .send({
          email: testEmail,
          password: testPassword,
          name: testName,
          storeName: testStoreName,
        })
        .expect(409)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
        });
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/signup/owner')
        .send({
          email: 'invalid-email',
          password: testPassword,
          name: testName,
          storeName: testStoreName,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
        });
    });

    it('should fail with weak password (too short)', () => {
      return request(app.getHttpServer())
        .post('/auth/signup/owner')
        .send({
          email: `another-${Date.now()}@example.com`,
          password: 'short',
          name: testName,
          storeName: testStoreName,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
        });
    });

    it('should fail with password without numbers', () => {
      return request(app.getHttpServer())
        .post('/auth/signup/owner')
        .send({
          email: `another2-${Date.now()}@example.com`,
          password: 'OnlyLetters',
          name: testName,
          storeName: testStoreName,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
        });
    });

    it('should fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/signup/owner')
        .send({
          email: testEmail,
          // missing password, name, storeName
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
        });
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data).toHaveProperty('refreshToken');
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data.user).toHaveProperty('id', createdUserId);
          expect(res.body.data.user).toHaveProperty('email', testEmail);
          expect(res.body.data.user).toHaveProperty('role', 'OWNER');
          expect(res.body.data.user).not.toHaveProperty('passwordHash');

          // Save tokens for later tests
          accessToken = res.body.data.accessToken;
          refreshToken = res.body.data.refreshToken;
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
        });
    });

    it('should fail with invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
        });
    });

    it('should fail with missing credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
        });
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh token successfully with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: refreshToken,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('accessToken');
          expect(typeof res.body.data.accessToken).toBe('string');
        });
    });

    it('should fail with invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('INVALID_REFRESH_TOKEN');
        });
    });

    it('should fail with missing refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
        });
    });
  });

  describe('GET /users/me', () => {
    it('should get current user successfully with valid access token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id', createdUserId);
          expect(res.body.data).toHaveProperty('email', testEmail);
          expect(res.body.data).toHaveProperty('name', testName);
          expect(res.body.data).toHaveProperty('role', 'OWNER');
          expect(res.body.data).not.toHaveProperty('passwordHash');
        });
    });

    it('should fail without access token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .expect(401);
    });

    it('should fail with invalid access token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
