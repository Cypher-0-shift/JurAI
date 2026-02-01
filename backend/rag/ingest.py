import os
from langchain_community.document_loaders import TextLoader, BSHTMLLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from .utils import get_vector_store

# Directory where raw text files are stored
INPUT_DIR = os.path.join(os.path.dirname(__file__), "input_files")

def ingest_files():
    """
    Ingests .txt and .html files from the input_files directory into the vector store.
    Features:
    - Supports HTML via BSHTMLLoader
    - Prevents duplicates by checking existing sources
    - optimized chunk size (512) for embedding models
    """
    if not os.path.exists(INPUT_DIR):
        print(f"Creating input directory at {INPUT_DIR}")
        os.makedirs(INPUT_DIR, exist_ok=True)
        print("Please add .txt or .html files to this directory and run the script again.")
        return

    # 1. Find all supported files
    all_files = os.listdir(INPUT_DIR)
    supported_extensions = (".txt", ".html")
    files_to_process = [f for f in all_files if f.endswith(supported_extensions)]
    
    if not files_to_process:
        print(f"No supported files found in {INPUT_DIR}")
        return

    vector_store = get_vector_store()
    
    # 2. Check for existing sources to prevent duplication
    # We'll fetch all unique sources currently in the DB.
    # Note: Chroma doesn't have a direct "get all sources" metadata query that's efficient API-wise,
    # but for this scale, we can just be careful or check per file.
    # A simple way is to do a dummy search or just rely on the user. 
    # BETTER APPROACH: For each file, we can optionally check if we want to overwrite.
    # BUT, to keep it simple and automated: 
    # We will assume if it's there, we might want to re-ingest? 
    # The user asked to "not leave anything".
    # Let's add a check: if we find documents with this source, we skip it.
    
    # To do this correctly without fetching everything, we can try to 'get' by metadata manually if allowed,
    # or just trust the process.
    # However, since I promised duplication prevention, I should try to filter.
    # Chroma's `get` method supports where filter.
    
    total_new_chunks = 0
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=512,      # Optimized for ~256-512 token limit models
        chunk_overlap=128,   # Ensure context continuity
        length_function=len
    )

    for file_name in files_to_process:
        file_path = os.path.join(INPUT_DIR, file_name)
        
        # Check if already exists
        existing_docs = vector_store.get(where={"source": file_name})
        if existing_docs and existing_docs['ids']:
            print(f"Skipping {file_name}: Already ingested (found {len(existing_docs['ids'])} chunks).")
            continue

        print(f"Processing {file_name}...")
        
        try:
            documents = []
            if file_name.endswith(".txt"):
                loader = TextLoader(file_path, autodetect_encoding=True)
                documents = loader.load()
            elif file_name.endswith(".html"):
                loader = BSHTMLLoader(file_path)
                documents = loader.load()
            
            if not documents:
                print(f"  -> Warning: No content found in {file_name}")
                continue

            chunks = text_splitter.split_documents(documents)
            
            # Add metadata
            for chunk in chunks:
                chunk.metadata["source"] = file_name
                
            if chunks:
                vector_store.add_documents(chunks)
                total_new_chunks += len(chunks)
                print(f"  -> Added {len(chunks)} chunks.")
            else:
                print(f"  -> Warning: File resulted in 0 chunks (maybe empty?).")
                
        except Exception as e:
            print(f"Error processing {file_name}: {e}")

    print(f"\nIngestion complete. Total NEW chunks added: {total_new_chunks}")

if __name__ == "__main__":
    ingest_files()
