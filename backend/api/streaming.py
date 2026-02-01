
import asyncio
import json
import logging
from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse

# Import your pipelines
from pipeline.core_pipeline import run_core_pipeline
from pipeline.risk_pipeline import run_risk_pipeline
from features.compliance_diff.diff_engine import generate_compliance_diff
from features.compliance_history.history_manager import get_previous_verdict

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/stream/pipeline/{feature_id}")
async def stream_pipeline(feature_id: str, request: Request):
    """
    SSE Endpoint that runs the full pipeline and streams events:
    - Jury/Critic/Judge "Doing work" events
    - Final Verdict
    - Risk Assessment (Parallel)
    - Compliance Diff (Parallel)
    """
    queue = asyncio.Queue()
    
    # Check for client disconnect
    async def cleanup():
        # Logic to cancel tasks if needed
        pass

    # Capture the main event loop to use inside the thread callback
    main_loop = asyncio.get_running_loop()

    def on_event_callback(event_type, data):
        """
        Bridge from Sync (Agent Code) -> Async Queue
        """
        # Use call_soon_threadsafe with the captured main loop
        main_loop.call_soon_threadsafe(queue.put_nowait, {"event": event_type, "data": data})

    async def event_generator():
        # 1. Start the Blocking Core Pipeline in a Thread
        # We pass the context logic here. For now, assuming context is mocked or fetched.
        # In real usage, you might pass context via POST body to a start endpoint, 
        # but for SSE GET, we typically fetch context by ID or use a default.
        
        # MOCK CONTEXT for demo - typically you'd fetch this from DB or pass it.
        # Since this is a GET request, we assume feature_id matches something in DB 
        # or we just iterate on a dummy context for the agents.
        context_data = {
            "feature_id": feature_id,
            "feature_name": "AI Search Summary", 
            "jurisdiction": "EU_AI_Act",
            "description": "Auto-summarization of user text."
        }

        # Submit the sync task to thread
        loop = asyncio.get_running_loop()
        yield {"event": "status", "data": "Pipeline Started"}

        # Define the task wrapper
        def run_sync_pipeline():
            try:
                result = run_core_pipeline(context_data, on_event=on_event_callback)
                return result
            except Exception as e:
                logger.error(f"Pipeline Error: {e}")
                raise e

        # Run core pipeline
        core_future = loop.run_in_executor(None, run_sync_pipeline)
        
        core_result = None
        
        while not core_future.done():
            # Wait for queue items OR core completion
            get_task = asyncio.create_task(queue.get())
            
            done, pending = await asyncio.wait(
                [get_task, core_future],
                return_when=asyncio.FIRST_COMPLETED
            )
            
            if get_task in done:
                event = get_task.result()
                yield {"event": event["event"], "data": json.dumps(event["data"])}
            else:
                # Core future finished, cancel the get wait
                get_task.cancel()
        
        # Core is done
        try:
            core_result = await core_future
            # Yield Verdict
            yield {"event": "verdict", "data": json.dumps(core_result.get("verdict", {}))}
            
            # 2. RUN PARALLEL TASKS (Risk + Diff)
            yield {"event": "status", "data": "Running Risk & Diff Analysis"}
            
            # Risk Wrapper
            def run_risk():
                return run_risk_pipeline(feature_id, "temp_run_id", verdict_data=core_result.get("verdict", {}))
                
            # Diff Wrapper
            def run_diff():
                prev = get_previous_verdict(feature_id)
                # ... (Simplified Diff Call for demo)
                # In real app, follow exact arguments of generate_compliance_diff
                return {"diff": "No previous version"} 

            risk_future = loop.run_in_executor(None, run_risk)
            diff_future = loop.run_in_executor(None, run_diff)
            
            # Wait for both
            results = await asyncio.gather(risk_future, diff_future, return_exceptions=True)
            risk_res, diff_res = results
            
            if isinstance(risk_res, Exception):
                logger.error(f"Risk Error: {risk_res}")
                yield {"event": "error", "data": f"Risk Failed: {str(risk_res)}"}
            else:
                yield {"event": "risk", "data": json.dumps(risk_res.get("risk_assessment", {}))}
                
            if isinstance(diff_res, Exception):
                 logger.error(f"Diff Error: {diff_res}")
            else:
                 yield {"event": "diff", "data": json.dumps(diff_res)}
                 
            yield {"event": "done", "data": "Pipeline Complete"}

        except Exception as e:
            yield {"event": "error", "data": str(e)}

    return EventSourceResponse(event_generator())
