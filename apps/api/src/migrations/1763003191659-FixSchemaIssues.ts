import { MigrationInterface, QueryRunner } from "typeorm";

export class FixSchemaIssues1763003191659 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Fix 1: Change employees.hourly_wage from decimal(10,2) to integer
        // Korean won doesn't need decimal places
        await queryRunner.query(`
            ALTER TABLE employees
            ALTER COLUMN hourly_wage TYPE integer
            USING CASE
                WHEN hourly_wage IS NULL THEN NULL
                ELSE ROUND(hourly_wage)::integer
            END
        `);

        // Fix 2: Set employees.hired_at to NOT NULL
        // First, update any NULL values to use created_at as default
        await queryRunner.query(`
            UPDATE employees
            SET hired_at = DATE(created_at)
            WHERE hired_at IS NULL
        `);
        await queryRunner.query(`
            ALTER TABLE employees
            ALTER COLUMN hired_at SET NOT NULL
        `);

        // Add missing indexes for performance
        await queryRunner.query(`CREATE INDEX "idx_users_role" ON "users" ("role")`);
        await queryRunner.query(`CREATE INDEX "idx_stores_owner_id" ON "stores" ("owner_id")`);
        await queryRunner.query(`CREATE INDEX "idx_stores_type" ON "stores" ("type")`);
        await queryRunner.query(`CREATE INDEX "idx_employees_user_id" ON "employees" ("user_id")`);
        await queryRunner.query(`CREATE INDEX "idx_employees_store_id" ON "employees" ("store_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove indexes
        await queryRunner.query(`DROP INDEX "public"."idx_employees_store_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_employees_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_stores_type"`);
        await queryRunner.query(`DROP INDEX "public"."idx_stores_owner_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_users_role"`);

        // Revert hired_at to nullable
        await queryRunner.query(`
            ALTER TABLE employees
            ALTER COLUMN hired_at DROP NOT NULL
        `);

        // Revert hourly_wage to decimal(10,2)
        await queryRunner.query(`
            ALTER TABLE employees
            ALTER COLUMN hourly_wage TYPE numeric(10,2)
            USING hourly_wage::numeric(10,2)
        `);
    }

}
