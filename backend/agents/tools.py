from rag.retrieve import retrieve

class Tool:
    def __init__(self, name, description, func, schema):
        self.name = name
        self.description = description
        self.func = func
        self.schema = schema

def retrieve_wrapper(query: str):
    """
    Retrieves legal documents relevant to the query.
    """
    results = retrieve(query, k=3)
    # Serialize results to string
    return "\n\n".join(
        f"Source: {doc.metadata.get('source', 'unknown')}\nContent: {doc.page_content}" 
        for doc in results
    )

naiverag_retrieve_tool = Tool(
    name="naiverag_retrieve",
    description="Retrieve legal/regulatory text from JurAI RAG",
    func=retrieve_wrapper,
    schema={
        "type": "function",
        "function": {
            "name": "naiverag_retrieve",
            "description": "Retrieve legal/regulatory text relevant to the query.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query for legal documents."
                    }
                },
                "required": ["query"]
            }
        }
    }
)
