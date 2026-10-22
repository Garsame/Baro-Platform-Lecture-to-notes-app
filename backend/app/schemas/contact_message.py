from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional

class ContactMessageBase(BaseModel):
    name: str
    email: EmailStr
    topic: str
    message: str

class ContactMessageCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    topic: str = Field(min_length=2, max_length=120)
    message: str = Field(min_length=10, max_length=2000)

class ContactMessageUpdate(BaseModel):
    is_read: Optional[bool] = None

class ContactMessageReply(BaseModel):
    reply_message: str

class ContactMessageInDB(ContactMessageBase):
    id: int
    is_read: bool
    created_at: datetime
    reply_message: Optional[str] = None
    replied_at: Optional[datetime] = None
    is_replied: bool

    model_config = ConfigDict(from_attributes=True)
