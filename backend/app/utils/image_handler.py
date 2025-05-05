import os
import shutil
from fastapi import UploadFile
import uuid
from pathlib import Path

APP_DIR = Path(__file__).parent.parent 

UPLOAD_DIR = APP_DIR / "static" / "uploads"

async def save_upload_file(upload_file: UploadFile) -> str:
    # Create the upload directory if it doesn't exist
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    file_extension = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    file_path = UPLOAD_DIR / unique_filename
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    # Return the relative path that can be stored in the database
    return f"/static/uploads/{unique_filename}"


async def delete_file(file_path: str) -> bool:
    if not file_path or not file_path.startswith("/static/uploads/"):
        return False
    
    filename = os.path.basename(file_path)

    abs_path = UPLOAD_DIR / filename
    
    try:
        if os.path.isfile(abs_path):
            os.remove(abs_path)
            return True
    except Exception as e:
        print(f"Error deleting file: {e}")
    
    return False


