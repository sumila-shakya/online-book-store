CREATE TABLE `orders` (
	`order_id` serial AUTO_INCREMENT NOT NULL,
	`seller_id` bigint unsigned NOT NULL,
	`buyer_id` bigint unsigned NOT NULL,
	`listing_id` bigint unsigned NOT NULL,
	`order_status` enum('pending','product_received','successful','cancelled','failed') NOT NULL DEFAULT 'pending',
	`buyer_verified_at` timestamp,
	`seller_verified_at` timestamp,
	`ordered_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_order_id` PRIMARY KEY(`order_id`)
);
--> statement-breakpoint
ALTER TABLE `book_listings` RENAME COLUMN `created_at` TO `listed_at`;--> statement-breakpoint
ALTER TABLE `book_listings` MODIFY COLUMN `listing_status` enum('available','reserved','sold') NOT NULL DEFAULT 'available';--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_seller_id_users_user_id_fk` FOREIGN KEY (`seller_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_buyer_id_users_user_id_fk` FOREIGN KEY (`buyer_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_listing_id_book_listings_listing_id_fk` FOREIGN KEY (`listing_id`) REFERENCES `book_listings`(`listing_id`) ON DELETE cascade ON UPDATE cascade;