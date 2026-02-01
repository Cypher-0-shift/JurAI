import os
from .core import LiteLlm, Agent
from .prompts import jury_prompt, jury_report_critic_prompt, jury_final_response_prompt
from .tools import naiverag_retrieve_tool

# --- Models ---
# Jury: Llama 3.2 (Speed & Generation)
# Jury: Llama 3.2 (Speed & Generation) -> Switched to Mistral for stability
llama_model = LiteLlm(
    model="ollama/mistral:7b-instruct", 
    api_key=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
)

# Critic: Gemini 2.0 Flash Lite (Verified Available)
mistral_model = LiteLlm(
    model="ollama/mistral:7b-instruct", 
    api_key=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
)

# Judge: Mistral 7B (High Quality Synthesis)

# Standard model for features
standard_model = LiteLlm(
    model="ollama/qwen3:4b",
    api_key=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
)


# --- Agents ---

def create_jury_agent(name, model=llama_model):
    return Agent(
        name=name,
        instruction=jury_prompt.PROMPT,
        model=model,
        tools=[naiverag_retrieve_tool] 
    )

def create_critic_agent(name, model=mistral_model):
    return Agent(
        name=name,
        instruction=jury_report_critic_prompt.PROMPT,
        model=model
    )

def create_judge_agent(name="Judge", model=mistral_model):
    return Agent(
        name=name,
        instruction=jury_final_response_prompt.PROMPT,
        model=model
    )
