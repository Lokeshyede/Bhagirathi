import os
import sys
import asyncio

backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "apps", "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.core.config import settings
from app.database.session import async_session_maker
from app.models.hostel import Hostel, Building, Floor, Room
from app.models.tenant import Tenant
from app.models.user import User
from app.models.contract import Contract
from app.models.electricity import ElectricityBill
from app.models.payment import Payment, PaymentAllocation
from app.models.receipt import Receipt
from sqlalchemy import delete

def enforce_safety():
    """Enforces safeguards against accidental mass deletes."""
    app_env = os.environ.get("APP_ENV", getattr(settings, "APP_ENV", "development")).lower()
    if app_env == "production":
        print("\n==================================================================")
        print("FATAL REFUSAL: cleanup.py is strictly forbidden in production.")
        print("Execution aborted immediately with zero database operations.")
        print("==================================================================\n")
        sys.exit(1)

    if "--confirm-cleanup" not in sys.argv:
        print("\nSAFETY REFUSAL: cleanup.py requires explicit '--confirm-cleanup' flag.")
        print("Usage: python scripts/dangerous/cleanup.py --confirm-cleanup\n")
        sys.exit(1)

async def cleanup():
    enforce_safety()

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

if __name__ == "__main__":
    asyncio.run(cleanup())
