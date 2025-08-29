#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display help
show_help() {
    echo -e "${YELLOW}SmartFarm Development Script${NC}"
    echo ""
    echo "Usage: ./dev.sh [command] [options]"
    echo ""
    echo "Commands:"
    echo "  up               Start all services in detached mode"
    echo "  down             Stop and remove all containers"
    echo "  restart          Restart all services"
    echo "  logs [service]    View logs for all or a specific service"
    echo "  shell            Open a shell in the backend container"
    echo "  bash             Open a bash shell in the backend container"
    echo "  manage [cmd]     Run a Django management command"
    echo "  test [args]      Run backend tests"
    echo "  frontend         Open frontend development server"
    echo "  backend          Open backend development server"
    echo "  db               Open database shell"
    echo "  migrate          Run database migrations"
    echo "  makemigrations   Create new database migrations"
    echo "  install          Install all dependencies"
    echo "  clean            Remove all containers, networks, and volumes"
    echo "  help             Show this help message"
}

# Function to start services
start_services() {
    echo -e "${GREEN}Starting SmartFarm services...${NC}"
    docker-compose up -d
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}Stopping SmartFarm services...${NC}"
    docker-compose down
}

# Function to restart services
restart_services() {
    stop_services
    start_services
}

# Function to show logs
show_logs() {
    if [ -z "$1" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$1"
    fi
}

# Function to open a shell in the backend container
open_shell() {
    docker-compose exec backend sh
}

# Function to open a bash shell in the backend container
open_bash() {
    docker-compose exec backend bash
}

# Function to run Django management commands
run_manage() {
    docker-compose exec backend python manage.py "$@"
}

# Function to run tests
run_tests() {
    docker-compose exec -e PYTHONPATH=/app backend pytest "$@"
}

# Function to start frontend development server
start_frontend() {
    echo -e "${GREEN}Starting frontend development server...${NC}"
    cd frontend && pnpm run dev
}

# Function to start backend development server
start_backend() {
    echo -e "${GREEN}Starting backend development server...${NC}"
    cd backend && python manage.py runserver
}

# Function to open database shell
open_db_shell() {
    docker-compose exec db psql -U $POSTGRES_USER -d $POSTGRES_DB
}

# Function to run migrations
run_migrations() {
    echo -e "${GREEN}Running database migrations...${NC}"
    docker-compose exec backend python manage.py migrate
}

# Function to create migrations
make_migrations() {
    echo -e "${GREEN}Creating database migrations...${NC}"
    docker-compose exec backend python manage.py makemigrations
}

# Function to install dependencies
install_dependencies() {
    echo -e "${GREEN}Installing backend dependencies...${NC}"
    docker-compose exec backend pip install -r requirements/development.txt
    
    echo -e "${GREEN}Installing frontend dependencies...${NC}"
    cd frontend && pnpm install
    cd ..
}

# Function to clean everything
clean() {
    echo -e "${RED}Removing all containers, networks, and volumes...${NC}"
    docker-compose down -v
    docker system prune -f
    docker volume prune -f
}

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Set default values if not set
POSTGRES_USER=${DB_USER:-postgres}
POSTGRES_DB=${DB_NAME:-smartfarm}

# Parse command
case "$1" in
    up)
        start_services
        ;;
    down)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs "$2"
        ;;
    shell)
        open_shell
        ;;
    bash)
        open_bash
        ;;
    manage)
        shift
        run_manage "$@"
        ;;
    test)
        shift
        run_tests "$@"
        ;;
    frontend)
        start_frontend
        ;;
    backend)
        start_backend
        ;;
    db)
        open_db_shell
        ;;
    migrate)
        run_migrations
        ;;
    makemigrations)
        make_migrations
        ;;
    install)
        install_dependencies
        ;;
    clean)
        clean
        ;;
    help|*)
        show_help
        ;;
esac
