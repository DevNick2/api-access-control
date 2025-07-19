import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBaseTable1752889104215 implements MigrationInterface {
    name = 'CreateBaseTable1752889104215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "role" ("id" SERIAL NOT NULL, "code" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "can_read_people" boolean DEFAULT false, "can_write_people" boolean DEFAULT false, "can_read_devices" boolean DEFAULT false, "can_write_devices" boolean DEFAULT false, "can_read_access_rules" boolean DEFAULT false, "can_write_access_rules" boolean DEFAULT false, "can_read_company_dashboard" boolean DEFAULT false, CONSTRAINT "UQ_ee999bb389d7ac0fd967172c41f" UNIQUE ("code"), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_profile_enum" AS ENUM('admin', 'manager', 'user')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "code" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "profile" "public"."user_profile_enum" NOT NULL, "is_temporary_password" boolean NOT NULL, "last_login_at" TIMESTAMP WITH TIME ZONE, "otp_code" integer, "otp_code_expires_at" TIMESTAMP WITH TIME ZONE, "role_id" integer, CONSTRAINT "UQ_c5f78ad8f82e492c25d07f047a5" UNIQUE ("code"), CONSTRAINT "REL_fb2e442d14add3cefbdf33c456" UNIQUE ("role_id"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_fb2e442d14add3cefbdf33c4561" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_fb2e442d14add3cefbdf33c4561"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_profile_enum"`);
        await queryRunner.query(`DROP TABLE "role"`);
    }

}
