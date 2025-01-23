-- MariaDB dump 10.19  Distrib 10.5.22-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: foodogram
-- ------------------------------------------------------
-- Server version	10.5.22-MariaDB-1:10.5.22+maria~ubu2004

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `to_user_id` int(11) NOT NULL,
  `from_user_id` int(11) NOT NULL,
  `recipe_id` int(11) DEFAULT NULL,
  `type` enum('like','comment','follow','badge_earned','badge_approaching') DEFAULT NULL,
  `message` mediumtext NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `to_user_id` (`to_user_id`),
  KEY `from_user_id` (`from_user_id`),
  KEY `recipe_id` (`recipe_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (40,1,8,NULL,'follow','lavanya started following you! 🎉',1,'2024-12-12 14:22:37'),(42,7,1,NULL,'follow','admin started following you! 🎉',0,'2024-12-12 14:46:39'),(44,1,10,NULL,'follow','aishwaryarmurthy66@gmail.com started following you! 🎉',1,'2024-12-13 14:30:42'),(45,1,10,NULL,'follow','aishwaryarmurthy66@gmail.com started following you! 🎉',1,'2024-12-13 14:31:08'),(46,1,10,NULL,'follow','aishwaryarmurthy66@gmail.com started following you! 🎉',1,'2024-12-13 14:31:14'),(47,7,10,NULL,'follow','aishwaryarmurthy66@gmail.com started following you! 🎉',0,'2024-12-13 14:33:29'),(48,10,1,NULL,'follow','admin started following you! 🎉',0,'2024-12-13 19:52:41'),(50,1,3,NULL,'follow','rohit started following you! 🎉',1,'2024-12-15 15:53:25'),(53,3,12,NULL,'follow','Varasdara started following you! 🎉',0,'2024-12-19 12:40:41'),(54,1,12,NULL,'follow','Varasdara started following you! 🎉',0,'2024-12-19 12:41:01'),(57,6,12,NULL,'follow','Varasdara started following you! 🎉',0,'2024-12-19 12:43:58'),(60,1,13,NULL,'follow','Mudhuu started following you! 🎉',1,'2024-12-19 16:31:10');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_comments`
--

DROP TABLE IF EXISTS `recipe_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `recipe_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `recipe_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` mediumtext NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `recipe_id` (`recipe_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `recipe_comments_ibfk_1` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `recipe_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_comments`
--

LOCK TABLES `recipe_comments` WRITE;
/*!40000 ALTER TABLE `recipe_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `recipe_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_likes`
--

DROP TABLE IF EXISTS `recipe_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `recipe_likes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `recipe_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_like` (`recipe_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `recipe_likes_ibfk_1` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `recipe_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_likes`
--

LOCK TABLES `recipe_likes` WRITE;
/*!40000 ALTER TABLE `recipe_likes` DISABLE KEYS */;
/*!40000 ALTER TABLE `recipe_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipes`
--

DROP TABLE IF EXISTS `recipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `recipes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `ingredients` text NOT NULL,
  `instructions` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `likes` int(11) DEFAULT 0,
  `comments` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `video_url` varchar(255) DEFAULT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `recipes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipes`
--

LOCK TABLES `recipes` WRITE;
/*!40000 ALTER TABLE `recipes` DISABLE KEYS */;
INSERT INTO `recipes` VALUES (41,1,'Chicken Burger','burger, chicken patty, lettuce','assemble everything','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/recipes/1737640765334-Smashburger-recipe-120219.webp',0,0,'2025-01-23 13:59:25',NULL,NULL),(42,1,'Tandoori','Ingredients:\r\n1.5 pounds boneless, skinless chicken thighs or breasts, cut into 1-inch pieces\r\n1 cup plain yogurt\r\n1/4 cup lemon juice\r\n1 tablespoon ginger-garlic paste\r\n1 tablespoon tandoori masala powder\r\n1 teaspoon red chili powder\r\n1/2 teaspoon turmeric powder\r\n1/2 teaspoon garam masala powder\r\n1/2 teaspoon cumin powder\r\n1/4 teaspoon coriander powder\r\nSalt to taste\r\n1 tablespoon olive oil or melted ghee (for brushing)\r\nLemon wedges (for garnish)','Make the Marinade: In a large bowl, combine yogurt, lemon juice, ginger-garlic paste, tandoori masala, red chili powder, turmeric, garam masala, cumin, coriander, and salt. Mix well to form a smooth paste.\r\nMarinate the Chicken: Add the chicken pieces to the marinade and toss to coat evenly. Cover and refrigerate for at least 4 hours or overnight for maximum flavor.\r\nPreheat the Oven or Grill: Preheat oven to 400°F (200°C) or prepare your grill for medium-high heat.\r\nCook the Chicken: Thread the marinated chicken pieces onto skewers. If using skewers, place them on a baking sheet lined with foil. Brush the chicken with olive oil or ghee.\r\nCook: If using the oven, bake for 15-20 minutes, turning halfway through, or until cooked through and slightly charred. If using the grill, cook for 10-15 minutes, turning occasionally, until cooked through and slightly charred.\r\nServe: Garnish with lemon wedges and serve hot with your favorite sides, such as naan, rice, or salad.\r\nTips:\r\n\r\nFor a spicier chicken, add more red chili powder.\r\nYou can use chicken drumsticks or thighs for a more traditional tandoori experience.\r\nIf you don\'t have tandoori masala, you can make your own by combining chili powder, cumin, coriander, ginger, garlic, and other spices to your liking.\r\nFor a smoky flavor, grill the chicken over charcoal.\r\nEnjoy your delicious and authentic Tandoori Chicken!','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/recipes/1737640868664-tandoori.jpg',0,0,'2025-01-23 14:01:08',NULL,NULL),(43,1,'Tiramisu','Ingredients:\r\n\r\nFor the Coffee Mixture:\r\n1 cup strong brewed coffee, cooled\r\n2 tablespoons brandy or rum (optional)\r\nFor the Ladyfingers:\r\n24 ladyfingers\r\nFor the Mascarpone Cream:\r\n16 ounces mascarpone cheese, softened\r\n1/2 cup granulated sugar\r\n4 large egg yolks\r\n1 teaspoon vanilla extract\r\n1 cup heavy cream, chilled\r\nFor Garnish:\r\nUnsweetened cocoa powder','Yields: 8 servings\r\nPrep time: 30 minutes\r\nChill time: 4 hours or overnight\r\n\r\nIngredients:\r\n\r\nFor the Coffee Mixture:\r\n1 cup strong brewed coffee, cooled\r\n2 tablespoons brandy or rum (optional)\r\nFor the Ladyfingers:\r\n24 ladyfingers\r\nFor the Mascarpone Cream:\r\n16 ounces mascarpone cheese, softened\r\n1/2 cup granulated sugar\r\n4 large egg yolks\r\n1 teaspoon vanilla extract\r\n1 cup heavy cream, chilled\r\nFor Garnish:\r\nUnsweetened cocoa powder\r\nInstructions:\r\n\r\nMake the Coffee Mixture: In a shallow dish, combine the cooled coffee and brandy or rum (if using). Set aside.\r\n\r\nMake the Mascarpone Cream:\r\n\r\nIn a large bowl, whisk together the egg yolks and sugar until light and fluffy.\r\nBeat in the mascarpone cheese until smooth.\r\nIn a separate bowl, use an electric mixer to whip the heavy cream until stiff peaks form.\r\nGently fold the whipped cream into the mascarpone\r\n\r\n1 mixture until combined.   \r\nAssemble the Tiramisu:\r\n\r\nDip each ladyfinger briefly in the coffee mixture, turning to coat both sides.\r\nArrange a layer of ladyfingers in the bottom of a 9x13 inch baking dish.\r\nSpread half of the mascarpone cream evenly over the ladyfingers.\r\nRepeat the layers of ladyfingers and mascarpone cream.\r\nCover the dish with plastic wrap and refrigerate for at least 4 hours, or overnight.\r\nDust and Serve:\r\n\r\nBefore serving, dust the top of the tiramisu with unsweetened cocoa powder.\r\nCut into squares and enjoy!\r\nTips and Variations:\r\n\r\nFor a stronger coffee flavor: Use espresso instead of brewed coffee.\r\nFor a richer flavor: Add a tablespoon of cocoa powder to the mascarpone cream.\r\nFor a lighter dessert: Use light cream instead of heavy cream.\r\nFor a boozy kick: Increase the amount of brandy or rum in the coffee mixture.\r\nFor a festive touch: Garnish with shaved chocolate or cocoa nibs.\r\nEnjoy your homemade Tiramisu!','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/recipes/1737640952057-tiramisu.jpeg',0,0,'2025-01-23 14:02:32',NULL,NULL),(44,1,'Pizzaa','pizzaa','pizzzaaaaaaaa','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/recipes/1737641078453-pizza.jpg',0,0,'2025-01-23 14:04:38',NULL,NULL),(45,1,'Ramen','Ramen','Ramen',NULL,0,0,'2025-01-23 14:05:03','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/recipes/1737641102815-Tensai-Ramen-_-Brandfilm.mp4','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/thumbnails/1737641103340-thumbnail.jpg');
/*!40000 ALTER TABLE `recipes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_recipes`
--

DROP TABLE IF EXISTS `saved_recipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `saved_recipes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_save` (`user_id`,`recipe_id`),
  KEY `recipe_id` (`recipe_id`),
  CONSTRAINT `saved_recipes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `saved_recipes_ibfk_2` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_recipes`
--

LOCK TABLES `saved_recipes` WRITE;
/*!40000 ALTER TABLE `saved_recipes` DISABLE KEYS */;
/*!40000 ALTER TABLE `saved_recipes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_follows`
--

DROP TABLE IF EXISTS `user_follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_follows` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `follower_id` int(11) NOT NULL,
  `following_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_follow` (`follower_id`,`following_id`),
  KEY `following_id` (`following_id`),
  CONSTRAINT `user_follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_follows`
--

LOCK TABLES `user_follows` WRITE;
/*!40000 ALTER TABLE `user_follows` DISABLE KEYS */;
INSERT INTO `user_follows` VALUES (8,6,8,'2024-12-12 12:41:15'),(9,9,8,'2024-12-12 13:10:10'),(10,1,6,'2024-12-12 13:34:59'),(11,6,9,'2024-12-12 13:40:05'),(13,1,3,'2024-12-12 13:56:43'),(14,1,9,'2024-12-12 13:57:01'),(15,1,8,'2024-12-12 13:57:37'),(20,8,1,'2024-12-12 14:22:37'),(21,1,7,'2024-12-12 14:46:38'),(24,10,1,'2024-12-13 14:31:13'),(25,10,7,'2024-12-13 14:33:28'),(26,1,10,'2024-12-13 19:52:41'),(27,3,1,'2024-12-15 15:53:25'),(28,12,3,'2024-12-19 12:40:41'),(29,12,1,'2024-12-19 12:41:01'),(30,12,6,'2024-12-19 12:43:58'),(31,13,1,'2024-12-19 16:31:10');
/*!40000 ALTER TABLE `user_follows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `bio` text DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `specialties` text DEFAULT NULL,
  `social_links` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`social_links`)),
  `favorite_cuisines` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`favorite_cuisines`)),
  `cooking_level` varchar(50) DEFAULT 'beginner',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@gmail.com','$2b$10$zmQYNs12PBjdL.roQS8jbu4jxo9fokWqKMWhL/bVkfgMjP86Sw7pe','2024-12-03 09:09:25','cooking enthu','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/profiles/1737640784056-foodopia_main-Photoroom.jpg',NULL,NULL,NULL,NULL,'Sous Chef'),(2,'vinayak','mvinayak800@gmail.com','$2b$10$pYKfXUBtxKQtmoW5WK7y3esc7AY6iX8OTPjmvXtzOZENWqPL6m.c.','2024-12-03 12:12:28',NULL,NULL,NULL,NULL,NULL,NULL,'beginner'),(3,'rohit','rohit@gmail.com','$2b$10$CQD20ljGiwUdf71a.1BC1uf6jtAy9qSD2P.ciGAFwhOYBLCjIIyCy','2024-12-03 17:29:47','great singer ',NULL,NULL,NULL,NULL,NULL,'beginner'),(4,'aishu','aishu@gmail.com','$2b$10$NgUpGcblBP3c7bZGhg5uc.LefxBS8mWa7qtSSUelHTijbz0mB7KSG','2024-12-03 18:27:54',NULL,NULL,NULL,NULL,NULL,NULL,'beginner'),(5,'mudhu','iloveyou@gmail.com','$2b$10$QprWIX6w0HSHPhoI2Du91uyufV1WqeYX2LmJij6nLmdJ9VuWD8sFm','2024-12-08 12:40:26',NULL,NULL,NULL,NULL,NULL,NULL,'beginner'),(6,'ashika','ashika@gmail.com','$2b$10$qw/vJfvv1x8ENE5atvPJYu50pfFDSWl38eF9/46K7fu4etDPEx5xO','2024-12-11 16:09:29','shining in the moon light','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/profiles/1734350806752-neerdosa.jpg',NULL,NULL,NULL,NULL,'Kitchen Rookie'),(7,'saiprasad','saiprasadmurthy100@gmail.com','$2b$10$ObmxoRJxl3fgHnFoFORavOrH2LTEGtEZVxUV5DQQBZcPVzjvwwola','2024-12-12 10:25:34',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,'lavanya','lavanya12@gmail.com','$2b$10$S7T8mThdqc1tPLtGmyz/TOStITTSG1qi4iBPaINIqZFSD1g2bAG1O','2024-12-12 12:31:29','beautifull girl with beautifull heart',NULL,NULL,NULL,NULL,NULL,'Culinary Legend'),(9,'siddu','siddappa@gmail.com','$2b$10$L.kPI3Z8N.50zDvXgRLV4u.gPlUAWjVhtFRMQRFQPqFVJ.Qc2t0Je','2024-12-12 12:57:54','siddu special eggrise',NULL,NULL,NULL,NULL,NULL,NULL),(10,'aishwaryarmurthy66@gmail.com','aishwaryarmurthy66@gmail.com','$2b$10$pFiGgAu69mS/Rzy69ccXzuwdzVD/3Uph4H2AK9ArM2br42nd1uODu','2024-12-13 14:28:05',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,'Varasdara','bhatn5415@gmail.com','$2a$10$E7/ZJqgrIKt9utlIr4DG/egWEcUmCaycdt/h3pOF/n5H8OsGMMHcu','2024-12-19 12:39:33',NULL,NULL,NULL,NULL,NULL,NULL,'beginner'),(13,'Mudhuu','keerthanaln16299@gmail.com','$2a$10$QcB14ezZ2mOPQ8aprnvGFeZszBV9KyW5JSy7g98PctbDbn6PHj6Ti','2024-12-19 16:25:02',NULL,NULL,NULL,NULL,NULL,NULL,'beginner');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-01-23 14:09:08
