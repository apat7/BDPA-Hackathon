from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

# Create FastAPI instance
app = FastAPI(
    title="Fast Python API",
    description="A high-performance API built with FastAPI",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response validation
class Item(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    price: float

class ItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

# In-memory storage (replace with database in production)
items_db = []
next_id = 1

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Fast Python API",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Get all items
@app.get("/items", response_model=List[Item])
async def get_items():
    return items_db

# Get item by ID
@app.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: int):
    item = next((item for item in items_db if item["id"] == item_id), None)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

# Create new item
@app.post("/items", response_model=Item, status_code=201)
async def create_item(item: ItemCreate):
    global next_id
    new_item = {
        "id": next_id,
        "name": item.name,
        "description": item.description,
        "price": item.price
    }
    items_db.append(new_item)
    next_id += 1
    return new_item

# Update item
@app.put("/items/{item_id}", response_model=Item)
async def update_item(item_id: int, item: ItemCreate):
    item_index = next((i for i, item in enumerate(items_db) if item["id"] == item_id), None)
    if item_index is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    updated_item = {
        "id": item_id,
        "name": item.name,
        "description": item.description,
        "price": item.price
    }
    items_db[item_index] = updated_item
    return updated_item

# Delete item
@app.delete("/items/{item_id}", status_code=204)
async def delete_item(item_id: int):
    item_index = next((i for i, item in enumerate(items_db) if item["id"] == item_id), None)
    if item_index is None:
        raise HTTPException(status_code=404, detail="Item not found")
    items_db.pop(item_index)
    return None

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

