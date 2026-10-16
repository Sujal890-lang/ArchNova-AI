from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine, Base
import app.models  # ensure models are registered
from app.api import auth, designs, floorplans, exports, projects

# Create SQLite database tables if not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="ArchNova AI: Intelligent Parametric Architecture and 3D Building Design Platform API"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(designs.router, prefix=f"{settings.API_V1_STR}/designs", tags=["Parametric Designs & Copilot"])
app.include_router(floorplans.router, prefix=f"{settings.API_V1_STR}/floorplans", tags=["2D Floor Plans"])
app.include_router(exports.router, prefix=f"{settings.API_V1_STR}/exports", tags=["CAD & Vector Exports"])
app.include_router(projects.router, prefix=f"{settings.API_V1_STR}/projects", tags=["Project Persistence"])

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

@app.get("/", tags=["Root"])
def root_endpoint():
    return {
        "message": "Welcome to ArchNova AI Parametric Architecture Engine API",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
