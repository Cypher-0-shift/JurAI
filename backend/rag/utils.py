import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

def get_embedding_function():
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    return embeddings

def get_vector_store(collection_name: str = "jurai_rag", persist_directory: str = "./chroma_db"):
    embedding_function = get_embedding_function()
    
    # Ensure directory exists
    os.makedirs(persist_directory, exist_ok=True)
    
    vector_store = Chroma(
        collection_name=collection_name,
        embedding_function=embedding_function,
        persist_directory=persist_directory
    )
    return vector_store
