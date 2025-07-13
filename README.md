# Diapro - Diabetes Management Application

A comprehensive diabetes management application with a modern frontend and FastAPI backend, featuring glucose tracking, medication management, caregiver access, and more.


# 🔐 Login Credentials

**Username:** `kimmy`  
**Password:** `kim123456!`  
_The letters are all lowercase — make sure to use lowercase **k** for both username and password._

**To start the system on GitHub Codespaces**, please run:
```bash
docker-compose up --build



## Features

- **User Authentication**: Secure login/signup with JWT tokens
- **Glucose Tracking**: Monitor blood glucose levels with charts
- **Medication Management**: Add, edit, and track medications
- **Caregiver System**: Generate codes for caregiver access
- **Calendar & Reminders**: Schedule appointments and set reminders
- **Pharmacy Integration**: Request medication refills
- **Profile Management**: Update personal information

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript
- Bootstrap 5 for responsive design
- Chart.js for data visualization
- LocalStorage for client-side data persistence

### Backend
- **FastAPI**: Modern Python web framework
- **PostgreSQL**: Relational database
- **SQLAlchemy**: ORM for database operations
- **JWT**: Authentication and authorization
- **Pydantic**: Data validation and serialization

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Diapro
```

### 2. Set Up Environment
```bash
# Copy the example environment file
cp env.example .env

# Edit .env file with your configuration
# (Optional: Change database credentials, secret key, etc.)
```

### 3. Run with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build

# Or use the development script
./dev.sh start
```

### 4. Access the Application
- **Frontend**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

## Development Setup

### 1. Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Set Up Database
```bash
# Install PostgreSQL locally or use Docker
# Create database and user as specified in init.sql
```

### 4. Run the Application
```bash
# Start the FastAPI server
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile

### Medications
- `GET /api/medications/` - Get user medications
- `POST /api/medications/` - Add new medication
- `PUT /api/medications/{id}` - Update medication
- `DELETE /api/medications/{id}` - Delete medication

### Glucose
- `GET /api/glucose/` - Get glucose readings
- `POST /api/glucose/` - Add glucose reading
- `DELETE /api/glucose/` - Clear all readings

### Calendar
- `GET /api/calendar/` - Get calendar events
- `POST /api/calendar/` - Create new event
- `PUT /api/calendar/{id}` - Update event
- `DELETE /api/calendar/{id}` - Delete event

### Pharmacy
- `GET /api/pharmacy/` - Get pharmacy orders
- `POST /api/pharmacy/` - Create new order
- `PUT /api/pharmacy/{id}` - Update order status

### Caregiver
- `GET /api/caregiver/codes` - Get caregiver codes
- `POST /api/caregiver/codes` - Generate new code
- `GET /api/caregiver/notes` - Get caregiver notes
- `POST /api/caregiver/notes` - Add caregiver note

## Database Schema

The application uses the following main tables:
- `users` - User accounts and profiles
- `medications` - User medications
- `glucose_readings` - Blood glucose measurements
- `calendar_events` - Appointments and reminders
- `caregiver_codes` - Access codes for caregivers
- `caregiver_notes` - Notes from caregivers
- `pharmacy_orders` - Medication refill requests

## Security Features

- **Password Hashing**: Bcrypt for secure password storage
- **JWT Tokens**: Stateless authentication
- **CORS**: Configured for cross-origin requests
- **Input Validation**: Pydantic models for data validation
- **SQL Injection Protection**: SQLAlchemy ORM

## Docker Commands

```bash
# Build and start services
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Access database
docker-compose exec db psql -U diapro_user -d diapro_db

# Access backend container
docker-compose exec backend bash

# Remove all containers and volumes
docker-compose down -v
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://diapro_user:diapro_password@localhost:5432/diapro_db` |
| `SECRET_KEY` | JWT secret key | `your-secret-key-change-in-production` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | `30` |
| `DEBUG` | Debug mode | `true` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request



## Support

For support and questions, please open an issue in the repository. 
