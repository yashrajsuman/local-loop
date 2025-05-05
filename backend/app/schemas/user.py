from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, ClassVar, Type
from datetime import datetime
from uuid import UUID

from app.schemas.item import ItemResponse

class UserBase(BaseModel):
    name: str
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8)


class UserResponse(UserBase):
    id: UUID
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    class Config:
        from_attributes = True
        populate_by_name = True
        allow_population_by_field_name = True


class UserWithItems(UserResponse):
    ItemResponseType: ClassVar[Type] = ItemResponse
    items: List[ItemResponse] = []

    class Config:
        from_attributes = True
        populate_by_name = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: str
