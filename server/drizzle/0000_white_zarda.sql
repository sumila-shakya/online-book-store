CREATE TABLE `refresh_tokens` (
	`token_id` serial AUTO_INCREMENT NOT NULL,
	`token` varchar(512) NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `refresh_tokens_token_id` PRIMARY KEY(`token_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`user_id` serial AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255),
	`google_id` varchar(255),
	`auth_provider` enum('local','google') NOT NULL DEFAULT 'local',
	`name` varchar(100) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_user_id` PRIMARY KEY(`user_id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_google_id_unique` UNIQUE(`google_id`)
);
--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_users_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `refresh_tokens` (`user_id`);