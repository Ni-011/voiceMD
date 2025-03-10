ALTER TABLE "visits" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "visits" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;