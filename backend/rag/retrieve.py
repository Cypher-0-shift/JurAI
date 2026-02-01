from .utils import get_vector_store

def retrieve(query: str, k: int = 4):
    """
    Retrieves the top k relevant documents for a given query.
    """
    vector_store = get_vector_store()
    
    print(f"Querying for: '{query}'")
    results = vector_store.similarity_search(query, k=k)
    
    return results

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Query the JurAI RAG system.")
    parser.add_argument("query", type=str, help="The question or query string.")
    
    args = parser.parse_args()
    
    docs = retrieve(args.query)
    
    print(f"\nFound {len(docs)} relevant results:\n")
    for i, doc in enumerate(docs, 1):
        print(f"--- Result {i} (Source: {doc.metadata.get('source', 'Unknown')}) ---")
        print(doc.page_content)
        print("\n")
