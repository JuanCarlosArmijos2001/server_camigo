-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: camigo_prueba
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS camigo;

-- Usar la base de datos
USE camigo; 
--
-- Table structure for table `comentario`
--

DROP TABLE IF EXISTS `comentario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comentario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombreUsuario` varchar(255) NOT NULL,
  `contenido` text NOT NULL,
  `idEjercicio` int DEFAULT NULL,
  `valoracion` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idEjercicio` (`idEjercicio`),
  CONSTRAINT `comentario_ibfk_1` FOREIGN KEY (`idEjercicio`) REFERENCES `ejercicio` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cuenta`
--

DROP TABLE IF EXISTS `cuenta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuenta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `clave` varchar(255) NOT NULL,
  `usuarioAerobase` int NOT NULL DEFAULT '-1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ejercicio`
--

DROP TABLE IF EXISTS `ejercicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ejercicio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` text,
  `instrucciones` text,
  `restricciones` text,
  `solucion` text,
  `retroalimentacion` text,
  `estado` int DEFAULT NULL,
  `idSubtema` int NOT NULL,
  `valoracion` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `subtema_fk_ejercicio_idx` (`idSubtema`),
  CONSTRAINT `subtema_fk_ejercicio` FOREIGN KEY (`idSubtema`) REFERENCES `subtema` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ejercicio_pregunta`
--

DROP TABLE IF EXISTS `ejercicio_pregunta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ejercicio_pregunta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `idPregunta` int NOT NULL,
  `estado_completado` int NOT NULL DEFAULT '-1',
  PRIMARY KEY (`id`),
  KEY `idUsuario_fk_idPregunta_idx` (`idUsuario`),
  KEY `idEjercicio_fk_idSubtema` (`idPregunta`),
  CONSTRAINT `idPregunta_fk_idEjercicio` FOREIGN KEY (`idPregunta`) REFERENCES `pregunta` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `idUsuario_fk_idPregunta` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1270 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `historial`
--

DROP TABLE IF EXISTS `historial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo_entidad` enum('tema','subtema','ejercicio','pregunta') NOT NULL,
  `id_tema` int DEFAULT NULL,
  `id_subtema` int DEFAULT NULL,
  `id_ejercicio` int DEFAULT NULL,
  `id_pregunta` int DEFAULT NULL,
  `detalles` varchar(255) NOT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `id_usuario` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_tema` (`id_tema`),
  KEY `id_subtema` (`id_subtema`),
  KEY `id_ejercicio` (`id_ejercicio`),
  KEY `id_pregunta` (`id_pregunta`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `historial_ibfk_1` FOREIGN KEY (`id_tema`) REFERENCES `tema` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_ibfk_2` FOREIGN KEY (`id_subtema`) REFERENCES `subtema` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_ibfk_3` FOREIGN KEY (`id_ejercicio`) REFERENCES `ejercicio` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_ibfk_4` FOREIGN KEY (`id_pregunta`) REFERENCES `pregunta` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_ibfk_5` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=297 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `periodo_academico`
--

DROP TABLE IF EXISTS `periodo_academico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `periodo_academico` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mesInicio` date NOT NULL,
  `mesFin` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `periodo_ejercicio`
--

DROP TABLE IF EXISTS `periodo_ejercicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `periodo_ejercicio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idEjercicio` int NOT NULL,
  `idPeriodoSubtema` int NOT NULL,
  `progreso` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `ejercicio_fk_periodoEjercicio_idx` (`idEjercicio`),
  KEY `periodoSubtema_fk_periodoEjercicio_idx` (`idPeriodoSubtema`),
  CONSTRAINT `ejercicio_fk_periodoEjercicio` FOREIGN KEY (`idEjercicio`) REFERENCES `ejercicio` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `periodoSubtema_fk_periodoEjercicio` FOREIGN KEY (`idPeriodoSubtema`) REFERENCES `periodo_subtema` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=715 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `periodo_subtema`
--

DROP TABLE IF EXISTS `periodo_subtema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `periodo_subtema` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idSubtema` int NOT NULL,
  `idPeriodoTema` int NOT NULL,
  `progreso` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `subtema_fk_periodoSubtema_idx` (`idSubtema`),
  KEY `periodoTema_fk_periodoSubtema_idx` (`idPeriodoTema`),
  CONSTRAINT `periodoTema_fk_periodoSubtema` FOREIGN KEY (`idPeriodoTema`) REFERENCES `periodo_tema` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `subtema_fk_periodoSubtema` FOREIGN KEY (`idSubtema`) REFERENCES `subtema` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=875 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `periodo_tema`
--

DROP TABLE IF EXISTS `periodo_tema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `periodo_tema` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idTema` int NOT NULL,
  `idPeriodoUsuario` int NOT NULL,
  `progreso` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `tema_fk_periodoTema_idx` (`idTema`),
  KEY `periodoAcademico_fk_periodoTema_idx` (`idPeriodoUsuario`),
  CONSTRAINT `periodoAcademico_fk_periodoTema` FOREIGN KEY (`idPeriodoUsuario`) REFERENCES `periodo_usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tema_fk_periodoTema` FOREIGN KEY (`idTema`) REFERENCES `tema` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=983 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `periodo_usuario`
--

DROP TABLE IF EXISTS `periodo_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `periodo_usuario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `idPeriodoAcademico` int NOT NULL,
  `progreso` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `usuario_fk_periodoUsuario_idx` (`idUsuario`),
  KEY `periodoAcademico_fk_periodoUsuario_idx` (`idPeriodoAcademico`),
  CONSTRAINT `periodoAcademico_fk_periodoUsuario` FOREIGN KEY (`idPeriodoAcademico`) REFERENCES `periodo_academico` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usuario_fk_periodoUsuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=184 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `persona`
--

DROP TABLE IF EXISTS `persona`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `persona` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombres` varchar(255) NOT NULL,
  `apellidos` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=107 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pregunta`
--

DROP TABLE IF EXISTS `pregunta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pregunta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `enunciado` text,
  `opcion_a` text,
  `opcion_b` text,
  `opcion_c` text,
  `opcion_d` text,
  `respuesta_correcta` char(1) NOT NULL,
  `justificacion` text,
  `estado` int DEFAULT NULL,
  `idEjercicio` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ejercicio_fk_pregunta_idx` (`idEjercicio`),
  CONSTRAINT `ejercicio_fk_pregunta` FOREIGN KEY (`idEjercicio`) REFERENCES `ejercicio` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sesion`
--

DROP TABLE IF EXISTS `sesion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `estado` int DEFAULT NULL,
  `hora_creacion` datetime DEFAULT NULL,
  `hora_expiracion` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `sesion_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=314 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subtema`
--

DROP TABLE IF EXISTS `subtema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subtema` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` text,
  `objetivos` text,
  `descripcion` text,
  `ejemploCodigo` text,
  `recursos` text,
  `retroalimentacion` text,
  `estado` int DEFAULT NULL,
  `idTema` int NOT NULL,
  `valoracion` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `tema_fk_subtema_fk_idx` (`idTema`),
  CONSTRAINT `tema_fk_subtema` FOREIGN KEY (`idTema`) REFERENCES `tema` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subtema_ejercicio`
--

DROP TABLE IF EXISTS `subtema_ejercicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subtema_ejercicio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `idEjercicio` int NOT NULL,
  `estado_completado` int NOT NULL DEFAULT '-1',
  `progreso` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idEjercicio_fk_idSubtema_idx` (`idEjercicio`),
  KEY `idUsuario_fk_idEjercicio_idx` (`idUsuario`),
  CONSTRAINT `idEjercicio_fk_idSubtema` FOREIGN KEY (`idEjercicio`) REFERENCES `ejercicio` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `idUsuario_fk_idEjercicio` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1765 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tema`
--

DROP TABLE IF EXISTS `tema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tema` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` text NOT NULL,
  `objetivos` text NOT NULL,
  `descripcion` text NOT NULL,
  `recursos` text NOT NULL,
  `estado` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tema_subtema`
--

DROP TABLE IF EXISTS `tema_subtema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tema_subtema` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `idSubtema` int NOT NULL,
  `estado_completado` int NOT NULL DEFAULT '-1',
  `progreso` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idSubtema_fk_idx` (`idSubtema`),
  KEY `idUsuario_fk_idSubtema_idx` (`idUsuario`),
  CONSTRAINT `idSubtema_fk_idTema` FOREIGN KEY (`idSubtema`) REFERENCES `subtema` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `idUsuario_fk_idSubtema` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2065 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `persona_id` int DEFAULT NULL,
  `cuenta_id` int DEFAULT NULL,
  `rol_id` int DEFAULT NULL,
  `progreso` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `persona_id` (`persona_id`),
  KEY `cuenta_id` (`cuenta_id`),
  KEY `rol_id` (`rol_id`),
  CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usuario_ibfk_2` FOREIGN KEY (`cuenta_id`) REFERENCES `cuenta` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usuario_ibfk_3` FOREIGN KEY (`rol_id`) REFERENCES `rol` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuario_tema`
--

DROP TABLE IF EXISTS `usuario_tema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_tema` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `idTema` int NOT NULL,
  `estado_completado` int NOT NULL DEFAULT '-1',
  `progreso` int NOT NULL DEFAULT '0',
  `valoracion` int NOT NULL DEFAULT '-1',
  PRIMARY KEY (`id`),
  KEY `idUsuario_fk_idx` (`idUsuario`),
  KEY `idTema_fk_idx` (`idTema`),
  CONSTRAINT `idTema_fk_idUsuario` FOREIGN KEY (`idTema`) REFERENCES `tema` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `idUsuario_fk_idTema` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1643 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-27 15:13:29
