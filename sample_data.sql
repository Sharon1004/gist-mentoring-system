-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: gist_mentoring_system
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` varchar(64) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(32) NOT NULL DEFAULT 'branch_admin',
  `branch` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES ('admin_civil','admin123','CIVIL Branch Admin','branch_admin','CIVIL'),('admin_cse','admin123','CSE Branch Admin','branch_admin','CSE'),('admin_ece','admin123','ECE Branch Admin','branch_admin','ECE'),('admin_eee','admin123','EEE Branch Admin','branch_admin','EEE'),('admin_mech','admin123','MECH Branch Admin','branch_admin','MECH'),('admin1','admin123','Super Admin - GIST Nellore','super_admin',NULL);
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branches`
--

DROP TABLE IF EXISTS `branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branches` (
  `id` varchar(64) NOT NULL,
  `regulation_id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(32) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `regulation_id` (`regulation_id`),
  CONSTRAINT `branches_ibfk_1` FOREIGN KEY (`regulation_id`) REFERENCES `regulations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
INSERT INTO `branches` VALUES ('aids-r23','r23','Artificial Intelligence and Data Science','AIDS','AIDS Branch under R23',1),('aiml-r23','r23','Artificial Intelligence and Machine Learning','AIML','AIML Branch under R23',1),('civil-r20','r20','Civil Engineering','CIVIL','CIVIL Branch under R20',1),('civil-r22','r22','Civil Engineering','CIVIL','CIVIL Branch under R22',1),('civil-r23','r23','Civil Engineering','CIVIL','CIVIL Branch under R23',1),('cse-r20','r20','Computer Science and Engineering','CSE','CSE Branch under R20',1),('cse-r22','r22','Computer Science and Engineering','CSE','CSE Branch under R22',1),('cse-r23','r23','Computer Science and Engineering','CSE','CSE Branch under R23',1),('ece-r20','r20','Electronics and Communication Engineering','ECE','ECE Branch under R20',1),('ece-r22','r22','Electronics and Communication Engineering','ECE','ECE Branch under R22',1),('ece-r23','r23','Electronics and Communication Engineering','ECE','ECE Branch under R23',1),('eee-r20','r20','Electrical and Electronics Engineering','EEE','EEE Branch under R20',1),('eee-r22','r22','Electrical and Electronics Engineering','EEE','EEE Branch under R22',1),('eee-r23','r23','Electrical and Electronics Engineering','EEE','EEE Branch under R23',1),('mech-r20','r20','Mechanical Engineering','MECH','MECH Branch under R20',1),('mech-r22','r22','Mechanical Engineering','MECH','MECH Branch under R22',1);
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `career_suggestions`
--

DROP TABLE IF EXISTS `career_suggestions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `career_suggestions` (
  `student_roll_no` varchar(32) NOT NULL,
  `suggestions` json NOT NULL,
  PRIMARY KEY (`student_roll_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `career_suggestions`
--

LOCK TABLES `career_suggestions` WRITE;
/*!40000 ALTER TABLE `career_suggestions` DISABLE KEYS */;
/*!40000 ALTER TABLE `career_suggestions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(64) NOT NULL,
  `difficulty` tinyint DEFAULT '2',
  `skills` json DEFAULT NULL,
  `career_paths` json DEFAULT NULL,
  `subject_areas` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES ('ai-deep','Deep Learning & Neural Networks','TensorFlow/Keras and neural network architectures.','Machine Learning',5,'[\"Python\", \"Deep Learning\", \"TensorFlow\"]','[\"ML Engineer\", \"Data Scientist\", \"Researcher\"]','[\"Programming\", \"Mathematics\"]'),('cloud-aws','Cloud Computing with AWS','EC2, S3, Lambda, and basic cloud architecture.','Cloud Computing',3,'[\"AWS\", \"Cloud\", \"DevOps\"]','[\"Cloud Engineer\", \"DevOps\", \"Software Developer\"]','[\"Programming\"]'),('cyber-security','Cybersecurity Basics','Network security, ethical hacking, and secure coding.','Security',3,'[\"Security\", \"Networking\", \"Cryptography\"]','[\"Security Engineer\", \"Software Developer\"]','[\"Programming\"]'),('data-science','Data Science with Python','Pandas, visualization, and exploratory data analysis.','Data Science',3,'[\"Python\", \"Pandas\", \"Visualization\", \"Statistics\"]','[\"Data Scientist\", \"Analyst\"]','[\"Programming\", \"Mathematics\"]'),('db-advanced','Advanced Database Systems','SQL optimization, NoSQL, and database design.','Databases',3,'[\"SQL\", \"NoSQL\", \"Database Design\"]','[\"Backend Developer\", \"Data Engineer\", \"Software Developer\"]','[\"DBMS\", \"Programming\"]'),('devops-ci','DevOps & CI/CD','Docker, Jenkins, GitLab CI, and deployment pipelines.','DevOps',4,'[\"Docker\", \"CI/CD\", \"Linux\"]','[\"DevOps Engineer\", \"SRE\", \"Software Developer\"]','[\"Programming\"]'),('dsa-competitive','Data Structures & Algorithms for Placements','DSA for coding interviews and competitive programming.','Programming',4,'[\"DSA\", \"Problem Solving\", \"Algorithms\"]','[\"Software Developer\", \"SDE\"]','[\"Programming\", \"Mathematics\"]'),('ml-fundamentals','Machine Learning Fundamentals','Intro to ML, regression, classification, and scikit-learn.','Machine Learning',3,'[\"Python\", \"Machine Learning\", \"Statistics\"]','[\"Data Scientist\", \"ML Engineer\", \"Software Developer\"]','[\"Programming\", \"Mathematics\"]'),('mobile-android','Android App Development','Kotlin/Java and Android SDK for mobile apps.','Mobile Development',3,'[\"Kotlin\", \"Android\", \"Mobile\"]','[\"Mobile Developer\", \"Software Developer\"]','[\"Programming\"]'),('python-adv','Advanced Python & Scripting','Deep dive into Python, OOP, and automation scripts.','Programming',2,'[\"Python\", \"OOP\", \"Scripting\"]','[\"Software Developer\", \"Backend Developer\"]','[\"Programming\"]'),('soft-skills','Communication & Soft Skills','Presentation, teamwork, and professional communication.','Soft Skills',1,'[\"Communication\", \"Leadership\"]','[\"Software Developer\", \"Manager\", \"Any\"]','[]'),('web-fullstack','Full-Stack Web Development','HTML, CSS, JavaScript, Node.js, and a frontend framework.','Web Development',3,'[\"JavaScript\", \"Node.js\", \"React\", \"HTML\", \"CSS\"]','[\"Software Developer\", \"Web Developer\", \"Frontend Developer\"]','[\"Programming\"]');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mentor_feedback`
--

DROP TABLE IF EXISTS `mentor_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mentor_feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_roll_no` varchar(32) NOT NULL,
  `category` varchar(64) NOT NULL,
  `title` varchar(255) DEFAULT 'Mentor Feedback',
  `message` text NOT NULL,
  `priority` varchar(32) DEFAULT 'low',
  `action_items` text,
  `resources` text,
  `date_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mentor_feedback`
--

LOCK TABLES `mentor_feedback` WRITE;
/*!40000 ALTER TABLE `mentor_feedback` DISABLE KEYS */;
INSERT INTO `mentor_feedback` VALUES (1,'202U1A0501','career','Build End-to-End Projects and Strengthen Core DSA','Great work maintaining a high academic standing. To prepare for upcoming placement drives, shift focus toward building two complete full-stack web applications and solving problems on LeetCode consistently.','medium','Solve 2 LeetCode medium problems daily\nComplete a full-stack CRUD application with authentication by next month\nCreate and polish a GitHub portfolio with clear README files','LeetCode, NeetCode 150, freeCodeCamp, roadmap.sh/full-stack','2026-09-11 10:04:46');
/*!40000 ALTER TABLE `mentor_feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mentors`
--

DROP TABLE IF EXISTS `mentors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mentors` (
  `id` varchar(64) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `department` varchar(64) NOT NULL,
  `students` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mentors`
--

LOCK TABLES `mentors` WRITE;
/*!40000 ALTER TABLE `mentors` DISABLE KEYS */;
INSERT INTO `mentors` VALUES ('mentor1','mentor123','Dr. Ramesh Kumar','CSE',10),('mentor2','mentor123','Dr. Suresh Reddy','ECE',5),('mentor3','mentor123','Dr. Lakshmi ECE','ECE',0),('mentor4','mentor123','Dr. EEE Head','EEE',5),('mentor5','mentor123','Dr. MECH Head','MECH',5),('mentor6','mentor123','Dr. CIVIL Head','CIVIL',5);
/*!40000 ALTER TABLE `mentors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `regulations`
--

DROP TABLE IF EXISTS `regulations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `regulations` (
  `id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `regulations`
--

LOCK TABLES `regulations` WRITE;
/*!40000 ALTER TABLE `regulations` DISABLE KEYS */;
INSERT INTO `regulations` VALUES ('r20','R20 Regulation','Autonomous Regulation 2020',1),('r21','R21 Regulation','Auto reg 2021',1),('r22','R22 Regulation','Autonomous Regulation 2022',1),('r23','R23 Regulation','Autonomous Regulation 2023',1);
/*!40000 ALTER TABLE `regulations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `roll_no` varchar(32) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `cgpa` decimal(4,2) DEFAULT NULL,
  `mentor_id` varchar(64) DEFAULT NULL,
  `mentor` varchar(255) DEFAULT NULL,
  `department` varchar(64) NOT NULL,
  `year` varchar(32) DEFAULT NULL,
  `interests` text,
  `career_goal` varchar(255) DEFAULT NULL,
  `aspirations` text,
  `swot` text,
  `academic_records` text,
  `regulation_id` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`roll_no`),
  KEY `mentor_id` (`mentor_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`mentor_id`) REFERENCES `mentors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES ('202U1A0101','student123','U. Venkat',7.90,'mentor5','Dr. MECH Head','MECH','IV B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('202U1A0201','student123','Z. Karthik',8.10,'mentor6','Dr. CIVIL Head','CIVIL','IV B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('202U1A0301','student123','K. Ravi',8.60,'mentor2','Dr. Suresh Reddy','ECE','IV B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('202U1A0401','student123','P. Sridhar',8.00,'mentor4','Dr. EEE Head','EEE','IV B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('202U1A0501','student123','E. Sneha',8.75,'mentor1','Dr. Ramesh Kumar','CSE','IV B.Tech','[\"Full Stack Development\"]','Full Stack Developer','Secure a full-time software engineering role at a tier-1 product firm by graduation, build 2 production-ready full-stack applications, and achieve a 4-star coding rating.','{\"strengths\":[\"Strong academic foundation with a 10.0 CGPA in Computer Science\",\"Solid understanding of core CS fundamentals, algorithms, and Operating Systems\",\"High discipline and rapid learning curve for new frameworks and tools\"],\"weaknesses\":[\"Limited hands-on experience deploying scalable backend systems to production\",\"Need to improve competitive programming speed on advanced DP and graph problems\",\"Public speaking and technical interview presentation confidence\"],\"opportunities\":[\"Active on-campus placement drives and industry internship programs\",\"Access to structured mentor feedback and targeted skill roadmaps\",\"Expanding demand for MERN/PERN stack developers in startup ecosystems\"],\"threats\":[\"Rapidly evolving tech stack requirements and high applicant competition\",\"Balancing final-year academic commitments with daily DSA interview prep\"]}','[{\"semester\":1,\"sgpa\":10,\"subjects\":[{\"code\":\"CS\",\"name\":\"Math\",\"credits\":3,\"grade\":\"C-\",\"points\":10,\"marks\":20}]},{\"semester\":2,\"sgpa\":8,\"subjects\":[{\"code\":\"CS201\",\"name\":\"AI\",\"credits\":3,\"marks\":85,\"grade\":\"A+\",\"points\":8}]},{\"semester\":3,\"sgpa\":7,\"subjects\":[{\"code\":\"CS301\",\"name\":\"DW\",\"credits\":3,\"grade\":\"A+\",\"points\":10,\"marks\":85}]},{\"semester\":4,\"sgpa\":10,\"subjects\":[{\"code\":\"CS401\",\"name\":\"Operating Systems\",\"credits\":3,\"grade\":\"A+\",\"points\":10,\"marks\":86}]}]',NULL),('202U1A0502','student123','F. Arjun',10.00,'mentor1','Dr. Ramesh Kumar','CSE','IV B.Tech',NULL,NULL,NULL,NULL,'[{\"semester\":4,\"sgpa\":10,\"subjects\":[{\"code\":\"CS401\",\"name\":\"OT\",\"credits\":3,\"grade\":\"A+\",\"points\":10,\"marks\":98}]}]',NULL),('212U1A0101','student123','T. Anusha',8.40,'mentor5','Dr. MECH Head','MECH','III B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('212U1A0201','student123','Y. Deepa',8.30,'mentor6','Dr. CIVIL Head','CIVIL','III B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('212U1A0301','student123','J. Nithya',8.30,'mentor2','Dr. Suresh Reddy','ECE','III B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('212U1A0401','student123','O. Kavya',8.50,'mentor4','Dr. EEE Head','EEE','III B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('212U1A0501','student123','C. Priya',5.00,'mentor1','Dr. Ramesh Kumar','CSE','III B.Tech',NULL,NULL,NULL,NULL,'[{\"semester\":3,\"sgpa\":7,\"subjects\":[{\"code\":\"CS401\",\"name\":\"DBMS\",\"credits\":3,\"marks\":65,\"grade\":\"C\",\"points\":7}]},{\"semester\":4,\"sgpa\":3,\"subjects\":[{\"code\":\"CS402\",\"name\":\"OS\",\"credits\":3,\"marks\":85,\"grade\":\"A+\",\"points\":3}]}]',NULL),('212U1A0502','student123','D. Vikram',7.80,'mentor1','Dr. Ramesh Kumar','CSE','III B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('222U1A0101','student123','Q. Ramesh',7.60,'mentor5','Dr. MECH Head','MECH','II B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('222U1A0102','student123','R. Pooja',8.20,'mentor5','Dr. MECH Head','MECH','II B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('222U1A0201','student123','V. Srinivas',7.80,'mentor6','Dr. CIVIL Head','CIVIL','II B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('222U1A0202','student123','W. Lakshmi',8.00,'mentor6','Dr. CIVIL Head','CIVIL','II B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('222U1A0301','student123','G. Vamsi',8.00,'mentor2','Dr. Suresh Reddy','ECE','II B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('222U1A0302','student123','H. Keerthi',7.70,'mentor2','Dr. Suresh Reddy','ECE','II B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('222U1A0401','student123','L. Manoj',7.90,'mentor4','Dr. EEE Head','EEE','II B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('222U1A0402','student123','M. Swathi',8.10,'mentor4','Dr. EEE Head','EEE','II B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('222U1A0501','student123','K. Sai Teja',8.70,'mentor1','Dr. Ramesh Kumar','CSE','II B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('222U1A0502','student123','P. Anjali',8.20,'mentor1','Dr. Ramesh Kumar','CSE','II B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('222U1A0503','student123','R. Kiran',7.90,'mentor1','Dr. Ramesh Kumar','CSE','II B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('232U1A0101','student123','S. Kumar',7.30,'mentor5','Dr. MECH Head','MECH','I B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('232U1A0201','student123','X. Rajesh',7.50,'mentor6','Dr. CIVIL Head','CIVIL','I B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('232U1A0301','student123','I. Sravan',7.50,'mentor2','Dr. Suresh Reddy','ECE','I B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('232U1A0401','student123','N. Teja',7.40,'mentor4','Dr. EEE Head','EEE','I B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('232U1A0501','student123','A. Divya',8.00,'mentor1','Dr. Ramesh Kumar','CSE','I B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('232U1A0502','student123','B. Rahul',7.60,'mentor1','Dr. Ramesh Kumar','CSE','I B.Tech',NULL,NULL,NULL,NULL,NULL,NULL),('232U1A3383','student123','Ananya Sharma',NULL,'mentor1','Dr. Ramesh Kumar','CSE','IV B.Tech',NULL,NULL,NULL,NULL,NULL,'r22');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` varchar(64) NOT NULL,
  `branch_id` varchar(64) NOT NULL,
  `code` varchar(32) NOT NULL,
  `name` varchar(255) NOT NULL,
  `semester` int NOT NULL,
  `credits` decimal(4,2) NOT NULL,
  `type` varchar(32) DEFAULT 'theory',
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `branch_id` (`branch_id`),
  CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES ('ai101-aiml-r23','aiml-r23','AI101','Foundations of AI and ML',1,4.00,'Theory','AI and ML fundamentals',1),('ai102-aiml-r23','aiml-r23','AI102','Mathematics for AI I',1,4.00,'Theory','Linear algebra and calculus',1),('ai103-aiml-r23','aiml-r23','AI103','Programming for AI',1,3.00,'Theory','Python for AI',1),('ai104-aiml-r23','aiml-r23','AI104','Professional Ethics',1,2.00,'Theory','Ethics in AI',1),('ai105-aiml-r23','aiml-r23','AI105','AI Programming Lab',1,2.00,'Lab','Python programming practice',1),('ai201-aiml-r23','aiml-r23','AI201','Machine Learning I',2,4.00,'Theory','Supervised learning',1),('ai202-aiml-r23','aiml-r23','AI202','Data Analytics',2,4.00,'Theory','Data analysis and visualization',1),('ai203-aiml-r23','aiml-r23','AI203','Mathematics for AI II',2,3.00,'Theory','Probability and statistics',1),('ai301-aiml-r23','aiml-r23','AI301','Deep Learning',3,4.00,'Theory','Neural networks and DL frameworks',1),('ai302-aiml-r23','aiml-r23','AI302','Natural Language Processing',3,4.00,'Theory','NLP techniques and applications',1),('ai303-aiml-r23','aiml-r23','AI303','Computer Vision',3,3.00,'Theory','Image processing and CV',1),('ai401-aiml-r23','aiml-r23','AI401','Reinforcement Learning',4,4.00,'Theory','RL algorithms and applications',1),('ai402-aiml-r23','aiml-r23','AI402','Time Series Analysis',4,3.00,'Theory','Temporal data modeling',1),('ai501-aiml-r23','aiml-r23','AI501','Generative AI',5,4.00,'Theory','GANs and diffusion models',1),('ai502-aiml-r23','aiml-r23','AI502','Edge AI and TinyML',5,3.00,'Theory','AI on edge devices',1),('ai601-aiml-r23','aiml-r23','AI601','MLOps and Deployment',6,4.00,'Theory','Model deployment and monitoring',1),('ai801-aiml-r23','aiml-r23','AI801','Project Work',8,8.00,'Project','Capstone project',1),('cs-elective1-r23','cse-r23','CS-E1','Elective I',5,3.00,'Theory','Specialized elective course',1),('cs-elective2-r23','cse-r23','CS-E2','Elective II',6,3.00,'Theory','Specialized elective course',1),('cs-elective3-r23','cse-r23','CS-E3','Elective III',7,3.00,'Theory','Specialized elective course',1),('cs101-cse-r23','cse-r23','CS101','Programming for Problem Solving',1,4.00,'Theory','Basic programming concepts and problem-solving',1),('cs102-cse-r23','cse-r23','CS102','Mathematics for Computing I',1,4.00,'Theory','Discrete mathematics and logic',1),('cs103-cse-r23','cse-r23','CS103','Applied Physics',1,3.00,'Theory','Physics fundamentals',1),('cs104-cse-r23','cse-r23','CS104','Professional Ethics and IPR',1,2.00,'Theory','Ethics and intellectual property',1),('cs105-cse-r23','cse-r23','CS105','Engineering Graphics and CAD',1,3.00,'Lab','Technical drawing and CAD',1),('cs106-cse-r23','cse-r23','CS106','Programming Lab',1,2.00,'Lab','Hands-on programming practice',1),('cs201-cse-r23','cse-r23','CS201','Data Structures',2,4.00,'Theory','Arrays, lists, trees, graphs',1),('cs202-cse-r23','cse-r23','CS202','Mathematics for Computing II',2,4.00,'Theory','Calculus and linear algebra',1),('cs203-cse-r23','cse-r23','CS203','Digital Logic Design',2,3.00,'Theory','Boolean algebra and circuits',1),('cs204-cse-r23','cse-r23','CS204','Applied Chemistry',2,3.00,'Theory','Chemistry fundamentals',1),('cs205-cse-r23','cse-r23','CS205','Data Structures Lab',2,2.00,'Lab','Implementation of data structures',1),('cs206-cse-r23','cse-r23','CS206','Digital Logic Design Lab',2,2.00,'Lab','Logic circuit design',1),('cs301-cse-r23','cse-r23','CS301','Algorithms',3,4.00,'Theory','Algorithm design and analysis',1),('cs302-cse-r23','cse-r23','CS302','Database Systems',3,4.00,'Theory','Database design and SQL',1),('cs303-cse-r23','cse-r23','CS303','Computer Architecture',3,3.00,'Theory','CPU design and organization',1),('cs304-cse-r23','cse-r23','CS304','Discrete Mathematics',3,3.00,'Theory','Sets, relations, graph theory',1),('cs305-cse-r23','cse-r23','CS305','Algorithms Lab',3,2.00,'Lab','Algorithm implementation',1),('cs306-cse-r23','cse-r23','CS306','Database Lab',3,2.00,'Lab','Database design practical',1),('cs401-cse-r23','cse-r23','CS401','Operating Systems',4,4.00,'Theory','Process management and memory',1),('cs402-cse-r23','cse-r23','CS402','Web Technologies',4,4.00,'Theory','HTML, CSS, JavaScript, Web frameworks',1),('cs403-cse-r23','cse-r23','CS403','Computer Networks',4,3.00,'Theory','Network protocols and architecture',1),('cs404-cse-r23','cse-r23','CS404','Software Engineering',4,3.00,'Theory','Software development lifecycle',1),('cs405-cse-r23','cse-r23','CS405','Operating Systems Lab',4,2.00,'Lab','OS concepts implementation',1),('cs406-cse-r23','cse-r23','CS406','Web Technologies Lab',4,2.00,'Lab','Web development practical',1),('cs501-cse-r23','cse-r23','CS501','Machine Learning',5,4.00,'Theory','Supervised and unsupervised learning',1),('cs502-cse-r23','cse-r23','CS502','Cloud Computing',5,3.00,'Theory','Cloud infrastructure and services',1),('cs503-cse-r23','cse-r23','CS503','Information Security',5,3.00,'Theory','Cryptography and cybersecurity',1),('cs505-cse-r23','cse-r23','CS505','Machine Learning Lab',5,2.00,'Lab','ML implementation',1),('cs601-cse-r23','cse-r23','CS601','Artificial Intelligence',6,4.00,'Theory','AI fundamentals and applications',1),('cs602-cse-r23','cse-r23','CS602','Big Data Analytics',6,3.00,'Theory','Hadoop, Spark, data mining',1),('cs603-cse-r23','cse-r23','CS603','Compiler Design',6,3.00,'Theory','Language processing',1),('cs605-cse-r23','cse-r23','CS605','AI Lab',6,2.00,'Lab','AI implementation',1),('cs701-cse-r23','cse-r23','CS701','Blockchain and Cryptocurrency',7,3.00,'Theory','Distributed ledger technology',1),('cs702-cse-r23','cse-r23','CS702','IoT and Edge Computing',7,3.00,'Theory','Internet of Things',1),('cs703-cse-r23','cse-r23','CS703','Natural Language Processing',7,3.00,'Theory','NLP techniques',1),('cs801-cse-r23','cse-r23','CS801','Project Work',8,8.00,'Project','Capstone project',1),('cs802-cse-r23','cse-r23','CS802','Seminar',8,2.00,'Theory','Research seminar',1),('cse-r20-1-1','cse-r20','CS101','Programming in C',1,4.00,'theory','Introduction to C Programming',1),('cse-r20-1-2','cse-r20','CS102','Data Structures',2,4.00,'theory','Data Structures and Algorithms',1),('cse-r20-2-1','cse-r20','CS201','Object Oriented Programming',3,4.00,'theory','OOP with Java',1),('cse-r20-2-2','cse-r20','CS202','Database Management Systems',4,4.00,'theory','DBMS Concepts',1),('cv101-civil-r23','civil-r23','CV101','Engineering Mechanics',1,4.00,'Theory','Statics and dynamics',1),('cv102-civil-r23','civil-r23','CV102','Mathematics I',1,4.00,'Theory','Calculus fundamentals',1),('cv103-civil-r23','civil-r23','CV103','Applied Physics',1,3.00,'Theory','Physics for civil engineering',1),('cv104-civil-r23','civil-r23','CV104','Professional Ethics',1,2.00,'Theory','Engineering ethics',1),('cv105-civil-r23','civil-r23','CV105','Survey Practice',1,2.00,'Lab','Basic surveying',1),('cv201-civil-r23','civil-r23','CV201','Strength of Materials',2,4.00,'Theory','Stress and strain analysis',1),('cv202-civil-r23','civil-r23','CV202','Building Materials',2,4.00,'Theory','Properties and testing of materials',1),('cv203-civil-r23','civil-r23','CV203','Surveying',2,3.00,'Theory','Land surveying principles',1),('cv204-civil-r23','civil-r23','CV204','Mathematics II',2,3.00,'Theory','Linear algebra and differential equations',1),('cv301-civil-r23','civil-r23','CV301','Structural Analysis I',3,4.00,'Theory','Beam and frame analysis',1),('cv302-civil-r23','civil-r23','CV302','Geotechnical Engineering I',3,4.00,'Theory','Soil properties and foundations',1),('cv303-civil-r23','civil-r23','CV303','Environmental Engineering I',3,3.00,'Theory','Water supply and treatment',1),('cv304-civil-r23','civil-r23','CV304','Transportation Engineering I',3,3.00,'Theory','Highway design and planning',1),('cv401-civil-r23','civil-r23','CV401','Structural Analysis II',4,4.00,'Theory','Advanced structural analysis',1),('cv402-civil-r23','civil-r23','CV402','Geotechnical Engineering II',4,4.00,'Theory','Foundation design',1),('cv403-civil-r23','civil-r23','CV403','Environmental Engineering II',4,3.00,'Theory','Wastewater treatment',1),('cv501-civil-r23','civil-r23','CV501','Reinforced Concrete Design',5,4.00,'Theory','RC beam and slab design',1),('cv601-civil-r23','civil-r23','CV601','Steel Structure Design',6,4.00,'Theory','Steel member and connection design',1),('cv801-civil-r23','civil-r23','CV801','Project Work',8,8.00,'Project','Capstone project',1),('ds101-aids-r23','aids-r23','DS101','Foundations of Data Science',1,4.00,'Theory','Data science fundamentals',1),('ds102-aids-r23','aids-r23','DS102','Mathematics for Data Science I',1,4.00,'Theory','Linear algebra and calculus',1),('ds103-aids-r23','aids-r23','DS103','Programming for Data Science',1,3.00,'Theory','Python fundamentals',1),('ds104-aids-r23','aids-r23','DS104','Professional Ethics',1,2.00,'Theory','Data ethics and privacy',1),('ds105-aids-r23','aids-r23','DS105','Data Science Lab I',1,2.00,'Lab','Python and data handling',1),('ds201-aids-r23','aids-r23','DS201','Data Analysis and Visualization',2,4.00,'Theory','EDA and visualization techniques',1),('ds202-aids-r23','aids-r23','DS202','Database Management Systems',2,4.00,'Theory','SQL and NoSQL databases',1),('ds203-aids-r23','aids-r23','DS203','Mathematics for Data Science II',2,3.00,'Theory','Probability and statistics',1),('ds301-aids-r23','aids-r23','DS301','Machine Learning for Data Science',3,4.00,'Theory','ML algorithms for data analysis',1),('ds302-aids-r23','aids-r23','DS302','Big Data Technologies',3,4.00,'Theory','Hadoop, Spark, distributed computing',1),('ds303-aids-r23','aids-r23','DS303','Statistical Methods',3,3.00,'Theory','Advanced statistical techniques',1),('ds401-aids-r23','aids-r23','DS401','Deep Learning for Data Science',4,4.00,'Theory','Neural networks for data analysis',1),('ds402-aids-r23','aids-r23','DS402','Advanced Analytics',4,3.00,'Theory','Predictive and prescriptive analytics',1),('ds501-aids-r23','aids-r23','DS501','Data Mining',5,4.00,'Theory','Pattern recognition and clustering',1),('ds502-aids-r23','aids-r23','DS502','Cloud Computing for Data Science',5,3.00,'Theory','Cloud platforms for data processing',1),('ds601-aids-r23','aids-r23','DS601','Data Engineering',6,4.00,'Theory','Data pipeline and architecture',1),('ds602-aids-r23','aids-r23','DS602','Business Analytics',6,3.00,'Theory','Business intelligence and decision making',1),('ds801-aids-r23','aids-r23','DS801','Project Work',8,8.00,'Project','Capstone project',1),('ec101-ece-r23','ece-r23','EC101','Circuit Theory',1,4.00,'Theory','Basic circuit analysis',1),('ec102-ece-r23','ece-r23','EC102','Mathematics I',1,4.00,'Theory','Calculus fundamentals',1),('ec103-ece-r23','ece-r23','EC103','Applied Physics',1,3.00,'Theory','Physics for electronics',1),('ec104-ece-r23','ece-r23','EC104','Professional Ethics',1,2.00,'Theory','Ethics in engineering',1),('ec105-ece-r23','ece-r23','EC105','Workshop Practice',1,2.00,'Lab','Hands-on workshop',1),('ec201-ece-r23','ece-r23','EC201','Electronic Devices and Circuits',2,4.00,'Theory','Semiconductors and circuits',1),('ec202-ece-r23','ece-r23','EC202','Signals and Systems',2,4.00,'Theory','Signal processing fundamentals',1),('ec203-ece-r23','ece-r23','EC203','Digital Electronics',2,3.00,'Theory','Digital logic',1),('ec204-ece-r23','ece-r23','EC204','Mathematics II',2,3.00,'Theory','Linear algebra and transforms',1),('ec205-ece-r23','ece-r23','EC205','Electronics Lab',2,2.00,'Lab','Circuit implementation',1),('ec301-ece-r23','ece-r23','EC301','Analog Circuits',3,4.00,'Theory','Amplifiers and filters',1),('ec302-ece-r23','ece-r23','EC302','Microprocessors',3,4.00,'Theory','Microprocessor architecture',1),('ec303-ece-r23','ece-r23','EC303','Control Systems',3,3.00,'Theory','Feedback and control',1),('ec304-ece-r23','ece-r23','EC304','Electromagnetic Theory',3,3.00,'Theory','Maxwell equations',1),('ec305-ece-r23','ece-r23','EC305','Analog Circuits Lab',3,2.00,'Lab','Amplifier design',1),('ec401-ece-r23','ece-r23','EC401','Communications I',4,4.00,'Theory','Analog communications',1),('ec402-ece-r23','ece-r23','EC402','Power Electronics',4,4.00,'Theory','Power conversion devices',1),('ec403-ece-r23','ece-r23','EC403','VLSI Design',4,3.00,'Theory','Integrated circuit design',1),('ec404-ece-r23','ece-r23','EC404','Measurement and Instrumentation',4,3.00,'Theory','Test and measurement',1),('ec405-ece-r23','ece-r23','EC405','Communications Lab',4,2.00,'Lab','Communication systems',1),('ec501-ece-r23','ece-r23','EC501','Communications II',5,4.00,'Theory','Digital communications',1),('ec502-ece-r23','ece-r23','EC502','Antenna and RF Systems',5,3.00,'Theory','RF engineering',1),('ec601-ece-r23','ece-r23','EC601','Embedded Systems',6,4.00,'Theory','Microcontroller design',1),('ec602-ece-r23','ece-r23','EC602','Optical Communications',6,3.00,'Theory','Fiber optics',1),('ec701-ece-r23','ece-r23','EC701','IoT Systems',7,3.00,'Theory','Internet of Things',1),('ec801-ece-r23','ece-r23','EC801','Project Work',8,8.00,'Project','Capstone project',1),('ece-r20-1-1','ece-r20','EC101','Electronic Devices and Circuits',1,4.00,'theory','Basic Electronic Components',1),('ece-r20-1-2','ece-r20','EC102','Digital Electronics',2,4.00,'theory','Digital Logic Design',1),('ee101-eee-r23','eee-r23','EE101','Circuit Theory',1,4.00,'Theory','Basic circuit analysis',1),('ee102-eee-r23','eee-r23','EE102','Mathematics I',1,4.00,'Theory','Calculus fundamentals',1),('ee103-eee-r23','eee-r23','EE103','Applied Physics',1,3.00,'Theory','Physics for electrical engineering',1),('ee104-eee-r23','eee-r23','EE104','Professional Ethics',1,2.00,'Theory','Engineering ethics',1),('ee105-eee-r23','eee-r23','EE105','Engineering Workshop',1,2.00,'Lab','Hands-on workshop',1),('ee201-eee-r23','eee-r23','EE201','Electromagnetic Theory',2,4.00,'Theory','Maxwell equations and fields',1),('ee202-eee-r23','eee-r23','EE202','Electrical Machines I',2,4.00,'Theory','DC and AC machines',1),('ee203-eee-r23','eee-r23','EE203','Power Systems I',2,3.00,'Theory','Power generation and transmission',1),('ee204-eee-r23','eee-r23','EE204','Mathematics II',2,3.00,'Theory','Linear transforms and differential equations',1),('ee301-eee-r23','eee-r23','EE301','Power Electronics',3,4.00,'Theory','Power conversion devices',1),('ee302-eee-r23','eee-r23','EE302','Control Systems',3,4.00,'Theory','Feedback control theory',1),('ee303-eee-r23','eee-r23','EE303','Electrical Machines II',3,3.00,'Theory','Synchronous and induction machines',1),('ee304-eee-r23','eee-r23','EE304','Signals and Systems',3,3.00,'Theory','Signal processing',1),('ee401-eee-r23','eee-r23','EE401','High Voltage Engineering',4,4.00,'Theory','HV systems and testing',1),('ee402-eee-r23','eee-r23','EE402','Power Systems II',4,4.00,'Theory','Power system analysis',1),('ee403-eee-r23','eee-r23','EE403','HVDC and FACTS',4,3.00,'Theory','Flexible AC transmission',1),('ee501-eee-r23','eee-r23','EE501','Renewable Energy Systems',5,4.00,'Theory','Solar, wind, hydro power',1),('ee601-eee-r23','eee-r23','EE601','Smart Grids',6,4.00,'Theory','Advanced power systems',1),('ee801-eee-r23','eee-r23','EE801','Project Work',8,8.00,'Project','Capstone project',1);
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-17 10:06:08
