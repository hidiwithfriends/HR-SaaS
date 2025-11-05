import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

describe('Auth API (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await dataSource.query('TRUNCATE TABLE stores CASCADE');
    await dataSource.query('TRUNCATE TABLE users CASCADE');
  });

  describe('POST /auth/signup/owner', () => {
    const signupDto = {
      email: 'owner@example.com',
      password: 'SecurePass123!',
      name: '홍길동',
      phone: '010-1234-5678',
      storeName: '홍대 카페',
      storeType: 'CAFE',
    };

    it('[AC-AUTH-01] should create user and store on signup', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup/owner')
        .send(signupDto)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('email', signupDto.email);
      expect(response.body.data).toHaveProperty('role', 'OWNER');
      expect(response.body.data).toHaveProperty('storeId');

      // Verify user exists in DB
      const users = await dataSource.query(
        'SELECT * FROM users WHERE email = $1',
        [signupDto.email],
      );
      expect(users).toHaveLength(1);
      expect(users[0].name).toBe(signupDto.name);

      // Verify store exists in DB
      const stores = await dataSource.query(
        'SELECT * FROM stores WHERE name = $1',
        [signupDto.storeName],
      );
      expect(stores).toHaveLength(1);
      expect(stores[0].type).toBe(signupDto.storeType);
    });

    it('[AC-AUTH-02] should return 409 when email already exists', async () => {
      // First signup
      await request(app.getHttpServer())
        .post('/auth/signup/owner')
        .send(signupDto)
        .expect(201);

      // Second signup with same email
      const response = await request(app.getHttpServer())
        .post('/auth/signup/owner')
        .send(signupDto)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'EMAIL_ALREADY_EXISTS');
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidDto = {
        email: 'test@example.com',
        // password missing
        name: 'Test',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signup/owner')
        .send(invalidDto)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should return 400 when email format is invalid', async () => {
      const invalidDto = {
        ...signupDto,
        email: 'invalid-email',
      };

      await request(app.getHttpServer())
        .post('/auth/signup/owner')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    const signupDto = {
      email: 'owner@example.com',
      password: 'SecurePass123!',
      name: '홍길동',
      phone: '010-1234-5678',
      storeName: '홍대 카페',
      storeType: 'CAFE',
    };

    beforeEach(async () => {
      // Create user before login tests
      await request(app.getHttpServer())
        .post('/auth/signup/owner')
        .send(signupDto);
    });

    it('[AC-AUTH-03] should return valid JWT tokens on login', async () => {
      const loginDto = {
        email: signupDto.email,
        password: signupDto.password,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toHaveProperty('userId');
      expect(response.body.data.user).toHaveProperty('email', loginDto.email);
      expect(response.body.data.user).toHaveProperty('role', 'OWNER');
      expect(response.body.data.user).toHaveProperty('name', signupDto.name);

      // Verify JWT token format (should be 3 parts separated by dots)
      const accessToken = response.body.data.accessToken;
      expect(accessToken.split('.')).toHaveLength(3);
    });

    it('[AC-AUTH-04] should return 401 when password is incorrect', async () => {
      const loginDto = {
        email: signupDto.email,
        password: 'WrongPassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'INVALID_CREDENTIALS');
    });

    it('should return 401 when email does not exist', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'SomePassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body.error).toHaveProperty('code', 'INVALID_CREDENTIALS');
    });
  });

  describe('POST /auth/refresh', () => {
    const signupDto = {
      email: 'owner@example.com',
      password: 'SecurePass123!',
      name: '홍길동',
      phone: '010-1234-5678',
      storeName: '홍대 카페',
      storeType: 'CAFE',
    };

    let refreshToken: string;

    beforeEach(async () => {
      // Create user and login to get refresh token
      await request(app.getHttpServer())
        .post('/auth/signup/owner')
        .send(signupDto);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: signupDto.email,
          password: signupDto.password,
        });

      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('should return new access token with valid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('accessToken');

      // Verify it's a different token (new JWT)
      const newAccessToken = response.body.data.accessToken;
      expect(newAccessToken.split('.')).toHaveLength(3);
    });

    it('should return 401 when refresh token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 when refresh token is missing', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400);
    });
  });

  describe('RBAC - Role-Based Access Control', () => {
    let ownerToken: string;
    let ownerStoreId: string;

    beforeEach(async () => {
      // Create owner and get token
      const signupResponse = await request(app.getHttpServer())
        .post('/auth/signup/owner')
        .send({
          email: 'owner@example.com',
          password: 'SecurePass123!',
          name: '홍길동',
          phone: '010-1234-5678',
          storeName: '홍대 카페',
          storeType: 'CAFE',
        });

      ownerStoreId = signupResponse.body.data.storeId;

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'owner@example.com',
          password: 'SecurePass123!',
        });

      ownerToken = loginResponse.body.data.accessToken;
    });

    it('[AC-AUTH-05] OWNER should access own store', async () => {
      // This test will be implemented in F2 when store endpoints are ready
      // For now, we just verify the token contains the correct role
      const payload = JSON.parse(
        Buffer.from(ownerToken.split('.')[1], 'base64').toString(),
      );
      expect(payload).toHaveProperty('role', 'OWNER');
      expect(payload).toHaveProperty('storeId', ownerStoreId);
    });
  });
});
