from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
import logging
from config import MONGODB_URL, DATABASE_NAME

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    database = None

    @classmethod
    async def connect_db(cls):
        try:
            cls.client = AsyncIOMotorClient(MONGODB_URL)
            cls.database = cls.client[DATABASE_NAME]
            await cls.client.admin.command('ping')
            logger.info("Connected to MongoDB")
        except ConnectionFailure as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    @classmethod
    async def close_db(cls):
        if cls.client:
            cls.client.close()
            logger.info("Disconnected from MongoDB")

    @classmethod
    def get_database(cls):
        return cls.database