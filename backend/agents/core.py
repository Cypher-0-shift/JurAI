import os
import json
from litellm import completion

class LiteLlm:
    def __init__(self, model, api_key=None):
        self.model = model
        self.api_key = api_key

    def complete(self, messages, tools=None):
        kwargs = {
            "model": self.model,
            "messages": messages,
        }
        if self.api_key:
            kwargs["api_key"] = self.api_key
        
        # Tools configuration if provided
        # Tools configuration if provided
        if tools:
            kwargs["tools"] = [t.schema for t in tools]
            kwargs["tool_choice"] = "auto"

        # Enable aggressive retries for Free Tier rate limits
        kwargs["num_retries"] = 10 

        response = completion(**kwargs)
        if hasattr(response, 'choices') and len(response.choices) > 0:
             content = response.choices[0].message.content
             print(f"[DEBUG] Model Output ({self.model}): {content[:100]}...") 
        return response

class Agent:
    def __init__(self, name, instruction, model, tools=None):
        self.name = name
        self.instruction = instruction
        self.model = model
        self.tools = tools or []
        self.history = []

    def run(self, message: str, context: dict = None, on_log=None):
        """
        Runs the agent with the given message. 
        Handles basic tool calling loop if necessary.
        """
        current_messages = [{"role": "system", "content": self.instruction}]
        
        # Add history if needed (simplified here)
        # current_messages.extend(self.history)
        
        user_content = message
        if context:
            user_content += f"\n\nContext:\n{json.dumps(context, indent=2)}"
            
        current_messages.append({"role": "user", "content": user_content})

        print(f"--- {self.name} Running ---")
        
        # customized tool calling loop
        tools_map = {t.name: t for t in self.tools}
        
        try:
            response = self.model.complete(current_messages, tools=self.tools)
            choice = response.choices[0]
            
            # Check for tool calls
            if choice.message.tool_calls:
                tool_call = choice.message.tool_calls[0]
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)
                
                log_msg = f"Calling Tool: {function_name} with args: {str(function_args)[:100]}..."
                print(f"  [Tool Call] {self.name} calling {function_name}")
                if on_log:
                    on_log(log_msg)
                
                if function_name in tools_map:
                    try:
                        tool_result = tools_map[function_name].func(**function_args)
                        
                        # Append tool result to history
                        current_messages.append(choice.message)
                        current_messages.append({
                            "role": "tool", 
                            "tool_call_id": tool_call.id, 
                            "content": str(tool_result)
                        })
                        
                        result_preview = str(tool_result)[:100]
                        print(f"  [Tool Result] {result_preview}...")
                        if on_log:
                            on_log(f"Tool Result: {result_preview}...")
                        
                        # Get final response after tool result
                        final_response = self.model.complete(current_messages)
                        content = final_response.choices[0].message.content
                        safe_content = content if content else "Action completed."
                        return safe_content
                    except Exception as e:
                        error_msg = f"Tool Execution Error: {str(e)}"
                        print(f"  [Error] {error_msg}")
                        if on_log:
                            on_log(error_msg)
                        return f"Error executing tool {function_name}: {e}"
                else:
                    return f"Error: Tool {function_name} not found."

            content = choice.message.content
            return content if content else "Action completed."
            
        except Exception as e:
            print(f"  [Fatal Error] Agent run failed: {e}")
            if on_log:
                on_log(f"Agent Error: {e}")
            return f"Agent failed: {e}"
