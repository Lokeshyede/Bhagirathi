import asyncio
from app.database.session import async_session_maker
from app.models.hostel import Hostel, Building, Floor, Room
from app.models.tenant import Tenant
from app.models.user import User
from app.models.contract import Contract
from app.models.electricity import ElectricityBill
from app.models.payment import Payment, PaymentAllocation
from app.models.receipt import Receipt
from sqlalchemy import delete

async def cleanup():
    async with async_session_maker() as db:
        await db.execute(delete(Receipt))
        await db.execute(delete(PaymentAllocation))
        await db.execute(delete(Payment))
        await db.execute(delete(ElectricityBill))
        await db.execute(delete(Contract))
        await db.execute(delete(Tenant).where(Tenant.email.like('SECURITY_P1_E2E_%')))
        await db.execute(delete(User).where(User.email.like('SECURITY_P1_E2E_%')))
        await db.execute(delete(Room))
        await db.execute(delete(Floor))
        await db.execute(delete(Building))
        await db.execute(delete(Hostel).where(Hostel.name.like('SECURITY_P1_E2E_%')))
        await db.commit()
        print("Cleanup successful.")

asyncio.run(cleanup())
