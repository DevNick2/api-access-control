import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBaseTable1753323108224 implements MigrationInterface {
    name = 'CreateBaseTable1753323108224'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "role" ("id" SERIAL NOT NULL, "code" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "can_read_company_dashboard" boolean DEFAULT false, "can_write_companies" boolean DEFAULT false, "can_read_companies" boolean DEFAULT false, "can_write_company_users" boolean DEFAULT false, "can_read_company_users" boolean DEFAULT false, "can_read_people" boolean DEFAULT false, "can_write_people" boolean DEFAULT false, "can_read_devices" boolean DEFAULT false, "can_write_devices" boolean DEFAULT false, "can_read_access_rules" boolean DEFAULT false, "can_write_access_rules" boolean DEFAULT false, CONSTRAINT "UQ_ee999bb389d7ac0fd967172c41f" UNIQUE ("code"), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "device" ("id" SERIAL NOT NULL, "code" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "ip_address" character varying NOT NULL, "is_active" boolean NOT NULL, "user" character varying NOT NULL, "password" character varying NOT NULL, "iv" character varying NOT NULL, "companyId" integer NOT NULL, CONSTRAINT "UQ_f443a15b68542d0a53a2b8c4723" UNIQUE ("code"), CONSTRAINT "PK_2dc10972aa4e27c01378dad2c72" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."person_person_type_enum" AS ENUM('employee', 'visitor', 'service_provider')`);
        await queryRunner.query(`CREATE TABLE "person" ("id" SERIAL NOT NULL, "code" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "registration" character varying NOT NULL, "email" character varying, "photo_url" character varying NOT NULL, "person_type" "public"."person_person_type_enum" NOT NULL, "is_active" boolean NOT NULL, "company_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "UQ_f4d2a1a6767e8b4c143642a991a" UNIQUE ("code"), CONSTRAINT "PK_5fdaf670315c4b7e70cce85daa3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "company" ("id" SERIAL NOT NULL, "code" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "cnpj" character varying NOT NULL, "domain" character varying NOT NULL, "logo_url" character varying, "primary_color" character varying, CONSTRAINT "UQ_711bd226b17871ae73cecca8f79" UNIQUE ("code"), CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_profile_enum" AS ENUM('admin', 'manager', 'user')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "code" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "profile" "public"."user_profile_enum" NOT NULL, "is_temporary_password" boolean NOT NULL, "last_login_at" TIMESTAMP WITH TIME ZONE, "otp_code" integer, "otp_code_expires_at" TIMESTAMP WITH TIME ZONE, "role_id" integer, "company_id" integer, CONSTRAINT "UQ_c5f78ad8f82e492c25d07f047a5" UNIQUE ("code"), CONSTRAINT "REL_fb2e442d14add3cefbdf33c456" UNIQUE ("role_id"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "device" ADD CONSTRAINT "FK_87fcb97a7acb193102cfb50acd4" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "person" ADD CONSTRAINT "FK_0dd3c460a540ec2963881e0912b" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "person" ADD CONSTRAINT "FK_5157fa65538cae06e66c922c898" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_fb2e442d14add3cefbdf33c4561" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_9e70b5f9d7095018e86970c7874" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_9e70b5f9d7095018e86970c7874"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_fb2e442d14add3cefbdf33c4561"`);
        await queryRunner.query(`ALTER TABLE "person" DROP CONSTRAINT "FK_5157fa65538cae06e66c922c898"`);
        await queryRunner.query(`ALTER TABLE "person" DROP CONSTRAINT "FK_0dd3c460a540ec2963881e0912b"`);
        await queryRunner.query(`ALTER TABLE "device" DROP CONSTRAINT "FK_87fcb97a7acb193102cfb50acd4"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_profile_enum"`);
        await queryRunner.query(`DROP TABLE "company"`);
        await queryRunner.query(`DROP TABLE "person"`);
        await queryRunner.query(`DROP TYPE "public"."person_person_type_enum"`);
        await queryRunner.query(`DROP TABLE "device"`);
        await queryRunner.query(`DROP TABLE "role"`);
    }

}
