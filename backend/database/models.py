from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr

# --- User Models ---

class UserSchema(BaseModel):
    username: Optional[str] = None
    email: EmailStr
    password_hash: Optional[str] = None # Optional for OAuth users
    provider: str = "local" # 'local', 'google', 'github'
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class UserInDB(UserSchema):
    id: str = Field(alias="_id")

# --- Compliance Run Models ---

class ComplianceRunSchema(BaseModel):
    run_id: str
    feature_id: str
    timestamp: str # ISO format string
    
    verdict_json: Optional[Dict[str, Any]] = None
    risk_json: Optional[Dict[str, Any]] = None
    autofix_json: Optional[Dict[str, Any]] = None
    agent_trace: Optional[List[Dict[str, Any]]] = None
    
    status: str = "PENDING"  # PENDING, CORE_COMPLETED, RISK_COMPLETED, etc.
    
    class Config:
        populate_by_name = True
