import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.graph.repository import GraphRepository
from app.api.health import router as health_router
from app.api.demo import router as demo_router
from app.api.graph import router as graph_router
from app.api.decisions import router as decisions_router
from app.api.counterexamples import router as counterexamples_router
from app.api.repair import router as repair_router
from app.api.certificates import router as certificates_router
from app.api.benchmark import router as benchmark_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing CONTOUR Decision Reliability Compiler Backend...")
    repo = GraphRepository()
    connected = repo.is_connected()
    if connected:
        logger.info(f"Connected to FalkorDB at {repo.host}:{repo.port} [Graph: {repo.graph_name}]")
    else:
        logger.warning(f"Could not connect to FalkorDB at {repo.host}:{repo.port}. Running in offline/degraded mode.")
    yield
    logger.info("Shutting down CONTOUR Backend...")

app = FastAPI(
    title="CONTOUR — Graph-native Decision Reliability Compiler",
    description="Deterministic verification, bounded counterexample search, and context repair for decision reliability.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS with explicit development origins
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start) * 1000.0, 2)
    logger.info(
        f"{request.method} {request.url.path} - Status: {response.status_code} ({duration_ms}ms)",
        extra={"duration_ms": duration_ms, "operation": request.url.path}
    )
    return response

# Register API routes
app.include_router(health_router, prefix="/api", tags=["Health"])
app.include_router(demo_router, prefix="/api/demo", tags=["Demo"])
app.include_router(graph_router, prefix="/api/graph", tags=["Graph"])
app.include_router(decisions_router, prefix="/api/decisions", tags=["Decisions"])
app.include_router(counterexamples_router, prefix="/api/counterexamples", tags=["Counterexamples"])
app.include_router(repair_router, prefix="/api/context", tags=["Context Repair"])
app.include_router(certificates_router, prefix="/api/certificates", tags=["Certificates"])
app.include_router(benchmark_router, prefix="/api/benchmark", tags=["Benchmark"])

@app.get("/")
def root():
    return {
        "product": "CONTOUR",
        "tagline": "Don't just make a decision. Test whether the evidence behind it is sufficient.",
        "status": "ONLINE",
        "documentation": "/docs"
    }
