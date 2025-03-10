CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"age" integer,
	"gender" varchar(255) NOT NULL,
	"phone" varchar(255),
	"email" varchar(255),
	"address" varchar(255),
	"medicalHistory" json DEFAULT '{}'::json
);
--> statement-breakpoint
CREATE TABLE "visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"diagnosis" json DEFAULT '{}'::json,
	"prescription" json DEFAULT '{}'::json,
	"patientId" uuid
);
--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_patientId_patients_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;