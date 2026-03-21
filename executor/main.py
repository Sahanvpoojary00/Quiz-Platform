from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeExecutionRequest(BaseModel):
    code: str
    language: str = "python"

@app.post("/run-code")
async def run_code(req: CodeExecutionRequest):
    if req.language != "python":
        raise HTTPException(status_code=400, detail="Only python is supported currently")

    try:
        # Docker sandbox execution
        cmd = [
            "docker", "run", "--rm", 
            "-i",
            "--network", "none", # No internet access
            "--memory", "128m", # CPU & memory limits
            "--cpus", "0.5",
            "python:3.9-slim",
            "python", "-" # Read from stdin
        ]
        
        proc = subprocess.run(
            cmd,
            input=req.code,
            text=True,
            capture_output=True,
            timeout=5 # Timeout (5 seconds)
        )

        return {
            "output": proc.stdout,
            "error": proc.stderr,
            "returncode": proc.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            "output": "",
            "error": "Execution timed out (5s limit)",
            "returncode": 124
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
