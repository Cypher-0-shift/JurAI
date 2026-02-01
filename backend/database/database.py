import os
from pymongo import MongoClient
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Default to local if not set. User said they have connection string, 
# likely will set MONGODB_URI in env or .env file.
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = "jurai_db"

client = None
db = None

def get_database():
    """
    Returns the MongoDB database instance.
    Lazy initialization.
    """
    global client, db
    if db is None:
        try:
            logger.info(f"Connecting to MongoDB at {MONGODB_URI}...")
            client = MongoClient(MONGODB_URI)
            db = client[DB_NAME]
            # Test connection
            client.admin.command('ping')
            logger.info("MongoDB connection successful.")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise e
    return db

def close_mongo_connection():
    global client
    if client:
        client.close()
