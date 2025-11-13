import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1762945189255 implements MigrationInterface {
    name = 'InitialSchema1762945189255'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."employees_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'QUIT')`);
        await queryRunner.query(`CREATE TABLE "employees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "store_id" uuid NOT NULL, "role" character varying(50), "hourly_wage" numeric(10,2), "status" "public"."employees_status_enum" NOT NULL DEFAULT 'ACTIVE', "hired_at" date, "quit_at" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_employee_unique_active" ON "employees" ("user_id", "store_id", "status") WHERE status = 'ACTIVE'`);
        await queryRunner.query(`CREATE TYPE "public"."stores_type_enum" AS ENUM('CAFE', 'RESTAURANT', 'RETAIL', 'SALON', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "public"."stores_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(`CREATE TABLE "stores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "owner_id" uuid NOT NULL, "name" character varying(200) NOT NULL, "type" "public"."stores_type_enum" NOT NULL, "address" text, "latitude" numeric(10,8), "longitude" numeric(11,8), "gps_radius" integer NOT NULL DEFAULT '50', "status" "public"."stores_status_enum" NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7aa6e7d71fa7acdd7ca43d7c9cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('OWNER', 'EMPLOYEE', 'MANAGER', 'PARTNER', 'ADMIN')`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "name" character varying(100) NOT NULL, "phone" character varying(20), "role" "public"."users_role_enum" NOT NULL DEFAULT 'EMPLOYEE', "status" "public"."users_status_enum" NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_2d83c53c3e553a48dadb9722e38" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_c7da9c52c80593b9b657051923a" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stores" ADD CONSTRAINT "FK_c03f4f73d83362cabb34dfa9418" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "FK_c03f4f73d83362cabb34dfa9418"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_c7da9c52c80593b9b657051923a"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_2d83c53c3e553a48dadb9722e38"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "stores"`);
        await queryRunner.query(`DROP TYPE "public"."stores_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."stores_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."idx_employee_unique_active"`);
        await queryRunner.query(`DROP TABLE "employees"`);
        await queryRunner.query(`DROP TYPE "public"."employees_status_enum"`);
    }

}
