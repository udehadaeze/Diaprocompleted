from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
   
    DATABASE_URL: str = "postgresql://diapro_user:diapro_password@localhost:5432/diapro_db"
    
    
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    
    APP_NAME: str = "Diapro"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings() 