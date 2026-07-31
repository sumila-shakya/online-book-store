CREATE TABLE `books_catalogue` (
	`book_id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`isbn` varchar(20),
	`description` text,
	`author` varchar(500),
	`image_url` varchar(500),
	`book_source` enum('manual','google') NOT NULL,
	CONSTRAINT `books_catalogue_book_id` PRIMARY KEY(`book_id`)
);
--> statement-breakpoint
ALTER TABLE `book_listings` RENAME COLUMN `isbn` TO `book_id`;--> statement-breakpoint
DROP INDEX `isbn_idx` ON `book_listings`;--> statement-breakpoint
ALTER TABLE `book_listings` MODIFY COLUMN `book_id` bigint unsigned NOT NULL;--> statement-breakpoint
ALTER TABLE `book_listings` ADD CONSTRAINT `book_listings_book_id_books_catalogue_book_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books_catalogue`(`book_id`) ON DELETE cascade ON UPDATE cascade;