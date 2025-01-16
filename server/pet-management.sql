-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 13, 2025 at 12:06 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pet-management`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointment`
--

CREATE TABLE `appointment` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `pet_id` bigint(20) UNSIGNED DEFAULT NULL,
  `owner_name` varchar(255) DEFAULT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `reason_for_visit` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `appointment`
--

INSERT INTO `appointment` (`id`, `user_id`, `pet_id`, `owner_name`, `appointment_date`, `appointment_time`, `reason_for_visit`, `created_at`, `updated_at`) VALUES
(13, 101, 201, 'John Doe', '2025-01-20', '14:00:00', 'Routine check-up', '2025-01-13 10:00:05', '2025-01-13 10:00:05'),
(14, 102, 202, 'Jane Smith', '2025-01-21', '15:30:00', 'Vaccination', '2025-01-13 10:00:05', '2025-01-13 10:00:05'),
(15, NULL, NULL, 'Michael Johnson', '2025-01-22', '16:00:00', 'Emergency', '2025-01-13 10:00:05', '2025-01-13 10:00:05');

-- --------------------------------------------------------

--
-- Table structure for table `appointment_reason`
--

CREATE TABLE `appointment_reason` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `appointment_id` bigint(20) UNSIGNED NOT NULL,
  `reason_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `user_id`, `name`, `slug`, `created_at`, `updated_at`) VALUES
(1, 1, 'Food', 'Food', NULL, NULL),
(2, 1, 'Toy', 'Toy', NULL, NULL),
(3, 1, 'Grooming', 'Grooming', NULL, NULL),
(4, 1, 'Medicine', 'Medicine', NULL, NULL),
(5, 1, 'Accessory', 'Accessory', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conversation_user`
--

CREATE TABLE `conversation_user` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `conversation_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `account_holder` varchar(255) DEFAULT NULL,
  `account_number` varchar(255) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `uuid`, `user_id`, `name`, `email`, `phone`, `address`, `photo`, `account_holder`, `account_number`, `bank_name`, `created_at`, `updated_at`) VALUES
(1, '292dc615-973b-4c21-adee-9d8f3a44f6b0', 1, 'Dr. Javon Marks', 'waters.berry@example.org', '+12795819941', '324 Bernier Groves Suite 646\nNorth John, TN 09438', NULL, 'Dr. Kiley Bauch III', '20248947', 'BRI', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(2, '7d3c925b-30e8-429b-a73b-3f79c52d8c05', 1, 'Dr. Kristina Thiel', 'kristy07@example.net', '+1.848.963.1241', '958 Little Terrace Apt. 127\nLake Osborne, GA 56470-8705', NULL, 'Susana Brown', '10784288', 'Mandiri', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(3, '3e29c121-91d2-433f-9ba2-3fbb97be2d54', 1, 'Darrick Dare', 'ines.brown@example.com', '+1-318-772-9617', '20772 Bogisich Wells\nLake Deondrestad, WV 00300', NULL, 'Daphne Hamill', '36892252', 'Mandiri', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(4, 'c9c26e33-11a5-4787-9cc8-4d0f6b48f5e3', 1, 'Eleanora Hilpert', 'gleichner.irving@example.org', '503.670.5792', '3260 Tatyana Cove\nNew Arnoldoborough, ID 78827-8517', NULL, 'Alexandrea Schneider', '36064168', 'BNI', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(5, '88e71837-0b65-4485-8b27-54aea4e3e46f', 1, 'Carmine Mertz', 'jasper80@example.net', '956-628-3109', '90297 Botsford Mount Suite 478\nMallieberg, NJ 64928', NULL, 'Fay McDermott', '42995225', 'BSI', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(6, 'd1173f24-db69-461b-940f-2e3d4b196ef3', 1, 'Felipe Murphy', 'adolphus03@example.net', '(925) 397-6654', '7181 Brigitte Views Suite 155\nLloydchester, ND 71201', NULL, 'Miss Ressie Rempel', '12881719', 'BCA', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(7, '8bb98f61-7670-4c14-ba62-80561e80597d', 1, 'Prof. Roderick Hammes IV', 'berry.upton@example.net', '(601) 273-3090', '3722 Dare Burg\nAdamsville, KS 50759-4776', NULL, 'Timmothy Torp', '69093554', 'BRI', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(8, '42eeccdb-b4ae-4db5-9c7b-946b71b8bdae', 1, 'Lesly Stark DVM', 'myrtice36@example.net', '+1-440-561-7321', '80168 Corkery Stravenue\nCollinsburgh, AR 53562', NULL, 'Johanna Howell', '16769075', 'Mandiri', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(9, '84df21bc-bdb7-4f5d-8bb8-b03d451f3f18', 1, 'Ms. Abigayle Nolan PhD', 'addie.williamson@example.net', '+18038948482', '6973 Batz Flats Apt. 224\nEduardoville, NJ 83766', NULL, 'Savanna Wilderman', '80619025', 'BNI', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(10, 'f97c801a-055b-4b33-991e-51a5b9131527', 1, 'Etha Schamberger I', 'sabrina.jerde@example.net', '(940) 349-6634', '946 Kilback Green Apt. 534\nOscarmouth, MA 74150', NULL, 'Mrs. Flo Ratke', '24591152', 'BNI', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(11, 'd508cfa4-8f64-4d4c-a51c-c00555c99e32', 1, 'Maureen Feeney', 'monty50@example.com', '1-843-517-2695', '51674 Schamberger Plaza\nOletamouth, NC 09948-8599', NULL, 'Rowena Greenfelder', '50977896', 'BRI', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(12, '0a858183-e833-44eb-85df-ee72ad14800e', 1, 'Jayne Bashirian', 'mireya.spencer@example.net', '(302) 306-1712', '75959 Littel Cliff\nPort Lexieville, ND 66823-8383', NULL, 'Alia Fadel DVM', '95021396', 'BNI', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(13, '1c3b8dca-f7c8-4de8-a3dc-c96b9b649d0d', 1, 'Buster Moen', 'lysanne.turner@example.net', '+1 (480) 504-8745', '671 Hattie Highway Apt. 974\nMargieville, ID 11999', NULL, 'Gabrielle Boyle', '58650979', 'BSI', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(14, '27029436-91f3-4ff4-83a1-04e0c5d6a164', 1, 'Kenyatta Nitzsche', 'vsanford@example.net', '+1-346-760-5235', '3101 Mayert Estate Apt. 856\nBogisichberg, NC 65259-6006', NULL, 'Maymie Von', '43569864', 'BCA', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(15, 'e7da7c15-954a-4df8-9086-3e24a1405b46', 1, 'Prof. Juanita Kassulke MD', 'weimann.benny@example.com', '+1-540-663-3451', '358 Lockman Station\nKesslerfort, LA 64330', NULL, 'Lauriane Leannon III', '47136281', 'BRI', '2024-11-20 20:57:38', '2024-11-20 20:57:38');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2014_10_12_000000_create_users_table', 1),
(2, '2014_10_12_100000_create_password_reset_tokens_table', 1),
(3, '2019_08_19_000000_create_failed_jobs_table', 1),
(4, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(5, '2023_04_30_150318_create_customers_table', 1),
(6, '2023_05_01_111143_create_suppliers_table', 1),
(7, '2023_05_02_114617_create_categories_table', 1),
(8, '2023_05_02_122454_create_units_table', 1),
(9, '2023_05_02_140630_create_products_table', 1),
(10, '2023_05_04_084431_create_orders_table', 1),
(11, '2023_05_04_084646_create_order_details_table', 1),
(12, '2023_05_04_173440_create_shoppingcart_table', 1),
(13, '2023_05_06_142348_create_purchases_table', 1),
(14, '2023_05_06_143104_create_purchase_details_table', 1),
(15, '2023_11_03_140528_create_quotations_table', 1),
(16, '2023_11_03_140529_create_quotation_details_table', 1),
(17, '2023_11_17_183122_create_notifications_table', 1),
(18, '2024_08_23_180916_manage_foreign_keys', 1),
(19, '2024_09_12_000001_create_conversations_table', 1),
(20, '2024_09_12_205549_create_messages_table', 1),
(21, '2024_09_12_221902_add_role_to_users_table', 1),
(22, '2024_09_13_000000_create_conversation_user_table', 1),
(23, '2024_09_13_071701_add_default_to_uuid_in_users_table', 1),
(24, '2024_09_14_000802_add_pet_columns_to_users_table', 1),
(25, '2025_01_10_210724_add_gender_and_weight_to_pets_table', 2),
(26, '2025_01_10_220111_add_user_id_to_pets_table', 1),
(27, '2025_01_11_205306_add_owner_name_to_appointment_table', 3),
(28, '2025_01_12_051158_update_owner_name_in_pets_table', 4),
(30, '2025_01_12_055517_make_user_id_nullable_in_pets_table', 5),
(31, '2025_01_12_062738_create_appointment_table', 6),
(32, '2025_01_12_063858_add_categories_to_appointment_table', 7),
(33, '2025_01_12_064608_add_user_id_to_appointment_table', 8),
(34, '2025_01_13_012821_add_pet_details_to_appointment_table', 9),
(35, '2025_01_13_021509_create_reasons_table', 10),
(36, '2025_01_13_030821_create_appointment_table', 11);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `type` varchar(255) NOT NULL,
  `notifiable_type` varchar(255) NOT NULL,
  `notifiable_id` bigint(20) UNSIGNED NOT NULL,
  `data` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `order_date` varchar(255) NOT NULL,
  `order_status` tinyint(4) NOT NULL COMMENT '0 - Pending / 1 - Complete',
  `total_products` int(11) NOT NULL,
  `sub_total` int(11) NOT NULL,
  `vat` int(11) NOT NULL,
  `total` int(11) NOT NULL,
  `invoice_no` varchar(255) NOT NULL,
  `payment_type` varchar(255) NOT NULL,
  `pay` int(11) NOT NULL,
  `due` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_details`
--

CREATE TABLE `order_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL,
  `unitcost` int(11) NOT NULL,
  `total` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'YourAppName', '767c31d52c56c0bece1bbe8a6e59da3ba2b5d0f38ca99487a0e9608f663fbd50', '[\"*\"]', NULL, NULL, '2024-11-27 11:20:06', '2024-11-27 11:20:06'),
(2, 'App\\Models\\User', 1, 'YourAppName', '43ff003ac2d7b6ee54c90cc95a0513aa30642e1ef88838faa48b4f94c470bfce', '[\"*\"]', NULL, NULL, '2025-01-10 12:13:40', '2025-01-10 12:13:40'),
(3, 'App\\Models\\User', 1, 'YourAppName', 'fb212d3fdc673bc61e984a2b5f872303723ab24c97a3def4b78da17aad8e97cd', '[\"*\"]', NULL, NULL, '2025-01-10 19:23:57', '2025-01-10 19:23:57'),
(4, 'App\\Models\\User', 1, 'YourAppName', 'dc1146872c5d861eba7bda2019e449eec223c4a26219cb98247699366552dab2', '[\"*\"]', NULL, NULL, '2025-01-11 09:16:24', '2025-01-11 09:16:24');

-- --------------------------------------------------------

--
-- Table structure for table `pets`
--

CREATE TABLE `pets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `breed` varchar(255) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `owner_name` varchar(255) DEFAULT NULL,
  `allergies` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `category` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `weight` float DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `size` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pets`
--

INSERT INTO `pets` (`id`, `user_id`, `name`, `type`, `breed`, `age`, `owner_name`, `allergies`, `notes`, `category`, `created_at`, `updated_at`, `gender`, `weight`, `photo`, `size`) VALUES
(7, 3, 'Doggy', 'Dog', 'Shitzu', 3, NULL, NULL, NULL, 'Mammal', '2025-01-11 21:37:14', '2025-01-11 21:37:14', 'Male', 50, NULL, NULL),
(8, 4, 'Doggy', 'Dog', 'Shitzu', 4, NULL, NULL, NULL, 'Mammal', '2025-01-11 21:44:27', '2025-01-11 21:44:27', 'Male', 50, 'pet_photos/wBUL8fjPFkFdQWWQDRtHFvgC2EyJ5JtRaVj7Ugcg.png', NULL),
(9, 4, 'Raizel2', 'Dog', 'Shitzu', 5, NULL, NULL, NULL, 'Mammal', '2025-01-11 21:53:50', '2025-01-11 21:53:50', 'Male', 50, NULL, NULL),
(10, 3, 'Doggy', 'Dog', 'Shitzu', 5, NULL, 'None', 'None', 'Mammal', '2025-01-11 21:57:34', '2025-01-11 22:16:40', 'Male', 50, 'pet_photos/m4qgC7J1W60QQeIXoYxrRGXRHlTMkhYpioVSq6Dj.png', NULL),
(201, 101, 'Buddy', 'Dog', NULL, NULL, NULL, NULL, NULL, '', '2025-01-13 09:59:59', '2025-01-13 09:59:59', NULL, NULL, NULL, NULL),
(202, 102, 'Mittens', 'Cat', NULL, NULL, NULL, NULL, NULL, '', '2025-01-13 09:59:59', '2025-01-13 09:59:59', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `buying_price` int(11) NOT NULL COMMENT 'Buying Price',
  `selling_price` int(11) NOT NULL COMMENT 'Selling Price',
  `quantity_alert` int(11) NOT NULL,
  `tax` int(11) DEFAULT NULL,
  `tax_type` tinyint(4) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `product_image` varchar(255) DEFAULT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `unit_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `uuid`, `user_id`, `name`, `slug`, `code`, `quantity`, `buying_price`, `selling_price`, `quantity_alert`, `tax`, `tax_type`, `notes`, `product_image`, `category_id`, `unit_id`, `created_at`, `updated_at`) VALUES
(1, '75b5b410-da75-4615-bb75-0c413a2a4ee3', 1, 'iPhone 14 Pro', 'iphone-14-pro', '1', 10, 90000, 140000, 10, 24, 1, NULL, 'assets/img/products/ip14.png', 3, 3, '2024-11-20 20:57:37', '2024-11-20 20:57:37'),
(2, 'a8b7b043-2db8-4480-8ef5-a395cb3f400b', 1, 'ASUS Laptop', 'asus-laptop', '2', 10, 90000, 140000, 10, 24, 1, NULL, 'assets/img/products/ip14.png', 1, 3, '2024-11-20 20:57:37', '2024-11-20 20:57:37'),
(3, 'd344998d-f607-46e4-9c4c-3d05e10419af', 1, 'Logitech Keyboard', 'logitech-keyboard', '3', 10, 90000, 140000, 10, 24, 1, NULL, 'assets/img/products/keyboard.jpg', 2, 3, '2024-11-20 20:57:37', '2024-11-20 20:57:37'),
(4, '62f5cd0a-bf2f-4bf0-bd2a-a0b926c28f9b', 1, 'Logitech Speakers', 'logitech-speakers', '4', 10, 90000, 140000, 10, 24, 1, NULL, 'assets/img/products/speaker.png', 4, 3, '2024-11-20 20:57:37', '2024-11-20 20:57:37'),
(5, '8c4be278-a94b-4e76-8448-6d91945f1fab', 1, 'AutoCAD v7.0', 'autocad-v7.0', '5', 10, 90000, 140000, 10, 24, 1, NULL, 'assets/img/products/autocard.png', 5, 3, '2024-11-20 20:57:37', '2024-11-20 20:57:37');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `supplier_id` bigint(20) UNSIGNED NOT NULL,
  `date` varchar(255) NOT NULL,
  `purchase_no` varchar(255) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '0=Pending, 1=Approved',
  `total_amount` int(11) NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `uuid` char(36) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_details`
--

CREATE TABLE `purchase_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `purchase_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL,
  `unitcost` int(11) NOT NULL,
  `total` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quotations`
--

CREATE TABLE `quotations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `reference` varchar(255) NOT NULL,
  `customer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `tax_percentage` int(11) NOT NULL DEFAULT 0,
  `tax_amount` int(11) NOT NULL DEFAULT 0,
  `discount_percentage` int(11) NOT NULL DEFAULT 0,
  `discount_amount` int(11) NOT NULL DEFAULT 0,
  `shipping_amount` int(11) NOT NULL DEFAULT 0,
  `total_amount` int(11) NOT NULL,
  `status` tinyint(4) NOT NULL COMMENT '0 - Pending / 1 - Complete / 2 - Cancel',
  `note` text DEFAULT NULL,
  `uuid` char(36) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quotation_details`
--

CREATE TABLE `quotation_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `quotation_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_code` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` int(11) NOT NULL,
  `unit_price` int(11) NOT NULL,
  `sub_total` int(11) NOT NULL,
  `product_discount_amount` int(11) NOT NULL,
  `product_discount_type` varchar(255) NOT NULL DEFAULT 'fixed',
  `product_tax_amount` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reasons`
--

CREATE TABLE `reasons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shoppingcart`
--

CREATE TABLE `shoppingcart` (
  `identifier` varchar(255) NOT NULL,
  `instance` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `shopname` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `account_holder` varchar(255) DEFAULT NULL,
  `account_number` varchar(255) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `uuid`, `user_id`, `name`, `email`, `phone`, `address`, `shopname`, `type`, `photo`, `account_holder`, `account_number`, `bank_name`, `created_at`, `updated_at`) VALUES
(1, '74f958c1-5ed4-42fe-96fb-d5c08fb91480', 1, 'Vanessa Gleichner', 'creynolds@example.org', '+1 (551) 229-5052', '962 Bernier Islands\nCurtisfurt, WI 37628', 'Koepp-Lockman', 'producer', NULL, 'Roxanne Nitzsche', '24601964', 'BNI', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(2, '2aa33ea9-0c36-4b9b-ab60-e55fc5fe232f', 1, 'Lamont Torp DDS', 'jhaley@example.org', '1-234-608-5754', '564 Cronin Mountains Apt. 093\nHaagport, ME 46150-1430', 'Moen-Romaguera', 'wholesaler', NULL, 'Mrs. Keara Bergnaum', '38806352', 'BCA', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(3, '5652ce06-b4ed-493f-856a-01dbd4a9f414', 1, 'Chelsey Fadel', 'amanda.hill@example.org', '1-858-700-7201', '74671 Chaim Light Apt. 764\nHeaneymouth, RI 30684-6482', 'Dibbert, Kerluke and Homenick', 'wholesaler', NULL, 'Tate Dickens', '21163705', 'Mandiri', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(4, '199651e2-4ceb-42e9-a01c-c9b511174a5e', 1, 'Marian O\'Conner', 'beatrice63@example.org', '+1.217.899.4746', '543 Dudley Avenue Suite 844\nNew Maximoport, FL 85426-8035', 'Auer-Rolfson', 'wholesaler', NULL, 'Dr. Warren Keebler DVM', '73586573', 'BSI', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(5, 'dfd179d0-3cd8-4908-b088-00ed7fed7072', 1, 'Durward Lakin PhD', 'dkris@example.com', '(412) 563-5493', '9270 Mohr Corner\nNorth Jolieland, OK 83727', 'Sanford PLC', 'producer', NULL, 'Gabriella Gorczany', '79946094', 'Mandiri', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(6, '0e3d64b8-a0ab-4c65-b56f-73467264d4ea', 1, 'Shaniya Harber', 'koch.melvina@example.org', '540-518-7374', '6167 Gerhold Loaf\nPort Madalynfort, RI 76348-7554', 'Kuhn Ltd', 'producer', NULL, 'Kameron Prohaska Sr.', '49049846', 'Mandiri', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(7, '35bd1d3f-b9d2-485d-8bcc-4f49916759ea', 1, 'Jasper Kshlerin', 'nikko33@example.net', '+1-435-203-0560', '403 Gaylord Cape\nLucienneview, OK 40295', 'Purdy, Franecki and Okuneva', 'producer', NULL, 'Zita Murazik', '60557359', 'BRI', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(8, 'd4a18c44-4adb-409b-875b-47a4c99edf55', 1, 'Clarissa Marquardt', 'oswaniawski@example.com', '+1-937-503-7183', '7009 Lane Corner\nFritschfurt, IA 30530-2760', 'Gulgowski PLC', 'distributor', NULL, 'Eleonore Balistreri', '34871392', 'BSI', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(9, '44cbf961-e0af-4c1b-b48d-8b47d3dcc3fc', 1, 'Albertha Kovacek', 'cyrus24@example.org', '631.510.6458', '5701 Stehr Parks\nGerlachville, KY 94084', 'Cummerata-Sipes', 'distributor', NULL, 'Prof. Granville Ritchie Jr.', '31061771', 'BRI', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(10, '44b55266-7cef-4dc4-b8ad-238a0ee23503', 1, 'Humberto Kuhn', 'fahey.cayla@example.org', '478.381.9488', '897 Bergnaum Rapid\nBechtelarmouth, WV 01193', 'Schmitt and Sons', 'wholesaler', NULL, 'Nella Weissnat MD', '46574341', 'BRI', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(11, 'fc2d1c9a-3edc-4a98-a8d8-e7e5ed49abb4', 1, 'Antonette Hegmann', 'ankunding.mike@example.net', '+1-770-722-5515', '277 Cedrick Camp\nNorth Mariam, HI 37855-0995', 'Prohaska-Hyatt', 'distributor', NULL, 'Dr. Tyra Abernathy III', '47742553', 'BSI', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(12, '3fea428b-e6fe-4ec6-8b44-a91b06f98b14', 1, 'Tomas Kovacek', 'ariel86@example.net', '424-517-6885', '25401 Hoppe Stream Suite 362\nLake Katheryn, SD 32798', 'Beier-Lindgren', 'producer', NULL, 'Dave Purdy', '77637652', 'BCA', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(13, '34576a9f-c5c4-4da8-bef7-3050485c19cb', 1, 'Dennis Will', 'amurphy@example.com', '+1-651-341-8765', '725 Clifton Ferry Suite 057\nSouth Rosannamouth, VT 12175-3636', 'Koch PLC', 'wholesaler', NULL, 'Ron Wilderman', '36261262', 'BRI', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(14, '8d774250-20fc-4274-bf04-380ecbe53cb9', 1, 'Dr. Ezra Carroll', 'tbechtelar@example.org', '+1 (463) 760-4601', '410 Alfred Crossroad Suite 801\nPort Karinamouth, NV 19767', 'Reinger Group', 'producer', NULL, 'Aglae Homenick DVM', '99892494', 'BCA', '2024-11-20 20:57:38', '2024-11-20 20:57:38'),
(15, '5b771854-1ae9-4463-8627-37fcb29746ef', 1, 'Madge Jerde I', 'lulu.koch@example.com', '(805) 594-8980', '6140 Carmela Prairie\nPort Donnyfort, VA 15451', 'Tromp, Watsica and Hoppe', 'wholesaler', NULL, 'Matt Fay', '90498405', 'BNI', '2024-11-20 20:57:38', '2024-11-20 20:57:38');

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE `units` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `short_code` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`id`, `user_id`, `name`, `slug`, `short_code`, `created_at`, `updated_at`) VALUES
(1, 1, 'Meters', 'meters', 'm', NULL, NULL),
(2, 1, 'Centimeters', 'centimeters', 'cm', NULL, NULL),
(3, 1, 'Piece', 'piece', 'pc', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL DEFAULT uuid(),
  `username` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `pet_name` varchar(255) DEFAULT NULL,
  `pet_type` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `store_name` varchar(255) DEFAULT NULL,
  `store_address` varchar(255) DEFAULT NULL,
  `store_email` varchar(255) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'pet_owner'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `uuid`, `username`, `name`, `email`, `pet_name`, `pet_type`, `phone`, `email_verified_at`, `password`, `store_name`, `store_address`, `store_email`, `remember_token`, `created_at`, `updated_at`, `photo`, `role`) VALUES
(1, '954b74b3-1e08-4db4-bd98-ce7f9c4d03fc', 'Admin', 'Admin', 'admin@admin.com', NULL, NULL, '09214017593', '2024-11-20 20:57:36', '$2y$10$8psTGGwkaOu5juVhBNGHRePZois1LgmGWfRelYwhpnFh7j9Iu5J/2', NULL, NULL, NULL, NULL, '2024-11-20 20:57:36', '2025-01-10 21:21:53', 'user_photos/8MSa9boRg63FKEq4QUZSfECadwB4u0bxXagmllwa.jpg', 'admin'),
(2, '36d9100e-dcc4-41cb-9321-d0e23c32c46a', NULL, 'quest', 'quest@quest.com', NULL, NULL, NULL, '2024-11-20 20:57:37', '$2y$10$t93o8YHnSdEInKg7R3RdA.NTVGuo8pqyITgaHtLY.2E5g5iI8s6gW', NULL, NULL, NULL, NULL, '2024-11-20 20:57:37', NULL, 'admin.jpg', 'sub_admin'),
(3, '8f745adf-54a4-4c05-a66f-f68322b98605', NULL, 'user', 'user@user.com', NULL, NULL, NULL, '2024-11-20 20:57:37', '$2y$10$cvqO4XSwU/01ihBLTeSP8OKpkkumrOT7d55Ecc8ufXcw60JwPizu.', NULL, NULL, NULL, NULL, '2024-11-20 20:57:37', NULL, 'admin.jpg', 'pet_owner'),
(4, 'f2358a7e-cfa5-11ef-8cfa-80fa5b80768d', NULL, 'Raizel', 'how@gmail.com', NULL, NULL, NULL, NULL, '$2y$10$I8imNvafC.yodfZ1TPqI0eeTIEQjhZRarxdUL2ENsR9sEt1FOPqv2', NULL, NULL, NULL, NULL, '2025-01-10 14:55:11', '2025-01-10 14:55:11', NULL, 'pet_owner'),
(101, 'f367acb9-d194-11ef-9398-80fa5b80768d', NULL, 'John Doe', 'johndoe@example.com', NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, '2025-01-13 09:58:34', '2025-01-13 09:58:34', NULL, 'pet_owner'),
(102, 'f367bf64-d194-11ef-9398-80fa5b80768d', NULL, 'Jane Smith', 'janesmith@example.com', NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, '2025-01-13 09:58:34', '2025-01-13 09:58:34', NULL, 'pet_owner');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointment`
--
ALTER TABLE `appointment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appointment_user_id_foreign` (`user_id`),
  ADD KEY `appointment_pet_id_foreign` (`pet_id`);

--
-- Indexes for table `appointment_reason`
--
ALTER TABLE `appointment_reason`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_name_unique` (`name`),
  ADD UNIQUE KEY `categories_slug_unique` (`slug`),
  ADD KEY `categories_user_id_foreign` (`user_id`);

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `conversation_user`
--
ALTER TABLE `conversation_user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conversation_user_conversation_id_foreign` (`conversation_id`),
  ADD KEY `conversation_user_user_id_foreign` (`user_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customers_email_unique` (`email`),
  ADD UNIQUE KEY `customers_phone_unique` (`phone`),
  ADD KEY `customers_user_id_foreign` (`user_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_user_id_foreign` (`user_id`),
  ADD KEY `orders_customer_id_foreign` (`customer_id`);

--
-- Indexes for table `order_details`
--
ALTER TABLE `order_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_details_order_id_foreign` (`order_id`),
  ADD KEY `order_details_product_id_foreign` (`product_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `pets`
--
ALTER TABLE `pets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `products_user_id_foreign` (`user_id`),
  ADD KEY `products_category_id_foreign` (`category_id`),
  ADD KEY `products_unit_id_foreign` (`unit_id`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchases_supplier_id_foreign` (`supplier_id`),
  ADD KEY `purchases_user_id_foreign` (`user_id`);

--
-- Indexes for table `purchase_details`
--
ALTER TABLE `purchase_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_details_purchase_id_foreign` (`purchase_id`),
  ADD KEY `purchase_details_product_id_foreign` (`product_id`);

--
-- Indexes for table `quotations`
--
ALTER TABLE `quotations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quotations_customer_id_foreign` (`customer_id`),
  ADD KEY `quotations_user_id_foreign` (`user_id`);

--
-- Indexes for table `quotation_details`
--
ALTER TABLE `quotation_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quotation_details_quotation_id_foreign` (`quotation_id`),
  ADD KEY `quotation_details_product_id_foreign` (`product_id`);

--
-- Indexes for table `reasons`
--
ALTER TABLE `reasons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reasons_name_unique` (`name`);

--
-- Indexes for table `shoppingcart`
--
ALTER TABLE `shoppingcart`
  ADD PRIMARY KEY (`identifier`,`instance`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `suppliers_email_unique` (`email`),
  ADD UNIQUE KEY `suppliers_phone_unique` (`phone`),
  ADD KEY `suppliers_user_id_foreign` (`user_id`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`),
  ADD KEY `units_user_id_foreign` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointment`
--
ALTER TABLE `appointment`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `appointment_reason`
--
ALTER TABLE `appointment_reason`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `conversation_user`
--
ALTER TABLE `conversation_user`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_details`
--
ALTER TABLE `order_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `pets`
--
ALTER TABLE `pets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=203;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_details`
--
ALTER TABLE `purchase_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quotations`
--
ALTER TABLE `quotations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quotation_details`
--
ALTER TABLE `quotation_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reasons`
--
ALTER TABLE `reasons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointment`
--
ALTER TABLE `appointment`
  ADD CONSTRAINT `appointment_pet_id_foreign` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointment_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `conversation_user`
--
ALTER TABLE `conversation_user`
  ADD CONSTRAINT `conversation_user_conversation_id_foreign` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conversation_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `customers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_details`
--
ALTER TABLE `order_details`
  ADD CONSTRAINT `order_details_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_details_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `products_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `purchases_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  ADD CONSTRAINT `purchases_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchase_details`
--
ALTER TABLE `purchase_details`
  ADD CONSTRAINT `purchase_details_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_details_purchase_id_foreign` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quotations`
--
ALTER TABLE `quotations`
  ADD CONSTRAINT `quotations_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `quotations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quotation_details`
--
ALTER TABLE `quotation_details`
  ADD CONSTRAINT `quotation_details_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `quotation_details_quotation_id_foreign` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD CONSTRAINT `suppliers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `units`
--
ALTER TABLE `units`
  ADD CONSTRAINT `units_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
