# Weather App

A web application for tracking weather in various cities around the world with the ability to add, delete, and reorder cities.

## Description

Weather App is a full-featured application consisting of:
- **Frontend** (React + Vite) - modern user interface
- **Backend** (Node.js + Express) - REST API server
- **Database** (PostgreSQL) - city list storage

## Technologies

- **Frontend**: React 19, Vite, Axios, @dnd-kit (drag & drop), Lucide React
- **Backend**: Node.js, Express, PostgreSQL, Axios
- **Database**: PostgreSQL 15
- **Containerization**: Docker, Docker Compose

## Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac/Linux)
- [OpenWeatherMap API Key](https://openweathermap.org/api) (free account)

## Quick Start

### 1. Install Docker Desktop

1. Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Launch Docker Desktop and wait for the "Docker Desktop is running" status in the system tray

### 2. Configure API Key

1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Open the `.env` file in the project root
3. Add your API key:

```env
OPENWEATHER_API_KEY=your_api_key_here
```

### 3. Start the Project

Open a terminal in the project folder and run:

```bash
docker-compose up -d --build
```

This command will:
- Build Docker images for all services
- Start containers in the background
- Initialize the database with default cities

### 4. Check Status

Verify that all containers are running:

```bash
docker-compose ps
```

You should see 3 running containers:
- `weather-app-db-1` (PostgreSQL)
- `weather-app-server-1` (Backend API)
- `weather-app-client-1` (Frontend)

### 5. Open the Application

Open your browser and navigate to:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api

## Project Structure

```
weather-app/
├── client/                 # Frontend application (React + Vite)
│   ├── src/
│   │   ├── App.jsx         # Main component
│   │   ├── SortableCity.jsx # City component with drag & drop
│   │   └── ForecastModal.jsx # Forecast modal window
│   ├── Dockerfile
│   └── package.json
├── server/                 # Backend API (Node.js + Express)
│   ├── index.js           # Main server file
│   ├── db.js              # Database configuration
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Docker Compose configuration
├── .env                   # Environment variables (API key)
└── README.md              # This file
```

## Useful Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f db
```

### Stop Project

```bash
docker-compose down
```

### Restart Project

```bash
docker-compose restart
```

### Stop and Remove Volumes (Clear Database)

```bash
docker-compose down -v
```

### Rebuild After Changes

```bash
docker-compose up -d --build
```

## API Endpoints

### Get All Cities
```
GET /api/cities
```

### Add City
```
POST /api/cities
Body: { "name": "City Name" }
```

### Delete City
```
DELETE /api/cities/:id
```

### Reorder Cities
```
PUT /api/cities/reorder
Body: { "orderedIds": [1, 2, 3, ...] }
```

### Get Weather for City
```
GET /api/weather?city=CityName&units=metric
```

### Get Weather Forecast
```
GET /api/forecast?city=CityName&units=metric
```

## Default Cities

On first initialization, the database is automatically populated with the following cities:
- Moscow
- New York
- London
- Tokyo
- Paris
- Berlin
- Sydney
- Dubai
- Singapore
- Toronto
- Rome
- Madrid

## Configuration

### Ports

- **Frontend**: 5173
- **Backend API**: 8000
- **PostgreSQL**: 5432

### Environment Variables

The `.env` file should contain:
```env
OPENWEATHER_API_KEY=your_api_key
```

## Troubleshooting

### "unable to get image" Error

**Problem**: `open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`

**Solution**: Make sure Docker Desktop is running and working. Check the status in the system tray.

### Database Connection Error

**Problem**: Server cannot connect to PostgreSQL

**Solution**: 
1. Check that the `db` container is running: `docker-compose ps`
2. Restart services: `docker-compose restart`

### API Key Error

**Problem**: "Server API Key not configured"

**Solution**: 
1. Check the `.env` file in the project root
2. Make sure the `OPENWEATHER_API_KEY` variable is set
3. Restart the server: `docker-compose restart server`

### Port Already in Use

**Problem**: "port is already allocated"

**Solution**: 
1. Stop other applications using ports 5173, 8000, or 5432
2. Or change the ports in `docker-compose.yml`

## Development

### Local Development Without Docker

#### Backend:
```bash
cd server
npm install
npm run dev
```

#### Frontend:
```bash
cd client
npm install
npm run dev
```

**Note**: For local development, you will need to install and run PostgreSQL separately.

## License

MIT

## Author

Weather App - weather tracking project

---

**Enjoy using it!**
