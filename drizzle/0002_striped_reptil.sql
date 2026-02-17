CREATE TABLE "i18n_strings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"geo" text NOT NULL,
	"en" text NOT NULL,
	"ru" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "name_geo" varchar(120);--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "name_en" varchar(120);--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "name_ru" varchar(120);--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "description_geo" text;--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "description_en" text;--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "description_ru" text;--> statement-breakpoint
UPDATE "cars"
SET
	"name_geo" = "name",
	"name_en" = "name",
	"name_ru" = "name",
	"description_geo" = "description",
	"description_en" = "description",
	"description_ru" = "description";--> statement-breakpoint
ALTER TABLE "cars" ALTER COLUMN "name_geo" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cars" ALTER COLUMN "name_en" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cars" ALTER COLUMN "name_ru" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cars" ALTER COLUMN "description_geo" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cars" ALTER COLUMN "description_en" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cars" ALTER COLUMN "description_ru" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "i18n_strings_key_idx" ON "i18n_strings" USING btree ("key");
