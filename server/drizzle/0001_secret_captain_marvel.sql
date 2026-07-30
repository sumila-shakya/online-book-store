CREATE TABLE `book_listings` (
	`listing_id` serial AUTO_INCREMENT NOT NULL,
	`seller_id` bigint unsigned NOT NULL,
	`isbn` varchar(20) NOT NULL,
	`price` decimal(8,2) NOT NULL,
	`listing_status` enum('available','sold') NOT NULL DEFAULT 'available',
	`book_condition` enum('like_new','very_good','good','fair','poor') NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `book_listings_listing_id` PRIMARY KEY(`listing_id`),
	CONSTRAINT `price_chk` CHECK(`book_listings`.`price` >= 0)
);
--> statement-breakpoint
ALTER TABLE `book_listings` ADD CONSTRAINT `book_listings_seller_id_users_user_id_fk` FOREIGN KEY (`seller_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `isbn_idx` ON `book_listings` (`isbn`);