import logging
import uuid

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .db import Base, engine
from .exceptions import AppException, ConflictError, NotFoundError, ValidationError as AppValidationError
from .routes import classes, lookups

logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Class Schedule Manager API",
    description="API for managing class schedules with conflict detection.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(lookups.router)
app.include_router(classes.router)


@app.exception_handler(AppValidationError)
async def app_validation_error_handler(request: Request, exc: AppValidationError):
    logger.warning("Validation error path=%s error=%s", request.url.path, exc.message)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.to_dict()},
    )


@app.exception_handler(NotFoundError)
async def not_found_error_handler(request: Request, exc: NotFoundError):
    logger.info("Resource not found path=%s error=%s", request.url.path, exc.message)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.to_dict()},
    )


@app.exception_handler(ConflictError)
async def conflict_error_handler(request: Request, exc: ConflictError):
    logger.info(
        "Scheduling conflict path=%s conflicts=%d",
        request.url.path,
        len(exc.details.get("conflicts", [])),
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.to_dict()},
    )


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    logger.warning(
        "Application error path=%s error_code=%s message=%s",
        request.url.path,
        exc.error_code,
        exc.message,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.to_dict()},
    )


@app.exception_handler(RequestValidationError)
async def request_validation_error_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field_path = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        errors.append({
            "field": field_path,
            "message": error["msg"],
            "type": error["type"],
        })
    
    logger.warning("Request validation error path=%s errors=%s", request.url.path, errors)
    
    return JSONResponse(
        status_code=400,
        content={
            "detail": {
                "error": "validation_error",
                "message": "Request validation failed",
                "details": {"errors": errors},
            }
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    error_id = uuid.uuid4().hex[:10]
    logger.exception("Unhandled error error_id=%s path=%s", error_id, request.url.path, exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={
            "detail": {
                "error": "internal_server_error",
                "message": "An unexpected error occurred",
                "details": {"error_id": error_id},
            }
        },
    )


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Class Schedule Manager API"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
