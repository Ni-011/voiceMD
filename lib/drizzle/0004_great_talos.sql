ALTER TABLE "visits" RENAME COLUMN "prescription" TO "prescriptions";--> statement-breakpoint
ALTER TABLE "visits" ADD COLUMN "precautions" json DEFAULT '[]'::json;