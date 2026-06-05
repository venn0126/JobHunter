from pydantic import BaseModel, Field


class AuthUserResponse(BaseModel):
    id: str
    name: str
    email: str
    avatarText: str
    isDemo: bool
    direction: str | None = None
    targetCity: str | None = None


class AuthSessionResponse(BaseModel):
    accessToken: str
    refreshToken: str | None = None
    tokenType: str = "bearer"
    expiresIn: int
    user: AuthUserResponse


class RefreshRequest(BaseModel):
    refreshToken: str | None = None


class LogoutRequest(BaseModel):
    refreshToken: str | None = None


class LogoutResponse(BaseModel):
    logged_out: bool


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=6, max_length=128)


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=6, max_length=128)


class UpdateMeRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    email: str | None = Field(default=None, min_length=3, max_length=255)
    direction: str | None = Field(default=None, max_length=120)
    targetCity: str | None = Field(default=None, max_length=120)
