from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.core.security import decode_access_token
from app.models.user import User

security = HTTPBearer(auto_error=False)

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user_optional(
    db: Session = Depends(get_db),
    cred: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[User]:
    if not cred:
        return None
    token = cred.credentials
    payload = decode_access_token(token)
    if not payload or not payload.get("sub"):
        return None
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    return user

def get_current_user(
    current_user: Optional[User] = Depends(get_current_user_optional)
) -> User:
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required for this operation",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user
