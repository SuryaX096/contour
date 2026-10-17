import os
from pydantic import Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    falkordb_host: str = Field(default="localhost", validation_alias="FALKORDB_HOST")
    falkordb_port: int = Field(default=6379, validation_alias="FALKORDB_PORT")
    falkordb_graph_name: str = Field(default="contour_release_graph", validation_alias="FALKORDB_GRAPH_NAME")
    log_level: str = Field(default="INFO", validation_alias="LOG_LEVEL")
    app_env: str = Field(default="development", validation_alias="APP_ENV")
    api_host: str = Field(default="0.0.0.0", validation_alias="API_HOST")
    api_port: int = Field(default=8000, validation_alias="API_PORT")
    default_search_budget: int = Field(default=50, validation_alias="DEFAULT_SEARCH_BUDGET")
    max_search_depth: int = Field(default=5, validation_alias="MAX_SEARCH_DEPTH")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
