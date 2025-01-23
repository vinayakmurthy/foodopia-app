-- MariaDB dump 10.19  Distrib 10.5.22-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: foodogram
-- ------------------------------------------------------
-- Server version	10.5.22-MariaDB

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
INSERT INTO `notifications` VALUES (1,1,3,2,'like','rohit liked your recipe \"pizzaa\"',1,'2024-12-11 08:59:53'),(2,1,3,2,'like','rohit liked your recipe \"pizzaa\"',1,'2024-12-11 08:59:56'),(3,1,3,2,'comment','rohit commented on your recipe \"pizzaa\": \"great recipe keep going!!',1,'2024-12-11 09:00:08'),(6,1,3,2,'like','rohit liked your recipe \"pizzaa\"',1,'2024-12-11 14:12:12'),(7,3,1,8,'comment','admin commented on your recipe \"Burger\"',0,'2024-12-11 14:53:07'),(8,3,1,8,'like','admin liked your recipe \"Burger\"',0,'2024-12-11 14:53:21'),(9,3,1,8,'like','admin liked your recipe \"Burger\"',0,'2024-12-11 14:53:30'),(10,3,1,8,'comment','admin commented on your recipe \"Burger\": \"greate burger',0,'2024-12-11 15:07:15'),(11,3,1,8,'like','admin liked your recipe \"Burger\"',0,'2024-12-11 15:08:03'),(12,3,1,8,'like','admin liked your recipe \"Burger\"',0,'2024-12-11 15:08:23'),(13,1,3,5,'like','rohit liked your recipe \"ennegai\"',1,'2024-12-11 15:11:53'),(14,1,3,5,'comment','rohit commented on your recipe \"ennegai\": \"love',1,'2024-12-11 15:12:36'),(17,3,6,9,'like','ashika liked your recipe \"Noodles\"',0,'2024-12-11 16:19:17'),(18,3,6,9,'comment','ashika commented on your recipe \"Noodles\": \"broooo amazing noodles!!',1,'2024-12-11 16:20:16'),(19,1,6,2,'like','ashika liked your recipe \"pizzaa\"',1,'2024-12-11 16:21:08'),(20,1,6,2,'comment','ashika commented on your recipe \"pizzaa\": \"mouth watering pizzaa',1,'2024-12-11 16:21:31'),(21,6,3,10,'like','rohit liked your recipe \"Mutton-Biriyani\"',0,'2024-12-11 16:25:13'),(22,6,3,10,'comment','rohit commented on your recipe \"Mutton-Biriyani\": \"loooks yum!! ',0,'2024-12-11 16:25:30'),(23,6,3,10,'like','rohit liked your recipe \"Mutton-Biriyani\"',0,'2024-12-11 16:25:44'),(24,3,1,8,'like','admin liked your recipe \"Burger\"',0,'2024-12-12 07:45:06'),(25,6,1,10,'comment','admin commented on your recipe \"Mutton-Biriyani\": \"i love mutton biriyani',0,'2024-12-12 08:56:57'),(26,6,1,10,'like','admin liked your recipe \"Mutton-Biriyani\"',0,'2024-12-12 09:01:55'),(27,3,1,8,'like','admin liked your recipe \"Burger\"',0,'2024-12-12 09:47:47'),(28,6,1,10,'like','admin liked your recipe \"Mutton-Biriyani\"',0,'2024-12-12 09:47:53'),(29,6,7,10,'comment','saiprasad commented on your recipe \"Mutton-Biriyani\": \"good receipe',1,'2024-12-12 10:40:27'),(30,3,7,9,'like','saiprasad liked your recipe \"Noodles\"',0,'2024-12-12 10:40:42'),(31,7,6,11,'like','ashika liked your recipe \"chicken butter masala\"',0,'2024-12-12 10:59:36'),(32,6,8,10,'like','lavanya liked your recipe \"Mutton-Biriyani\"',0,'2024-12-12 12:36:22'),(33,6,8,10,'comment','lavanya commented on your recipe \"Mutton-Biriyani\": \"wonderfull mutton biriyani like me',1,'2024-12-12 12:36:43'),(34,6,9,10,'like','siddu liked your recipe \"Mutton-Biriyani\"',0,'2024-12-12 13:02:37'),(35,6,9,10,'comment','siddu commented on your recipe \"Mutton-Biriyani\": \"mastt benkii noun hadaa',1,'2024-12-12 13:02:55'),(36,3,8,8,'like','lavanya liked your recipe \"Burger\"',0,'2024-12-12 13:59:49'),(37,3,8,8,'comment','lavanya commented on your recipe \"Burger\": \"beautyy',0,'2024-12-12 14:00:00'),(38,8,1,14,'like','admin liked your recipe \"kabab\"',0,'2024-12-12 14:02:54'),(39,8,1,14,'comment','admin commented on your recipe \"kabab\": \"besttt kabab',1,'2024-12-12 14:03:03'),(40,1,8,NULL,'follow','lavanya started following you! 🎉',1,'2024-12-12 14:22:37'),(41,8,1,14,'comment','admin commented on your recipe \"kabab\" 💬',0,'2024-12-12 14:28:02'),(42,7,1,NULL,'follow','admin started following you! 🎉',0,'2024-12-12 14:46:39'),(43,9,1,15,'like','admin liked your recipe \"Egg rice\"',0,'2024-12-12 14:47:42'),(44,1,10,NULL,'follow','aishwaryarmurthy66@gmail.com started following you! 🎉',1,'2024-12-13 14:30:42'),(45,1,10,NULL,'follow','aishwaryarmurthy66@gmail.com started following you! 🎉',1,'2024-12-13 14:31:08'),(46,1,10,NULL,'follow','aishwaryarmurthy66@gmail.com started following you! 🎉',1,'2024-12-13 14:31:14'),(47,7,10,NULL,'follow','aishwaryarmurthy66@gmail.com started following you! 🎉',0,'2024-12-13 14:33:29'),(48,10,1,NULL,'follow','admin started following you! 🎉',0,'2024-12-13 19:52:41'),(49,6,1,10,'comment','admin commented on your recipe \"Mutton-Biriyani\" 💬',0,'2024-12-14 06:44:11'),(50,1,3,NULL,'follow','rohit started following you! 🎉',1,'2024-12-15 15:53:25'),(51,1,3,40,'like','rohit liked your recipe \"the ramen\"',0,'2024-12-19 12:38:18'),(52,1,3,40,'like','rohit liked your recipe \"the ramen\"',0,'2024-12-19 12:38:20'),(53,3,12,NULL,'follow','Varasdara started following you! 🎉',0,'2024-12-19 12:40:41'),(54,1,12,NULL,'follow','Varasdara started following you! 🎉',0,'2024-12-19 12:41:01'),(55,1,12,40,'like','Varasdara liked your recipe \"the ramen\"',0,'2024-12-19 12:41:16'),(56,1,12,40,'comment','Varasdara commented on your recipe \"the ramen\" 💬',1,'2024-12-19 12:41:43'),(57,6,12,NULL,'follow','Varasdara started following you! 🎉',0,'2024-12-19 12:43:58'),(58,6,13,10,'like','Mudhuu liked your recipe \"Mutton-Biriyani\"',0,'2024-12-19 16:29:02'),(59,1,13,39,'like','Mudhuu liked your recipe \"dose\"',0,'2024-12-19 16:29:09'),(60,1,13,NULL,'follow','Mudhuu started following you! 🎉',1,'2024-12-19 16:31:10');
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
INSERT INTO `recipe_comments` VALUES (1,2,3,'great recipe keep going!!','2024-12-11 09:00:07'),(3,8,1,'nice','2024-12-11 14:46:05'),(4,8,1,'nice','2024-12-11 14:53:06'),(5,8,1,'greate burger','2024-12-11 15:07:15'),(6,5,3,'love','2024-12-11 15:12:36'),(9,9,6,'broooo amazing noodles!!','2024-12-11 16:20:15'),(10,2,6,'mouth watering pizzaa','2024-12-11 16:21:30'),(11,10,3,'loooks yum!! ','2024-12-11 16:25:30'),(12,10,1,'i love mutton biriyani','2024-12-12 08:56:57'),(13,10,7,'good receipe','2024-12-12 10:40:26'),(14,10,8,'wonderfull mutton biriyani like me','2024-12-12 12:36:42'),(15,10,9,'mastt benkii noun hadaa','2024-12-12 13:02:55'),(16,14,8,'nicee','2024-12-12 13:59:20'),(17,8,8,'beautyy','2024-12-12 14:00:00'),(18,14,1,'besttt kabab','2024-12-12 14:03:03'),(19,14,1,'😍😍😍','2024-12-12 14:28:02'),(20,10,1,'nice😍','2024-12-14 06:44:11'),(21,40,12,'Crazy recipe bro I tried and I became of fan of the taste ','2024-12-19 12:41:43');
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
INSERT INTO `recipe_likes` VALUES (4,2,1,'2024-12-11 10:06:26'),(5,2,3,'2024-12-11 14:12:12'),(17,5,3,'2024-12-11 15:11:53'),(18,9,3,'2024-12-11 15:41:25'),(19,9,6,'2024-12-11 16:19:16'),(20,2,6,'2024-12-11 16:21:08'),(22,10,3,'2024-12-11 16:25:44'),(27,8,1,'2024-12-12 09:47:47'),(28,10,1,'2024-12-12 09:47:53'),(29,9,7,'2024-12-12 10:40:42'),(30,11,6,'2024-12-12 10:59:34'),(32,10,8,'2024-12-12 12:36:22'),(33,10,9,'2024-12-12 13:02:37'),(35,14,8,'2024-12-12 13:58:40'),(36,8,8,'2024-12-12 13:59:49'),(37,14,1,'2024-12-12 14:02:54'),(43,29,1,'2024-12-14 08:45:22'),(45,40,3,'2024-12-19 12:38:20'),(46,40,12,'2024-12-19 12:41:16'),(47,10,13,'2024-12-19 16:29:02'),(48,39,13,'2024-12-19 16:29:09');
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
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipes`
--

LOCK TABLES `recipes` WRITE;
/*!40000 ALTER TABLE `recipes` DISABLE KEYS */;
INSERT INTO `recipes` VALUES (2,1,'pizzaa','pizza dough, cheese, mushroom, capsicum','add everything put in the oven','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/recipes/1733857114070-pizza.jpg',3,0,'2024-12-10 18:58:36',NULL,NULL),(5,1,'ennegai','brinjal onion ','fry and mix well','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/recipes/1733914329995-Badanekai-Yennegai.jpg',1,0,'2024-12-11 10:52:10',NULL,NULL),(8,3,'Burger','burger buns, chicken patty, vegegies, cheese','assemble everything on top of each other, volla burger is ready to eat!','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/recipes/1733925938347-burger.jpg',2,0,'2024-12-11 14:05:38',NULL,NULL),(9,3,'Noodles','noodles, egg, chicken, spring onions','boil the noodles and egg and fry the chicken thighs on the heat pan and once everything is ready assemble everything in bowl your delicious noodles is ready to eat!! happy eating','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/recipes/1733931667582-noodles.avif',3,0,'2024-12-11 15:41:08',NULL,NULL),(10,6,'Mutton-Biriyani','basmati rice, crazyy mutton, spices, onions, masala, veggeis','put everything in the pot and cook, you delicious mutton biriyani is ready!!!, happy eating','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/recipes/1733933852151-mutton.avif',5,0,'2024-12-11 16:17:33',NULL,NULL),(11,7,'chicken butter masala','chicken and masala','cook ','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/recipes/1733999749561-butter-chicken.jpg',1,0,'2024-12-12 10:35:52',NULL,NULL),(14,8,'kabab','kabab','mix mix fry fry','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/recipes/1734007081001-kabab.webp',2,0,'2024-12-12 12:38:02',NULL,NULL),(15,9,'Egg rice','egg, ullagaddi, uk karadpudi, hasimensu, uppu, kothamri etc','yella ond pan haak guru fry madu asteee, noun hada egg rice ready','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/recipes/1734008505769-Easy-Egg-fried-rice-2.jpg',0,0,'2024-12-12 13:01:47',NULL,NULL),(23,1,'maggi','maggi ','maggi',NULL,0,0,'2024-12-12 16:09:40','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/recipes/1734019777020-maggi_making.mp4','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/thumbnails/1734019779559-thumbnail.jpg'),(29,1,'ok','ok','ok','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/recipes/1734026448611-food_logo.jpeg',1,0,'2024-12-12 18:00:49',NULL,NULL),(31,10,'Tandoori chicken','For the Marinade:\r\nChicken: 1 kg (4-6 pieces, preferably drumsticks or thighs)\r\nYogurt: 1 cup (thick, plain yogurt)\r\nGinger-garlic paste: 2 tablespoons\r\nLemon juice: 2 tablespoons\r\nVegetable oil: 2 tablespoons\r\nKashmiri red chili powder: 2 teaspoons (for color and mild spice)\r\nCumin powder: 1 teaspoon\r\nCoriander powder: 1 teaspoon\r\nTurmeric powder: ½ teaspoon\r\nGaram masala: 1 teaspoon\r\nPaprika: 1 teaspoon (optional, for extra red color)\r\nSalt: to taste\r\nBlack pepper: ½ teaspoon\r\nChaat masala: 1 teaspoon (optional, for tangy flavor)\r\nFood coloring (red/orange): optional (use sparingly)\r\nFor Garnish:\r\nCilantro (coriander): Fresh leaves, chopped\r\nLemon wedges: For serving\r\nOnion slices: Optional, for serving','Instructions\r\nPrepare the Chicken:\r\n\r\nClean and pat dry the chicken pieces.\r\nMake deep cuts on the chicken to allow the marinade to penetrate. This ensures flavorful and tender meat.\r\nMake the Marinade:\r\n\r\nIn a large bowl, combine yogurt, ginger-garlic paste, lemon juice, oil, and all the spices. Mix well to form a smooth paste.\r\nTaste the marinade and adjust salt and spices if needed.\r\nMarinate the Chicken:\r\n\r\nCoat the chicken pieces thoroughly with the marinade, ensuring it seeps into the cuts.\r\nCover the bowl with plastic wrap and refrigerate for at least 6-8 hours, preferably overnight, for the best flavor.\r\nCook the Chicken:\r\n\r\nPreheat the oven to 220°C (425°F). Line a baking tray with foil and place a wire rack on top.\r\nArrange the chicken pieces on the rack, ensuring they are not touching each other.\r\nBake for 20-25 minutes. Then, turn the pieces over and cook for another 15-20 minutes until fully cooked and slightly charred. Use a meat thermometer to check that the internal temperature reaches 75°C (165°F).\r\nOptional:\r\n\r\nFor a smoky flavor, place a small piece of hot charcoal in a bowl, drizzle with a teaspoon of oil, and let the smoke infuse the chicken by covering the dish for 5 minutes.\r\nServe:\r\n\r\nGarnish with fresh cilantro, lemon wedges, and onion slices. Serve hot with naan, rice, or a side of mint chutney.\r\nTips:\r\nAdjust the chili powder for spice tolerance.\r\nYou can grill the chicken instead of baking it for a more authentic smoky flavor.\r\nIf using bone-in chicken, cook time may vary slightly.','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/recipes/1734101012409-tandoori-chicken.jpg',0,0,'2024-12-13 14:43:34',NULL,NULL),(37,1,'Ramen','Ramen noodles (our classic Maruchan package is all we need, sans the flavor packet!)\r\nGarlic and ginger\r\nBroth (chicken or veg)\r\nDried shiitake mushrooms\r\nVeggies like carrots or kale\r\nAll your favorite toppings like some panko, egg, chili oil, etc.','Stir-Fry The Aromatics: Garlic and ginger, what a delicious duo. This is where the flavor is, friends.\r\nMake Your (Easy!) Broth: Add some chicken broth and dried shiitake mushrooms for some umami punch.\r\nAdd Noodles: Cook your noodles right in the broth with some scallions (more flavor, please!).\r\nAdd Veg: Thinly sliced kale, shredded carrots, whatever you’d like! Cook until just tender.\r\nTop It Off: Add some crunchy panko crumbs, a soft-boiled egg, chili oil, hot sauce, sesame oil, and/or soy sauce, whatever your heart desires.',NULL,0,0,'2024-12-15 15:36:45','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/recipes/1734277000811-Tensai-Ramen-_-Brandfilm.mp4','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/thumbnails/1734277004315-thumbnail.jpg'),(38,6,'neer dose','neer dose, dose and neeru','tava mel haku churrrrr anathee dose batter hakii aste dose madu','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/recipes/1734350575460-neerdosa.jpg',0,0,'2024-12-16 12:03:01',NULL,NULL),(39,1,'dose','dose','dose','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/recipes/1734533610203-neerdosa.jpg',1,0,'2024-12-18 14:53:32',NULL,NULL),(40,1,'the ramen','ramen','ramen',NULL,2,0,'2024-12-18 14:54:11','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/recipes/1734533645458-Tensai-Ramen-_-Brandfilm.mp4','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/thumbnails/1734533650107-thumbnail.jpg');
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
INSERT INTO `saved_recipes` VALUES (1,1,2,'2024-12-11 09:47:51'),(3,6,9,'2024-12-11 16:20:44'),(4,3,10,'2024-12-11 16:38:00'),(6,8,10,'2024-12-12 12:36:53'),(7,9,10,'2024-12-12 13:02:31');
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
INSERT INTO `users` VALUES (1,'admin','admin@gmail.com','$2b$10$zmQYNs12PBjdL.roQS8jbu4jxo9fokWqKMWhL/bVkfgMjP86Sw7pe','2024-12-03 09:09:25','cooking enthu','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/profiles/1734029651354-food_logo.jpeg',NULL,NULL,NULL,NULL,'Sous Chef'),(2,'vinayak','mvinayak800@gmail.com','$2b$10$pYKfXUBtxKQtmoW5WK7y3esc7AY6iX8OTPjmvXtzOZENWqPL6m.c.','2024-12-03 12:12:28',NULL,NULL,NULL,NULL,NULL,NULL,'beginner'),(3,'rohit','rohit@gmail.com','$2b$10$CQD20ljGiwUdf71a.1BC1uf6jtAy9qSD2P.ciGAFwhOYBLCjIIyCy','2024-12-03 17:29:47','great singer ',NULL,NULL,NULL,NULL,NULL,'beginner'),(4,'aishu','aishu@gmail.com','$2b$10$NgUpGcblBP3c7bZGhg5uc.LefxBS8mWa7qtSSUelHTijbz0mB7KSG','2024-12-03 18:27:54',NULL,NULL,NULL,NULL,NULL,NULL,'beginner'),(5,'mudhu','iloveyou@gmail.com','$2b$10$QprWIX6w0HSHPhoI2Du91uyufV1WqeYX2LmJij6nLmdJ9VuWD8sFm','2024-12-08 12:40:26',NULL,NULL,NULL,NULL,NULL,NULL,'beginner'),(6,'ashika','ashika@gmail.com','$2b$10$qw/vJfvv1x8ENE5atvPJYu50pfFDSWl38eF9/46K7fu4etDPEx5xO','2024-12-11 16:09:29','shining in the moon light','https://foodogram-recipes.s3.eu-north-1.amazonaws.com/profiles/1734350806752-neerdosa.jpg',NULL,NULL,NULL,NULL,'Kitchen Rookie'),(7,'saiprasad','saiprasadmurthy100@gmail.com','$2b$10$ObmxoRJxl3fgHnFoFORavOrH2LTEGtEZVxUV5DQQBZcPVzjvwwola','2024-12-12 10:25:34',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,'lavanya','lavanya12@gmail.com','$2b$10$S7T8mThdqc1tPLtGmyz/TOStITTSG1qi4iBPaINIqZFSD1g2bAG1O','2024-12-12 12:31:29','beautifull girl with beautifull heart',NULL,NULL,NULL,NULL,NULL,'Culinary Legend'),(9,'siddu','siddappa@gmail.com','$2b$10$L.kPI3Z8N.50zDvXgRLV4u.gPlUAWjVhtFRMQRFQPqFVJ.Qc2t0Je','2024-12-12 12:57:54','siddu special eggrise',NULL,NULL,NULL,NULL,NULL,NULL),(10,'aishwaryarmurthy66@gmail.com','aishwaryarmurthy66@gmail.com','$2b$10$pFiGgAu69mS/Rzy69ccXzuwdzVD/3Uph4H2AK9ArM2br42nd1uODu','2024-12-13 14:28:05',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,'Varasdara','bhatn5415@gmail.com','$2a$10$E7/ZJqgrIKt9utlIr4DG/egWEcUmCaycdt/h3pOF/n5H8OsGMMHcu','2024-12-19 12:39:33',NULL,NULL,NULL,NULL,NULL,NULL,'beginner'),(13,'Mudhuu','keerthanaln16299@gmail.com','$2a$10$QcB14ezZ2mOPQ8aprnvGFeZszBV9KyW5JSy7g98PctbDbn6PHj6Ti','2024-12-19 16:25:02',NULL,NULL,NULL,NULL,NULL,NULL,'beginner');
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

-- Dump completed on 2024-12-20  7:43:33
