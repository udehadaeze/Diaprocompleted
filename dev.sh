#!/bin/bash

# Diapro Development Script

case "$1" in
    "start")
        echo "Starting Diapro application..."
        docker compose up -d
        echo "Application started at http://localhost:8000"
        echo "API docs at http://localhost:8000/docs"
        ;;
    "stop")
        echo "Stopping Diapro application..."
        docker compose down
        ;;
    "restart")
        echo "Restarting Diapro application..."
        docker compose down
        docker compose up -d
        ;;
    "build")
        echo "Building Diapro application..."
        docker compose build
        ;;
    "logs")
        echo "Showing logs..."
        docker compose logs -f backend
        ;;
    "shell")
        echo "Opening shell in backend container..."
        docker compose exec backend bash
        ;;
    "db-shell")
        echo "Opening PostgreSQL shell..."
        docker compose exec db psql -U diapro_user -d diapro_db
        ;;
    "test")
        echo "Running tests..."
        docker compose exec backend python -m pytest
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|build|logs|shell|db-shell|test}"
        echo ""
        echo "Commands:"
        echo "  start     - Start the application"
        echo "  stop      - Stop the application"
        echo "  restart   - Restart the application"
        echo "  build     - Build the Docker images"
        echo "  logs      - Show application logs"
        echo "  shell     - Open shell in backend container"
        echo "  db-shell  - Open PostgreSQL shell"
        echo "  test      - Run tests"
        exit 1
        ;;
esac 