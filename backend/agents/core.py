import os
import json
import re
from litellm import completion

class LiteLlm:
    def __init__(self, model, api_key=None, **config):
        self.model = model
        self.api_key = api_key
        self.config = config # Store extra config like temperature, max_tokens

    def complete(self, messages, tools=None, stream=False):
        kwargs = {
            "model": self.model,
            "messages": messages,
            "stream": stream,
            **self.config # Apply stored config
        }
        if self.api_key:
            kwargs["api_key"] = self.api_key
        
        # Tools configuration if provided
        if tools:
            kwargs["tools"] = [t.schema for t in tools]
            kwargs["tool_choice"] = "auto"

        # Enable aggressive retries for Free Tier rate limits
        kwargs["num_retries"] = 10 

        response = completion(**kwargs)
        
        # FIX 1: Safety check before accessing response.choices
        if not stream:
            if hasattr(response, 'choices') and response.choices and len(response.choices) > 0:
                 content = response.choices[0].message.content
                 if content:
                     print(f"[DEBUG] Model Output ({self.model}): {content[:100]}...")
            else:
                 print(f"[DEBUG] Model Output ({self.model}): <Empty Response or None>")
                 
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
        Supports streaming logs if on_log is provided.
        """
        current_messages = [{"role": "system", "content": self.instruction}]
        
        user_content = message
        if context:
            user_content += f"\n\nContext:\n{json.dumps(context, indent=2)}"
            
        current_messages.append({"role": "user", "content": user_content})

        print(f"--- {self.name} Running ---")
        
        tools_map = {t.name: t for t in self.tools}
        
        try:
            stream_response = self.model.complete(current_messages, tools=self.tools, stream=True)
            
            full_content = ""
            sentence_buffer = ""
            collected_chunks = []
            
            print(f"  [Streaming] Starting stream for {self.name}...")
            
            # Helper to check if a chunk is valid
            def is_valid_chunk(c):
                return (hasattr(c, 'choices') 
                        and c.choices is not None 
                        and len(c.choices) > 0)

            for chunk in stream_response:
                collected_chunks.append(chunk)
                
                if not is_valid_chunk(chunk):
                    continue

                if hasattr(chunk.choices[0], 'delta'):
                    delta = chunk.choices[0].delta
                    
                    # 1. Handle Text Content
                    if delta.content:
                        content_chunk = delta.content
                        full_content += content_chunk
                        sentence_buffer += content_chunk
                        
                        # Check for sentence delimiters
                        sentences = re.split(r'(?<=[.?!])\s+', sentence_buffer)
                        
                        if len(sentences) > 1:
                            for s in sentences[:-1]:
                                s_clean = s.strip()
                                if s_clean and on_log:
                                     if not s_clean.startswith("Calling Tool"):
                                        on_log(s_clean)
                            sentence_buffer = sentences[-1]

            # Flush remaining buffer
            if sentence_buffer.strip() and on_log:
                 on_log(sentence_buffer.strip())

            print(f"  [Streaming] Finished. Content length: {len(full_content)}")

            # Check for tool calls in the stream chunks
            tool_call_chunks = [
                c for c in collected_chunks 
                if is_valid_chunk(c)
                and c.choices[0].delta 
                and c.choices[0].delta.tool_calls
            ]
            
            if tool_call_chunks:
                print(f"  [Streaming] Tool calls detected. Re-running non-streamed for safe execution...")
                if on_log: on_log("Preparing to use tools...")
                
                response = self.model.complete(current_messages, tools=self.tools, stream=False)
                
                # FIX 2: Handle case where re-run returns None or empty choices
                if not hasattr(response, 'choices') or response.choices is None or len(response.choices) == 0:
                    error_msg = "Error: Tool execution failed (Empty AI response)."
                    print(f"  [Error] {error_msg}")
                    return error_msg
                
                choice = response.choices[0]
                
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
                            
                            # Final response
                            final_response = self.model.complete(current_messages)
                            
                            # FIX 3: Safety check on final response
                            if (hasattr(final_response, 'choices') 
                                and final_response.choices 
                                and len(final_response.choices) > 0):
                                content = final_response.choices[0].message.content
                                return content if content else "Action completed."
                            else:
                                return "Action completed (No final summary)."
                                
                        except Exception as e:
                            return f"Error executing tool {function_name}: {e}"
                    else:
                        return f"Error: Tool {function_name} not found."
            
            return full_content if full_content else "Action completed."
            
        except Exception as e:
            print(f"  [Fatal Error] Agent run failed: {e}")
            # Do NOT emit the raw error to the UI if it's just a NoneType issue, handle it gracefully
            if "NoneType" in str(e):
                return "Agent encountered a temporary processing error. Please retry."
            
            if on_log:
                on_log(f"Agent Error: {e}")
            return f"Agent failed: {e}"