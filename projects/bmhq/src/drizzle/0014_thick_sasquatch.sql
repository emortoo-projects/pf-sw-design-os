CREATE TABLE "mcp_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"resource_type" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"uri" text NOT NULL,
	"schema" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"access_control" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mcp_resources" ADD CONSTRAINT "mcp_resources_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;