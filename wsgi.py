"""
WSGI config for SmartFarm API.

It exposes the WSGI callable as a module-level variable named 'application'.
"""
import os
from backend.app.main import app

application = app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=False)
