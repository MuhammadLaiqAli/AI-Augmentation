from pathlib import Path

def safe_export_path(base_dir, requested):
    base = Path(base_dir).resolve()
    
    candidate = Path(base, requested).resolve()
    if not str(candidate).startswith(str(base)):
        raise ValueError("outside base")
    return candidate
