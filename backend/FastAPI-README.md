# BDPA-Hackathon

A high-performance Python API built with FastAPI.

## Features

- ⚡ **Fast**: Built on FastAPI, one of the fastest Python web frameworks
- 📝 **Auto Documentation**: Interactive API docs at `/docs` and `/redoc`
- ✅ **Type Validation**: Automatic request/response validation with Pydantic
- 🔒 **CORS Enabled**: Configured for cross-origin requests
- 🏥 **Health Check**: Built-in health check endpoint

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the API

### Development Server
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Base Endpoints
- `GET /` - Welcome message and API info
- `GET /health` - Health check endpoint

### Items CRUD
- `GET /items` - Get all items
- `GET /items/{item_id}` - Get item by ID
- `POST /items` - Create new item
- `PUT /items/{item_id}` - Update item
- `DELETE /items/{item_id}` - Delete item

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Example Usage

### Create an item
```bash
curl -X POST "http://localhost:8000/items" \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop", "description": "Gaming laptop", "price": 1299.99}'
```

### Get all items
```bash
curl http://localhost:8000/items
```

### Get item by ID
```bash
curl http://localhost:8000/items/1
```

## Project Structure

```
.
├── main.py           # FastAPI application
├── requirements.txt  # Python dependencies
└── README.md        # This file
```

## Notes

- The current implementation uses in-memory storage. For production, replace with a proper database (PostgreSQL, MongoDB, etc.)
- CORS is currently set to allow all origins. Update `allow_origins` in production for security.
