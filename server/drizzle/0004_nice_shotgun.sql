CREATE TABLE `otps` (
	`token_id` serial AUTO_INCREMENT NOT NULL,
	`otp` varchar(512) NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `otps_token_id` PRIMARY KEY(`token_id`)
);
--> statement-breakpoint
CREATE TABLE `review` (
	`review_id` serial AUTO_INCREMENT NOT NULL,
	`reviewer_id` bigint unsigned NOT NULL,
	`reviewee_id` bigint unsigned NOT NULL,
	`order_id` bigint unsigned NOT NULL,
	`rating` smallint NOT NULL,
	`reviewed_at` timestamp DEFAULT (now()),
	CONSTRAINT `review_review_id` PRIMARY KEY(`review_id`),
	CONSTRAINT `unique_reviewer` UNIQUE(`order_id`,`reviewer_id`),
	CONSTRAINT `unique_reviewee` UNIQUE(`order_id`,`reviewee_id`),
	CONSTRAINT `rating_chk` CHECK(`review`.`rating` BETWEEN 1 AND 5)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `avg_seller_rating` decimal(8,2);--> statement-breakpoint
ALTER TABLE `users` ADD `avg_buyer_rating` decimal(8,2);--> statement-breakpoint
ALTER TABLE `users` ADD `seller_review_sum` bigint unsigned DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `buyer_review_sum` bigint unsigned DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `seller_review_count` bigint unsigned DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `buyer_review_count` bigint unsigned DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `phone_no` varchar(13);--> statement-breakpoint
ALTER TABLE `users` ADD `is_verified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_phone_no_unique` UNIQUE(`phone_no`);--> statement-breakpoint
ALTER TABLE `otps` ADD CONSTRAINT `otps_user_id_users_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `review` ADD CONSTRAINT `review_reviewer_id_users_user_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `review` ADD CONSTRAINT `review_reviewee_id_users_user_id_fk` FOREIGN KEY (`reviewee_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `review` ADD CONSTRAINT `review_order_id_orders_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `otps` (`user_id`);--> statement-breakpoint
CREATE INDEX `rating_idx` ON `review` (`rating`);--> statement-breakpoint
CREATE INDEX `isbn_idx` ON `books_catalogue` (`isbn`);