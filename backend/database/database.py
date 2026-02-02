import os
from pymongo import MongoClient
from pymongo.server_api import ServerApi
import logging
import certifi

logger = logging.getLogger(__name__)

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = "jurai_db"

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not set")

client = None
db = None

def get_database():
    global client, db
    if db is None:
        try:
            logger.info("Connecting to MongoDB Atlas...")
            client = MongoClient(MONGODB_URI, server_api=ServerApi('1'), tlsCAFile=certifi.where())
            db = client[DB_NAME]
            client.admin.command("ping")
            logger.info("MongoDB Atlas connection successful")
        except Exception as e:
            logger.error(f"MongoDB connection failed: {e}")
            raise
    return db

def close_mongo_connection():
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed")
