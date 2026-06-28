from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional

class ContactMessageBase(BaseModel):
    name: str
    email: EmailStr
    topic: str
    message: str

class ContactMessageCreate(ContactMessageBase):
    pass

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
