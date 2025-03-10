ALTER TABLE "visits" ALTER COLUMN "diagnosis" SET DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "visits" ALTER COLUMN "prescription" SET DEFAULT '[]'::json;