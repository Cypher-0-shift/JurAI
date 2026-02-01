import json
import time
from .config import create_jury_agent, create_critic_agent, create_judge_agent, llama_model, mistral_model

# Constants for Event Streaming
EVENT_JURY_THINKING = "jury_thinking"
EVENT_JURY_REPORT = "jury_report"
EVENT_CRITIC_THINKING = "critic_thinking"
EVENT_CRITIC_FEEDBACK = "critic_feedback"
EVENT_JUDGE_THINKING = "judge_thinking"
EVENT_JUDGE_VERDICT = "judge_verdict"

def run_jury_loop(jury_agent, critic_agent, task_context, max_iterations=2, on_event=None):
    """
    Runs a loop between Jury and Critic until valid or max iterations.
    Returns tuple: (final_report, trace_list)
    """
    def emit(event_type, data):
        if on_event:
            on_event(event_type, data)

    trace = []
    

    print(f"\n=== Starting Jury Loop: {jury_agent.name} ===")
    
    # 1. Jury creates initial report
    emit(EVENT_JURY_THINKING, {"msg": f"{jury_agent.name} is analyzing context..."})
    
    step_logs = []
    def jury_log_collector(msg):
        step_logs.append(msg)
        # Emit real-time thought if it's not a tool log
        if not msg.startswith("Calling Tool") and not msg.startswith("Tool Result"):
             emit(EVENT_JURY_THINKING, {"msg": msg, "is_log": True})

    current_report = jury_agent.run(
        f"Generate a compliance report based on the provided context.", 
        context=task_context,
        on_log=jury_log_collector
    )
    emit(EVENT_JURY_REPORT, {"report": current_report})
    
    trace.append({
        "agent": jury_agent.name,
        "step": "Initial Report",
        "content": current_report,
        "logs": step_logs,
        "timestamp": time.time()
    })
    
    for i in range(max_iterations):
        print(f"\n--- Iteration {i+1}/{max_iterations} ---")
        time.sleep(1) 
        
        # 2. Critic reviews report
        emit(EVENT_CRITIC_THINKING, {"msg": f"Critic is checking iteration {i+1}..."})
        
        step_logs = [] 
        def critic_log_collector(msg):
            step_logs.append(msg)
            if not msg.startswith("Calling Tool") and not msg.startswith("Tool Result"):
                emit(EVENT_CRITIC_THINKING, {"msg": msg, "is_log": True})

        critique = critic_agent.run(
            f"Review this jury report against the original requirements.",
            context={
                "original_task": task_context,
                "jury_report": current_report
            },
            on_log=critic_log_collector 
        )
        emit(EVENT_CRITIC_FEEDBACK, {"critique": critique})
        
        print(f"Critic Feedback: {critique}")
        trace.append({
            "agent": critic_agent.name,
            "step": f"Critique {i+1}",
            "content": critique,
            "logs": step_logs,
            "timestamp": time.time()
        })
        
        if "No major issues found" in critique:
            print(">> Critique passed. Loop complete.")
            break
            
        time.sleep(1) 

        # 3. Jury updates report based on critique
        emit(EVENT_JURY_THINKING, {"msg": f"Jury is refining report based on feedback..."})
        
        step_logs = []
        # Re-use jury collector but need to reset logs? 
        # Actually `step_logs` is captured by closure.
        # We need to redefine it or acknowledge that `jury_log_collector` uses the `step_logs` variable from the outer scope?
        # NO, `step_logs` is local to `run_jury_loop` scope but likely reset in the loop?
        # Wait, the code I'm replacing has `step_logs = []` right before the run.
        # But `jury_log_collector` defines `step_logs` in its closure? 
        # Python closure captures the variable. If I re-assign `step_logs = []`, the closure sees the new list IF it was declared non-local or if I define the function inside the loop.
        # To be safe, I will define `jury_refine_log_collector` inside the loop.
        
        def jury_refine_log_collector(msg):
            step_logs.append(msg)
            if not msg.startswith("Calling Tool") and not msg.startswith("Tool Result"):
                emit(EVENT_JURY_THINKING, {"msg": msg, "is_log": True})

        current_report = jury_agent.run(
            f"Refine the report based on this critique: {critique}",
            context={"previous_report": current_report},
            on_log=jury_refine_log_collector
        )
        emit(EVENT_JURY_REPORT, {"report": current_report})

        trace.append({
            "agent": jury_agent.name,
            "step": f"Refinement {i+1}",
            "content": current_report,
            "logs": step_logs,
            "timestamp": time.time()
        })
        
    return current_report, trace

def run_pipeline(context_data, on_event=None):
    """
    Orchestrates the full pipeline:
    2 Juries (in sequence) -> Judge
    
    Args:
        context_data (dict): The rich input schema.
        on_event (func): Optional callback(event_type, data)
        
    Returns:
        dict: {
            "verdict_json": str (judge output),
            "execution_trace": list (all steps)
        }
    """
    def emit(event_type, data):
        if on_event:
            on_event(event_type, data)
            
    execution_trace = []
    
    print("\n[System] Running Pipeline with Context:")
    # print(json.dumps(context_data, indent=2))

    # --- Jury 1 (Standard) ---
    jury1 = create_jury_agent("Jury_Primary", model=llama_model)
    critic1 = create_critic_agent("Critic_Reviewer", model=mistral_model)
    
    report1, trace1 = run_jury_loop(jury1, critic1, context_data, on_event=on_event)
    execution_trace.extend(trace1)
    
    # --- Judge (Gemini Flash 2.5) ---
    judge = create_judge_agent("Judge")
    
    print("\n=== Judge Deliberation ===")
    emit(EVENT_JUDGE_THINKING, {"msg": "Judge is producing final verdict..."})
    
    step_logs = []
    def judge_log_collector(msg):
        step_logs.append(msg)
        if not msg.startswith("Calling Tool") and not msg.startswith("Tool Result"):
             emit(EVENT_JUDGE_THINKING, {"msg": msg, "is_log": True})

    final_verdict = judge.run(
        "Review these jury reports and produce a final consolidated verdict.",
        context={
            "task": context_data,
            "report_1": report1
        },
        on_log=judge_log_collector
    )
    emit(EVENT_JUDGE_VERDICT, {"verdict": final_verdict})
    
    print(f"\n[DEBUG] Raw Judge Verdict: {final_verdict[:200]}...")
    
    execution_trace.append({
        "agent": judge.name,
        "step": "Final Verdict",
        "content": final_verdict,
        "logs": step_logs,
        "timestamp": time.time()
    })
    
    return {
        "verdict_json": final_verdict,
        "execution_trace": execution_trace
    }

