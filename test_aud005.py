import asyncio
import sys
import os
import time
from uuid import uuid4
sys.path.insert(0, os.path.abspath('apps/backend'))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models.enums import PaymentStatus, VerificationStatus
from app.models.payment import Payment
from app.models.tenant import Tenant
from app.models.user import User
from app.services.payment_completion_service import PaymentCompletionService

# Need an existing database
engine = create_async_engine("postgresql+asyncpg://postgres:postgres@localhost:5432/bhagirathi_pg")
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def test_concurrency():
    # Setup test data
    async with async_session() as db:
        # Check if we can find any pending payment
        from sqlalchemy import select
        stmt = select(Payment).where(Payment.payment_status == PaymentStatus.PENDING).limit(1)
        res = await db.execute(stmt)
        payment = res.scalar_one_or_none()
        if not payment:
            print("No pending payment found to test.")
            return

        print(f"Testing concurrency on Payment {payment.id}")
        
        # Two concurrent verifications
        admin_id = uuid4()
        
        async def verify_call():
            async with async_session() as session:
                try:
                    p = await PaymentCompletionService.complete_payment_verification(
                        db=session,
                        payment_id=payment.id,
                        admin_user_id=admin_id
                    )
                    await session.commit()
                    return "SUCCESS"
                except Exception as e:
                    await session.rollback()
                    return f"ERROR/CONFLICT: {type(e).__name__} - {str(e)}"
        
        # Run them at the exact same time
        results = await asyncio.gather(verify_call(), verify_call())
        print("Results:", results)

if __name__ == "__main__":
    asyncio.run(test_concurrency())
