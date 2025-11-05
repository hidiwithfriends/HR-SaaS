import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1699000000000 implements MigrationInterface {
  name = 'InitialSchema1699000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM types
    await queryRunner.query(`
      CREATE TYPE user_role AS ENUM ('OWNER', 'EMPLOYEE', 'MANAGER', 'PARTNER', 'ADMIN');
    `);
    await queryRunner.query(`
      CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
    `);
    await queryRunner.query(`
      CREATE TYPE store_type AS ENUM ('CAFE', 'RESTAURANT', 'RETAIL', 'SALON', 'OTHER');
    `);
    await queryRunner.query(`
      CREATE TYPE store_status AS ENUM ('ACTIVE', 'INACTIVE');
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "password_hash" VARCHAR(255) NOT NULL,
        "name" VARCHAR(100) NOT NULL,
        "phone" VARCHAR(20),
        "role" user_role NOT NULL,
        "status" user_status NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create stores table
    await queryRunner.query(`
      CREATE TABLE "stores" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "owner_id" UUID NOT NULL,
        "name" VARCHAR(200) NOT NULL,
        "type" store_type NOT NULL,
        "address" TEXT,
        "latitude" DECIMAL(10, 8),
        "longitude" DECIMAL(11, 8),
        "gps_radius" INT NOT NULL DEFAULT 50,
        "status" store_status NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "fk_stores_owner" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_users_email" ON "users"("email");
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_users_role" ON "users"("role");
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_stores_owner_id" ON "stores"("owner_id");
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_stores_type" ON "stores"("type");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_stores_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_stores_owner_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_role"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_email"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "stores"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    // Drop ENUM types
    await queryRunner.query(`DROP TYPE IF EXISTS "store_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "store_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role"`);
  }
}
