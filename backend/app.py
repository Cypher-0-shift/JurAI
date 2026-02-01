import logging
import json
import uuid
import datetime
import os
from typing import Dict, Any, Optional

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
# from pymongo.database import Database  <-- Removed MongoDB import
from pydantic import BaseModel, EmailStr

# --- Project Imports ---
# from database.database import get_database <-- Removed MongoDB dependency
from features import auth
# from features.auth import get_current_user <-- Removed Auth dependency
from api.streaming import router as streaming_router

# --- Pipeline Imports ---
from pipeline.core_pipeline import run_core_pipeline
from pipeline.risk_pipeline import run_risk_pipeline
from pipeline.autofix_pipeline import run_autofix_pipeline

# --- App Configuration ---
app = FastAPI(title="JurAI Compliance System")

# Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- CORS Configuration ---
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "*" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include external routers
app.include_router(streaming_router)

# --- Local Storage Helper (Replacing MongoDB) ---
STORAGE_FILE = "temp_data.json"

def load_data() -> Dict[str, Any]:
    if not os.path.exists(STORAGE_FILE):
        return {"users": [], "compliance_runs": []}
    try:
        with open(STORAGE_FILE, "r") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {"users": [], "compliance_runs": []}

def save_data(data: Dict[str, Any]):
    with open(STORAGE_FILE, "w") as f:
        json.dump(data, f, indent=4, default=str)

# --- Pydantic Request Models ---

class PipelineRequest(BaseModel):
    feature_id: Optional[str] = None
    context_data: Dict[str, Any]

class RiskRequest(BaseModel):
    feature_id: str
    run_id: str

class AutofixRequest(BaseModel):
    feature_id: str
    run_id: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

# --- Auth Routes ---

# @app.post("/auth/register", status_code=201)
# def register(user: UserCreate, db: Database = Depends(get_database)):
#     # Check if user exists
#     existing_user = db.users.find_one({"$or": [{"email": user.email}, {"username": user.username}]})
#     if existing_user:
#         raise HTTPException(
#             status_code=400,
#             detail="Username or email already registered"
#         )
#     
#     # Hash password
#     hashed_password = auth.get_password_hash(user.password)
#     
#     # Create User
#     user_doc = {
#         "username": user.username,
#         "email": user.email,
#         "password_hash": hashed_password,
#         "provider": "local",
#         "created_at": datetime.datetime.utcnow().isoformat()
#     }
#     
#     db.users.insert_one(user_doc)
#     
#     return {"message": "User registered successfully"}

@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Mock Login Implementation (Since DB is disabled)
    # Allows any login for now or fails gracefully
    
    # Just return a mock token for development
    access_token_expires = datetime.timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": form_data.username},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

    # Original Logic (Disabled)
    # user = db.users.find_one({"username": form_data.username})
    # if not user: ...

# --- Admin/Test Routes ---

@app.post("/admin/import_verdict")
def import_verdict(
    payload: Dict[str, Any]
):
    run_id = str(uuid.uuid4())
    feature_id = payload.get("feature_id", "unknown_feature")
    
    # Construct the run document
    run_doc = {
        "run_id": run_id,
        "feature_id": feature_id,
        "timestamp": payload.get("timestamp") or datetime.datetime.utcnow().isoformat(),
        "verdict_json": payload.get("verdict"), 
        "agent_trace": None,
        "risk_json": None,
        "autofix_json": None,
        "status": "IMPORTED_VERDICT"
    }
    
    data = load_data()
    data["compliance_runs"].append(run_doc)
    save_data(data)
    
    return {"run_id": run_id, "feature_id": feature_id}

# --- Pipeline Routes (Auth Removed) ---

from fastapi import BackgroundTasks

def background_core_task(run_id: str, feature_id: str, context_data: Dict[str, Any]):
    """
    Executes the pipeline in the background and updates storage incrementally.
    """
    try:
        def on_event_handler(event_type, data):
            # Load current data
            db_data = load_data()
            run_record = next((r for r in db_data["compliance_runs"] if r["run_id"] == run_id), None)
            
            if run_record:
                # Update trace based on event
                # Note: This is a simplified trace update. 
                # Ideally, we should append to run_record['agent_trace']
                # But jury_system return the FULL trace at the end.
                # So here we might want to just append log messages or specialized events.
                # For now, let's just log status updates.
                pass 

        # We need a way to capture the trace iteratively.
        # The best way is to pass a mutable list or a callback to run_core_pipeline
        # that updates the DB on every major step.
        
        # Define a callback that actually writes to DB
        def save_progress(event_type, event_data):
            try:
                db_data = load_data()
                run_record = next((r for r in db_data["compliance_runs"] if r["run_id"] == run_id), None)
                if not run_record:
                    return

                # Initialize trace if None
                if run_record.get("agent_trace") is None:
                    run_record["agent_trace"] = []

                # Determine Agent Name
                agent_name = "System"
                if "jury" in event_type:
                    agent_name = "Jury_Primary"
                elif "critic" in event_type:
                    agent_name = "Critic_Reviewer"
                elif "judge" in event_type:
                    agent_name = "Judge"

                # Check if this is a streaming log (insight)
                is_log = event_data.get("is_log", False)
                message = event_data.get("msg", "") or event_data.get("report") or event_data.get("critique") or event_data.get("verdict")
                
                if is_log:
                    # Find the last active item for this agent to append log
                    # We look backwards for the first item matching this agent
                    target_item = None
                    if run_record["agent_trace"]:
                        for item in reversed(run_record["agent_trace"]):
                            if item["agent"] == agent_name:
                                target_item = item
                                break
                    
                    if target_item:
                        if "logs" not in target_item:
                            target_item["logs"] = []
                        target_item["logs"].append(message)
                        save_data(db_data)
                        return # Done for log update

                # Standard Event - Create New Trace Item
                timestamp = datetime.datetime.utcnow().isoformat()
                
                trace_item = {
                    "agent": agent_name,
                    "step": event_type,
                    "content": str(message)[:200] if message else "", # Preview
                    "timestamp": timestamp,
                    "logs": [],
                    "is_realtime": True
                }
                
                # Append and Save
                run_record["agent_trace"].append(trace_item)
                save_data(db_data)
                
            except Exception as e:
                logger.error(f"Error saving progress: {e}")

        # Run Pipeline
        logger.info(f"Starting Background Pipeline for {run_id}")
        result = run_core_pipeline(context_data, on_event=save_progress)
        
        # Final Save with Complete Result (overwrites the incremental partials with the clean full trace)
        db_data = load_data()
        run_record = next((r for r in db_data["compliance_runs"] if r["run_id"] == run_id), None)
        if run_record:
            run_record["verdict_json"] = result.get("verdict")
            run_record["agent_trace"] = result.get("agent_trace") # The full detailed trace
            run_record["status"] = "CORE_COMPLETED"
            save_data(db_data)
            
    except Exception as e:
        logger.error(f"Background Task Failed: {e}")
        # Update status to FAILED
        try:
            db_data = load_data()
            run_record = next((r for r in db_data["compliance_runs"] if r["run_id"] == run_id), None)
            if run_record:
                run_record["status"] = "FAILED"
                save_data(db_data)
        except:
            pass

@app.post("/run/core")
async def trigger_core_pipeline(
    request: PipelineRequest,
    background_tasks: BackgroundTasks
):
    """
    Triggers Pipeline A (Core) asynchronously.
    Returns run_id immediately.
    """
    run_id = str(uuid.uuid4())
    # Generate feature_id if not provided, or use provided
    feature_id = request.feature_id or f"feat_{run_id[:8]}"
    
    # 1. Create Initial Record
    initial_doc = {
        "run_id": run_id,
        "feature_id": feature_id,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "verdict_json": None,
        "agent_trace": [],
        "risk_json": None,
        "autofix_json": None,
        "status": "IN_PROGRESS"
    }
    
    data = load_data()
    data["compliance_runs"].append(initial_doc)
    save_data(data)
    
    # 2. Add to Background Tasks
    background_tasks.add_task(background_core_task, run_id, feature_id, request.context_data)
    
    return {
        "run_id": run_id,
        "feature_id": feature_id,
        "status": "IN_PROGRESS",
        "message": "Pipeline started in background"
    }

@app.post("/run/risk")
def trigger_risk_pipeline(
    request: RiskRequest
):
    """
    Triggers Pipeline B (Risk). Publicly accessible.
    """
    data = load_data()
    
    # Verify Run exists
    run_record = next((r for r in data["compliance_runs"] if r["run_id"] == request.run_id), None)
    
    if not run_record:
        raise HTTPException(status_code=404, detail="Run ID not found")
        
    try:
        result = run_risk_pipeline(
            feature_id=request.feature_id, 
            run_id=request.run_id,
            verdict_data=run_record.get("verdict_json")
        )
        
        # Update Record
        run_record["risk_json"] = result.get("risk_assessment")
        run_record["status"] = "RISK_COMPLETED"
        
        save_data(data)
        
        return result
    except Exception as e:
        logger.error(f"Risk Pipeline failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/run/autofix")
def trigger_autofix_pipeline(
    request: AutofixRequest
):
    """
    Triggers Pipeline C (Auto-fix). Publicly accessible.
    """
    data = load_data()
    
    run_record = next((r for r in data["compliance_runs"] if r["run_id"] == request.run_id), None)
    
    if not run_record:
        raise HTTPException(status_code=404, detail="Run ID not found")
        
    try:
        result = run_autofix_pipeline(
            feature_id=request.feature_id,
            run_id=request.run_id,
            verdict_data=run_record.get("verdict_json"),
            risk_data=run_record.get("risk_json")
        )
        
        # Update Record
        run_record["autofix_json"] = result.get("auto_fix")
        run_record["status"] = "AUTOFIX_COMPLETED"
        
        save_data(data)
        
        return result
    except Exception as e:
        logger.error(f"Autofix Pipeline failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/results/{feature_id}/{run_id}")
def get_run_results(
    feature_id: str, 
    run_id: str
):
    """
    Fetch full results from DB. Publicly accessible.
    """
    data = load_data()
    
    run_record = next((r for r in data["compliance_runs"] if r["run_id"] == run_id and r["feature_id"] == feature_id), None)
    
    if not run_record:
        raise HTTPException(status_code=404, detail="Result not found")
        
    return {
        "feature_id": run_record["feature_id"],
        "run_id": run_record["run_id"],
        "timestamp": run_record["timestamp"],
        "verdict": run_record.get("verdict_json"),
        "risk_assessment": run_record.get("risk_json"),
        "auto_fix": run_record.get("autofix_json"),
        "agent_trace": run_record.get("agent_trace"),
        "status": run_record.get("status")
    }