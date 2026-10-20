"""Auth HTTP routes (P1-T05). Routers parse input and call services only."""
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session as DbSession

from dataforge.database import get_db
from dataforge.security.passwords import MAX_LENGTH, MIN_LENGTH, PasswordPolicyError
from dataforge.services import auth as auth_service
from dataforge.services.auth import AuthError

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

SESSION_COOKIE = "df_session"
SESSION_MAX_AGE = 7 * 24 * 60 * 60


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=MIN_LENGTH, max_length=MAX_LENGTH)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=MAX_LENGTH)


class UserOut(BaseModel):
    id: str
    email: str


def _set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=SESSION_COOKIE,
        value=token,
        max_age=SESSION_MAX_AGE,
        httponly=True,    # not readable by JavaScript
        secure=True,      # sent only over HTTPS (see note below)
        samesite="lax",   # limits cross-site sending (CSRF mitigation)
        path="/",
    )


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserOut)
def register(body: RegisterRequest, db: DbSession = Depends(get_db)) -> UserOut:
    try:
        user = auth_service.register_user(db, body.email, body.password)
    except AuthError:
        raise HTTPException(status_code=400, detail="Registration failed.")
    except PasswordPolicyError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return UserOut(id=str(user.id), email=user.email)


@router.post("/login", response_model=UserOut)
def login(body: LoginRequest, response: Response, db: DbSession = Depends(get_db)) -> UserOut:
    try:
        token = auth_service.login_user(db, body.email, body.password)
    except AuthError:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    _set_session_cookie(response, token)
    user = auth_service.get_user_for_token(db, token)
    return UserOut(id=str(user.id), email=user.email)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response, df_session: str | None = Cookie(default=None),
           db: DbSession = Depends(get_db)) -> Response:
    if df_session:
        auth_service.logout_session(db, df_session)
    response.delete_cookie(SESSION_COOKIE, path="/")
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.get("/me", response_model=UserOut)
def me(df_session: str | None = Cookie(default=None), db: DbSession = Depends(get_db)) -> UserOut:
    user = auth_service.get_user_for_token(db, df_session) if df_session else None
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    return UserOut(id=str(user.id), email=user.email)