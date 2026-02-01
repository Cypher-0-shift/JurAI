import os
import sys
import json
import argparse
from dotenv import load_dotenv
from agents.jury_system import run_pipeline

# Load environment variables (OPENROUTER_API_KEY, GEMINI_API_KEY)
load_dotenv()

def load_input_file(file_path):
    """
    Reads and parses a JSON input file.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Failed to parse JSON from '{file_path}'.\n{e}")
        sys.exit(1)   

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run JurAI Agents Pipeline with Rich Context")
    parser.add_argument("input_file", type=str, help="Path to the JSON input file containing product/feature context")
    
    args = parser.parse_args()
    
    context_data = load_input_file(args.input_file)
    
    # Handle list of inputs (though usually just one context object)
    if isinstance(context_data, list):
        if len(context_data) > 0:
            context = context_data[0]
            print(f"[Info] Input is a list, using first item as context.")
        else:
            print("Error: Input list is empty.")
            sys.exit(1)
    else:
        context = context_data

    # Extract feature name safely just for logging
    feature_name = context.get("feature", {}).get("name", "Unknown Feature")
    print(f"Starting JurAI Agent Pipeline for feature: '{feature_name}'...")
    
    final_output = run_pipeline(context)
    
    print("\n\n================ FINAL VERDICT ================\n")
    print(final_output)
    print("\n===============================================\n")
