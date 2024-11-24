ALTER TABLE "defaults" ADD PRIMARY KEY ("organization_id");--> statement-breakpoint
ALTER TABLE "defaults" DROP COLUMN IF EXISTS "id";