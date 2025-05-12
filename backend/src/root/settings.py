from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic.networks import PostgresDsn, RedisDsn


class Settings(BaseSettings):
    # debug mode
    DEBUG_MODE: bool = True
    SECRET_KEY: str
    ALGORITHM: str
    # access_token
    ACCESS_TOKEN_EXPIRE_MINS: int
    ACCESS_SECRET_KEY: str
    # refresh_token
    REFRESH_TOKEN_EXPIRE_MINS: int
    REFRESH_SECRET_KEY: str
    TOKEN_WRAPPER_KEY: str
    TOKEN_WRAPPER_SALT: str

    # two factor authentication
    TOTP_SECRET_KEY: str

    # password token
    RESET_PASSWORD_SECRET_KEY: str
    RESET_PASSWORD_SALT: str

    # postgres database
    POSTGRES_URL: PostgresDsn
    # redis db
    # REDIS_BACKEND: RedisDsn
    # Fastap- mail
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int
    MAIL_SERVER: str

    OPENAI_API_KEY: str
    ASSEMBLYAI_API_KEY: str

    # Rate limiter
    RATE_LIMITER: str = "5/minute"

    FRONTEND_URL: str
    # FRONTEND_HOST_RESET_PASSWORD_URL: str
    # contact
    # BACKEND_DEV_EMAIL: str

    DB_MIGRATION_ENV: bool = True

    VERIFICATION_EMAIL_EXP_TIME_MIN: int
    PASSWORD_RESET_EMAIL_TIME: int
    TWO_FACTOR_AUTHENTICATION_EMAIL_TIME: int

    # BROKERBIN
    USER: str
    AUTHORIZATION: str

    # cloudinary
    # CLOUDINARY_API_KEY: str
    # CLOUDINARY_API_SECRET: str
    # CLOUDINARY_CLOUD_NAME: str
    # CLOUDINARY_ENVIRONMENT_VARIABLE: str

    # # stripe
    # STRIPE_API_KEY: str
    # STRIPE_PUBLISHABLE_KEY: str
    # STRIPE_WEBHOOK_SECRET: str

    # # google oauth
    # GOOGLE_CLIENT_ID: str
    # GOOGLE_CLIENT_SECRET: str
    # GOOGLE_OAUTH_REDIRECT_URI: str

    # Postgres
    # POSTGRES_USER:str
    # POSTGRES_PASSWORD:str
    # POSTGRES_DB:str
    # DOCKER_POSTGRES_URL:str

    class Config:
        env_file = ".env"


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()
