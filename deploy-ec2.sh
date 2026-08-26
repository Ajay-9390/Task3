#!/bin/bash
# ==============================================================================
# GHMC Civic Services Portal - AWS EC2 Automated Docker Deployment Script
# OS: Ubuntu 22.04 / 24.04 LTS
# ==============================================================================

set -e

echo "🚀 Starting GHMC Civic Portal Automated Deployment on AWS EC2..."

# 1. Update system packages
echo "📦 Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl git unzip ca-certificates curl gnupg lsb-release

# 2. Install Docker Engine & Docker Compose
echo "🐳 Installing Docker Engine..."
if ! command -v docker &> /dev/null; then
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Allow ubuntu user to run Docker without sudo
    sudo usermod -aG docker $USER
    echo "✅ Docker installed successfully!"
else
    echo "✅ Docker is already installed."
fi

# 3. Enable & Start Docker Service
sudo systemctl enable docker
sudo systemctl start docker

# 4. Build and Launch Multi-Container Docker Stack
echo "⚙️ Building & launching GHMC Portal multi-container stack (App + PostgreSQL + Redis)..."
sudo docker compose down -v || true
sudo docker compose up --build -d

# 5. Display Status & Logs
echo "=========================================================================="
echo "🎉 DEPLOYMENT COMPLETE! GHMC Civic Services Portal is LIVE on AWS EC2."
echo "=========================================================================="
sudo docker compose ps
