import os
from .core import LiteLlm, Agent
from .prompts import (
    jury_prompt,
    jury_report_critic_prompt,
    jury_final_response_prompt
)
from .tools import naiverag_retrieve_tool

# =========================================================
# AI Provider Switch
# =========================================================
# ollama -> local development
# groq   -> public production (Render)
AI_PROVIDER = os.getenv("AI_PROVIDER", "groq")


def _build_model(role: str) -> LiteLlm:
    """
    Internal helper to build a LiteLlm model
    without breaking existing variable names.
    """

    # ---------------- PRODUCTION (PUBLIC) ----------------
    # if AI_PROVIDER == "groq": # Force Groq path
    model_map = {
        "jury": "groq/llama-3.1-8b-instant",
        "critic": "groq/llama-3.1-8b-instant",
        "judge": "groq/llama-3.1-8b-instant",
        "standard": "groq/llama-3.1-8b-instant",
    }

    return LiteLlm(
        model=model_map[role],
        api_key=os.getenv("GROQ_API_KEY"),
        max_tokens=512,
        temperature=0.2,
    )

    # ---------------- LOCAL DEVELOPMENT (DISABLED) ----------------
    # return LiteLlm(
    #    model="ollama/mistral:7b-instruct",
    #    api_key=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
    # )


# =========================================================
# Model Instances (DO NOT RENAME – used elsewhere)
# =========================================================
llama_model = _build_model("jury")
mistral_model = _build_model("critic")
standard_model = _build_model("standard")


# =========================================================
# Agent Factories (SIGNATURES UNCHANGED)
# =========================================================

def create_jury_agent(name, model=llama_model):
    return Agent(
        name=name,
        instruction=jury_prompt.PROMPT,
        model=model,
        tools=[naiverag_retrieve_tool],
    )


def create_critic_agent(name, model=mistral_model):
    return Agent(
        name=name,
        instruction=jury_report_critic_prompt.PROMPT,
        model=model,
    )


def create_judge_agent(name="Judge", model=mistral_model):
    return Agent(
        name=name,
        instruction=jury_final_response_prompt.PROMPT,
        model=model,
    )
