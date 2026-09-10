import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath("."))
from sqlalchemy import select
from app.database.database import async_session_maker
from app.models.user import User
from app.models.enums import UserRole
from app.core.security import get_password_hash

async def main():
    async with async_session_maker() as db:
        result = await db.execute(select(User).where(User.email == 'jayyede43@gmail.com'))
        user = result.scalars().first()
        if user:
            print(f"User found: {user.id}")
            user.hashed_password = get_password_hash("Yedeji@123")
            await db.commit()
            print("Password reset to Yedeji@123")
        else:
            print("User not found")

asyncio.run(main())
