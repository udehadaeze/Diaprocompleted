# Diapro - Diabetes Management Application

A comprehensive diabetes management application with a modern frontend and FastAPI backend, featuring glucose tracking, medication management, caregiver access, and more.

## How to Run This Project in GitHub Codespaces

To test the Diapro application inside **GitHub Codespaces**, follow these steps:

1. **Create a Codespace from the Repository**  
   Open the repository and click the `<> Code` dropdown, then select **"Codespaces" → "Create Codespace on main"**.

2. **Build and Start the Application**  
   Once inside the Codespace terminal, run:

   ```bash
   docker-compose up --build
   ```

3. **Access the Application**
   After the build finishes, open the forwarded port (usually port `8000`).
   Go to the **"Ports"** tab → find port `8000` → click **"Open in Browser"**.

4. **Create a New User**
   On the landing page, click **"Sign Up"** to register a new user.

5. **Explore the App**
   Once logged in, you'll be redirected to the homepage where you can explore:

   * Glucose tracking with visual charts
   * Medication management
   * Appointment scheduling
   * Caregiver features
   * And more!

That's it! The app should now be fully functional inside Codespaces.

---

## Features

* **User Authentication**: Secure login/signup with JWT tokens
* **Glucose Tracking**: Monitor blood glucose levels with charts
* **Medication Management**: Add, edit, and track medications
* **Caregiver System**: Generate codes for caregiver access
* **Calendar & Reminders**: Schedule appointments and set reminders
* **Pharmacy Integration**: Request medication refills
* **Profile Management**: Update personal information

---

## Tech Stack

### Frontend

* HTML5, CSS3, JavaScript
* Bootstrap 5 for responsive design
* Chart.js for data visualization
* LocalStorage for client-side data persistence

### Backend

* FastAPI (Python)
* PostgreSQL
* SQLAlchemy ORM
* JWT Authentication
* Pydantic for validation

### Infrastructure

* Docker
* Docker Compose

---

## Quick Start

### Prerequisites

* Docker and Docker Compose
* Git

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

* Frontend: [http://localhost:8000](http://localhost:8000)
* API Docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)
* Redoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

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

* Install PostgreSQL locally or use Docker
* Create database and user as specified in `init.sql`

### 4. Run the Application

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## API Endpoints

### Authentication

* `POST /api/auth/signup` – User registration
* `POST /api/auth/login` – User login

### Users

* `GET /api/users/me` – Get current user profile
* `PUT /api/users/me` – Update user profile

### Medications

* `GET /api/medications/` – Get user medications
* `POST /api/medications/` – Add new medication
* `PUT /api/medications/{id}` – Update medication
* `DELETE /api/medications/{id}` – Delete medication

### Glucose

* `GET /api/glucose/` – Get glucose readings
* `POST /api/glucose/` – Add glucose reading
* `DELETE /api/glucose/` – Clear all readings

### Calendar

* `GET /api/calendar/` – Get calendar events
* `POST /api/calendar/` – Create new event
* `PUT /api/calendar/{id}` – Update event
* `DELETE /api/calendar/{id}` – Delete event

### Pharmacy

* `GET /api/pharmacy/` – Get pharmacy orders
* `POST /api/pharmacy/` – Create new order
* `PUT /api/pharmacy/{id}` – Update order status

### Caregiver

* `GET /api/caregiver/codes` – Get caregiver codes
* `POST /api/caregiver/codes` – Generate new code
* `GET /api/caregiver/notes` – Get caregiver notes
* `POST /api/caregiver/notes` – Add caregiver note

---

## Database Schema

Main tables used:

* `users` – User accounts and profiles
* `medications` – User medications
* `glucose_readings` – Blood glucose measurements
* `calendar_events` – Appointments and reminders
* `caregiver_codes` – Access codes for caregivers
* `caregiver_notes` – Notes from caregivers
* `pharmacy_orders` – Medication refill requests

---

## Security Features

* **Password Hashing**: Bcrypt
* **JWT Tokens**: Stateless authentication
* **CORS**: Configured for secure cross-origin requests
* **Input Validation**: Pydantic
* **ORM Protection**: SQLAlchemy

---

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

---

## Environment Variables

| Variable                      | Description                      | Default                                                             |
| ----------------------------- | -------------------------------- | ------------------------------------------------------------------- |
| `DATABASE_URL`                | PostgreSQL connection string     | `postgresql://diapro_user:diapro_password@localhost:5432/diapro_db` |
| `SECRET_KEY`                  | JWT secret key                   | `your-secret-key-change-in-production`                              |
| `ALGORITHM`                   | JWT algorithm                    | `HS256`                                                             |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time in minutes | `30`                                                                |
| `DEBUG`                       | Debug mode toggle                | `true`                                                              |

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## Support

For issues or questions, please open an issue in this repository. 


