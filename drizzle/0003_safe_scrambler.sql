CREATE TABLE `themes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`gradient_class` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`theme_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`theme_id`) REFERENCES `themes`(`id`) ON UPDATE no action ON DELETE set null
);
