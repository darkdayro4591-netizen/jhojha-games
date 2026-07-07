CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY,
	"order_id" integer,
	"order_ref" text NOT NULL,
	"transaction_id" text,
	"customer_name" text NOT NULL,
	"verification_result" text NOT NULL,
	"admin_action" text,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL UNIQUE,
	"category" text DEFAULT 'Action' NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"sale_price" numeric(10,2) NOT NULL,
	"original_price" numeric(10,2) NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"badge" text,
	"description" text DEFAULT '' NOT NULL,
	"steam_url" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"in_stock" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ocr_token_uses" (
	"jti" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY,
	"order_ref" text NOT NULL UNIQUE,
	"customer_name" text NOT NULL,
	"instagram" text NOT NULL,
	"email" text,
	"telegram" text,
	"game_name" text NOT NULL,
	"expected_amount" numeric(10,2) NOT NULL,
	"submitted_amount" numeric(10,2) NOT NULL,
	"screenshot_file" text,
	"screenshot_hash" text,
	"steam_username" text,
	"steam_password" text,
	"payment_method" text DEFAULT 'upi' NOT NULL,
	"payment_status" text DEFAULT 'pending_verification' NOT NULL,
	"failure_reason" text,
	"upi_transaction_id" text,
	"ocr_amount" numeric(10,2),
	"ocr_date" text,
	"ocr_time" text,
	"ocr_receiver" text,
	"ocr_raw_status" text,
	"verification_mode" text,
	"verification_result" text,
	"fraud_detected" boolean DEFAULT false NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"verified_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "orders_payment_status_idx" ON "orders" ("payment_status");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_order_ref_uidx" ON "orders" ("order_ref");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_upi_transaction_id_uidx" ON "orders" ("upi_transaction_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_screenshot_hash_uidx" ON "orders" ("screenshot_hash");--> statement-breakpoint
CREATE INDEX "orders_instagram_idx" ON "orders" ("instagram");--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id");