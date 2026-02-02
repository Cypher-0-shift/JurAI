import json
import time
from datetime import datetime

from .config import (
    create_jury_agent,
    create_critic_agent,
    create_judge_agent,
)

# =========================================================
# Event Constants (DO NOT CHANGE – used by frontend & SSE)
# =========================================================
EVENT_JURY_THINKING = "jury_thinking"
EVENT_JURY_REPORT = "jury_report"
EVENT_CRITIC_THINKING = "critic_thinking"
EVENT_CRITIC_FEEDBACK = "critic_feedback"
EVENT_JUDGE_THINKING = "judge_thinking"
EVENT_JUDGE_VERDICT = "judge_verdict"


# =========================================================
# Jury ↔ Critic Loop
# =========================================================
def run_jury_loop(
    jury_agent,
    critic_agent,
    task_context,
    max_iterations: int = 2,
    on_event=None
):
    """
    Runs a loop between Jury and Critic until valid or max iterations.
    Returns:
        (final_report: str, trace: list)
    """

    def emit(event_type, data):
        if on_event:
            on_event(event_type, data)

    trace = []

    # ------------------ Initial Jury Report ------------------
    emit(EVENT_JURY_THINKING, {"msg": f"{jury_agent.name} is analyzing context..."})

    step_logs = []

    def jury_log_collector(msg):
        step_logs.append(msg)
        if not msg.startswith("Calling Tool") and not msg.startswith("Tool Result"):
            emit(EVENT_JURY_THINKING, {"msg": msg, "is_log": True})

    current_report = jury_agent.run(
        "Generate a compliance report based on the provided context.",
        context=task_context,
        on_log=jury_log_collector,
    )

    emit(EVENT_JURY_REPORT, {"report": current_report})

    trace.append({
        "agent": jury_agent.name,
        "step": "Initial Report",
        "content": current_report,
        "logs": step_logs,
        "timestamp": datetime.utcnow().isoformat(),
    })

    # ------------------ Iterative Critique Loop ------------------
    for i in range(max_iterations):
        time.sleep(0.5)

        emit(EVENT_CRITIC_THINKING, {"msg": f"Critic reviewing iteration {i + 1}..."})

        step_logs = []

        def critic_log_collector(msg):
            step_logs.append(msg)
            if not msg.startswith("Calling Tool") and not msg.startswith("Tool Result"):
                emit(EVENT_CRITIC_THINKING, {"msg": msg, "is_log": True})

        critique = critic_agent.run(
            "Review this jury report against the original requirements.",
            context={
                "original_task": task_context,
                "jury_report": current_report,
            },
            on_log=critic_log_collector,
        )

        emit(EVENT_CRITIC_FEEDBACK, {"critique": critique})

        trace.append({
            "agent": critic_agent.name,
            "step": f"Critique {i + 1}",
            "content": critique,
            "logs": step_logs,
            "timestamp": datetime.utcnow().isoformat(),
        })

        # Exit early if critique passes
        if "No major issues found" in critique:
            break

        time.sleep(0.5)

        # ------------------ Jury Refinement ------------------
        emit(EVENT_JURY_THINKING, {"msg": "Jury refining report based on critique..."})

        step_logs = []

        def jury_refine_log_collector(msg):
            step_logs.append(msg)
            if not msg.startswith("Calling Tool") and not msg.startswith("Tool Result"):
                emit(EVENT_JURY_THINKING, {"msg": msg, "is_log": True})

        current_report = jury_agent.run(
            "Refine the report based on this critique.",
            context={
                "previous_report": current_report,
                "critique": critique,
            },
            on_log=jury_refine_log_collector,
        )

        emit(EVENT_JURY_REPORT, {"report": current_report})

        trace.append({
            "agent": jury_agent.name,
            "step": f"Refinement {i + 1}",
            "content": current_report,
            "logs": step_logs,
            "timestamp": datetime.utcnow().isoformat(),
        })

    return current_report, trace


# =========================================================
# Full Pipeline Orchestration
# =========================================================
def run_pipeline(context_data, on_event=None):
    """
    Orchestrates:
        Jury → Critic loop → Judge

    Returns:
        {
            "verdict_json": str,
            "execution_trace": list
        }
    """

    def emit(event_type, data):
        if on_event:
            on_event(event_type, data)

    execution_trace = []

    # ------------------ Jury + Critic ------------------
    jury = create_jury_agent("Jury_Primary")
    critic = create_critic_agent("Critic_Reviewer")

    report, trace = run_jury_loop(
        jury,
        critic,
        context_data,
        on_event=on_event,
    )

    execution_trace.extend(trace)

    # ------------------ Judge ------------------
    judge = create_judge_agent("Judge")

    emit(EVENT_JUDGE_THINKING, {"msg": "Judge is producing final verdict..."})

    step_logs = []

    def judge_log_collector(msg):
        step_logs.append(msg)
        if not msg.startswith("Calling Tool") and not msg.startswith("Tool Result"):
            emit(EVENT_JUDGE_THINKING, {"msg": msg, "is_log": True})

    final_verdict = judge.run(
        "Review the jury report and produce a final consolidated verdict.",
        context={
            "task": context_data,
            "jury_report": report,
        },
        on_log=judge_log_collector,
    )

    emit(EVENT_JUDGE_VERDICT, {"verdict": final_verdict})

    execution_trace.append({
        "agent": judge.name,
        "step": "Final Verdict",
        "content": final_verdict,
        "logs": step_logs,
        "timestamp": datetime.utcnow().isoformat(),
    })

    return {
        "verdict_json": final_verdict,
        "execution_trace": execution_trace,
    }
