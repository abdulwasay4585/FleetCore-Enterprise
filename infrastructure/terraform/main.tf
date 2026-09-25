# ═══════════════════════════════════════════════════════════════════════════
# FleetCore Enterprise — Terraform AWS Infrastructure (Section 17)
# High Availability Multi-AZ with Auto-Scaling Ingestion Layer
# ═══════════════════════════════════════════════════════════════════════════

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  backend "s3" {
    bucket = "fleetcore-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" { default = "us-east-1" }
variable "environment" { default = "production" }
variable "db_password" { sensitive = true }

# ── VPC & Networking (F16: VPC Private Subnet Isolation) ──────────────────

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = { Name = "fleetcore-${var.environment}-vpc" }
}

resource "aws_subnet" "public_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags = { Name = "fleetcore-public-a" }
}

resource "aws_subnet" "public_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "${var.aws_region}b"
  map_public_ip_on_launch = true
  tags = { Name = "fleetcore-public-b" }
}

resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = "${var.aws_region}a"
  tags = { Name = "fleetcore-private-a" }
}

resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = "${var.aws_region}b"
  tags = { Name = "fleetcore-private-b" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  tags = { Name = "fleetcore-igw" }
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_a.id
  tags = { Name = "fleetcore-nat" }
}

resource "aws_eip" "nat" {
  domain = "vpc"
}

# ── Security Groups ──────────────────────────────────────────────────────

resource "aws_security_group" "ingestion" {
  vpc_id = aws_vpc.main.id
  name   = "fleetcore-ingestion-sg"

  ingress {
    from_port   = 9095
    to_port     = 9096
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "IoT TCP/UDP ingestion (Go binary)"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "fleetcore-ingestion-sg" }
}

resource "aws_security_group" "database" {
  vpc_id = aws_vpc.main.id
  name   = "fleetcore-database-sg"

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ingestion.id]
    description     = "PostgreSQL/TimescaleDB from private subnets only"
  }

  tags = { Name = "fleetcore-database-sg" }
}

resource "aws_security_group" "kafka" {
  vpc_id = aws_vpc.main.id
  name   = "fleetcore-kafka-sg"

  ingress {
    from_port       = 9092
    to_port         = 9092
    protocol        = "tcp"
    security_groups = [aws_security_group.ingestion.id]
    description     = "Kafka broker from ingestion servers"
  }

  tags = { Name = "fleetcore-kafka-sg" }
}

# ── RDS PostgreSQL + TimescaleDB (Multi-AZ) ──────────────────────────────

resource "aws_db_subnet_group" "db" {
  name       = "fleetcore-db-subnets"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]
}

resource "aws_db_instance" "timescaledb" {
  identifier             = "fleetcore-timescaledb"
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = "db.r6g.xlarge"
  allocated_storage      = 500
  max_allocated_storage  = 2000
  storage_type           = "gp3"
  storage_encrypted      = true # F16: Data encryption at rest
  multi_az               = true # Section 30: Multi-AZ deployment
  db_name                = "fleetcore"
  username               = "fleetcore_admin"
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.db.name
  vpc_security_group_ids = [aws_security_group.database.id]
  backup_retention_period = 30
  deletion_protection     = true

  tags = { Name = "fleetcore-timescaledb-primary" }
}

# ── MSK (Managed Kafka) ──────────────────────────────────────────────────

resource "aws_msk_cluster" "kafka" {
  cluster_name           = "fleetcore-kafka"
  kafka_version          = "3.5.1"
  number_of_broker_nodes = 3

  broker_node_group_info {
    instance_type   = "kafka.m5.large"
    client_subnets  = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_groups = [aws_security_group.kafka.id]

    storage_info {
      ebs_storage_info {
        volume_size = 500
      }
    }
  }

  encryption_info {
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
  }

  tags = { Name = "fleetcore-kafka-cluster" }
}

# ── ElastiCache Redis ────────────────────────────────────────────────────

resource "aws_elasticache_subnet_group" "redis" {
  name       = "fleetcore-redis-subnets"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "fleetcore-redis"
  description          = "FleetCore Redis cluster for caching"
  node_type            = "cache.r6g.large"
  num_cache_clusters   = 2
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  subnet_group_name = aws_elasticache_subnet_group.redis.name

  tags = { Name = "fleetcore-redis" }
}

# ── ECS (Fargate) for Microservices ───────────────────────────────────────

resource "aws_ecs_cluster" "main" {
  name = "fleetcore-${var.environment}"
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ── Auto-Scaling Group for Go Ingestion Servers (Section 30) ──────────────

resource "aws_launch_template" "ingestion" {
  name_prefix   = "fleetcore-ingestion-"
  image_id      = "ami-0abcdef1234567890" # Amazon Linux 2023
  instance_type = "c6i.2xlarge"

  network_interfaces {
    security_groups = [aws_security_group.ingestion.id]
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    yum install -y docker
    systemctl start docker
    docker pull fleetcore/ingestion-server:latest
    docker run -d --net=host fleetcore/ingestion-server:latest
  EOF
  )
}

resource "aws_autoscaling_group" "ingestion" {
  desired_capacity = 3
  max_size         = 20
  min_size         = 2
  vpc_zone_identifier = [aws_subnet.public_a.id, aws_subnet.public_b.id]

  launch_template {
    id      = aws_launch_template.ingestion.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "fleetcore-ingestion-server"
    propagate_at_launch = true
  }
}

# ── Outputs ───────────────────────────────────────────────────────────────

output "vpc_id" { value = aws_vpc.main.id }
output "db_endpoint" { value = aws_db_instance.timescaledb.endpoint }
output "kafka_bootstrap" { value = aws_msk_cluster.kafka.bootstrap_brokers_tls }
output "redis_endpoint" { value = aws_elasticache_replication_group.redis.primary_endpoint_address }
output "ecs_cluster" { value = aws_ecs_cluster.main.name }
