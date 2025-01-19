-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 19, 2025 at 01:33 PM
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
  `email_verified_at` timestamp NULL DEFAULT current_timestamp(),
  `password` varchar(255) NOT NULL,
  `store_name` varchar(255) DEFAULT NULL,
  `store_address` varchar(255) DEFAULT NULL,
  `store_email` varchar(255) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'pet_owner',
  `age` int(255) NOT NULL,
  `photo` MEDIUMBLOB NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `uuid`, `username`, `name`, `email`, `pet_name`, `pet_type`, `phone`, `email_verified_at`, `password`, `store_name`, `store_address`, `store_email`, `remember_token`, `created_at`, `updated_at`, `role`, `age`, `photo`) VALUES
(1, '954b74b3-1e08-4db4-bd98-ce7f9c4d03fc', 'Admin', 'Admin', 'admin@admin.com', NULL, NULL, '09214017593', '2024-11-20 20:57:36', '$2y$10$8psTGGwkaOu5juVhBNGHRePZois1LgmGWfRelYwhpnFh7j9Iu5J/2', NULL, NULL, NULL, NULL, '2024-11-20 20:57:36', '2025-01-10 21:21:53', 'admin', 0, ''),
(104, '92db4c66-8d1c-4419-bdc5-efbd54af9ada', NULL, 'jamzzz', 'undiaxinus@gmail.com', NULL, NULL, '9864619598', NULL, '$2y$10$R9YYdBzDPUbZYlexxWBz..6xkP3loj.nvtOL.Mb5puRcseNa1hKW2', NULL, 'dhffbdbdb', NULL, NULL, '2025-01-14 08:03:42', '2025-01-14 08:03:42', 'pet_owner', 6, ''),
(110, '129254d3-24c5-4216-83b4-8195019ea769', 'ericaloveranespoche', 'Erica Poche', 'ericaloveranespoche@gmail.com', NULL, NULL, '9093717983', NULL, '$2a$10$BKSgv1sZHmLmKOtpye6mnuhuthODiu7KKHsEm90T4nH6cjCun4WYu', NULL, 'Zone 3 Banquerohan Leg. City ', NULL, NULL, '2025-01-14 12:25:05', '2025-01-14 12:25:05', 'pet_owner', 21, ''),
(131, '2c428247-ad1e-4e07-bafb-f7c07c758ac9', 'jsbrbfj', 'kfcnsn', 'anonuevojamille@gmail.com', NULL, NULL, '095463128946', '2025-01-19 11:08:40', '$2a$10$R8ffL0dXAqpIBpaDmUxF5OggHS6DuultxU2YFRevioCvZPpQ1om8a', NULL, 'jdbd skaje djfjd', NULL, NULL, '2025-01-19 11:08:40', '2025-01-19 11:08:40', 'pet_owner', 23, '');

--
-- Indexes for dumped tables
--

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
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=132;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
