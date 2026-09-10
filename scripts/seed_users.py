import asyncio
import sys
sys.path.insert(0, "apps/backend")

from app.database.database import async_session_maker
from app.models.user import User
from app.models.enums import UserRole
from app.core.security import get_password_hash
from app.models.maintenance import MaintenanceStaff
from sqlalchemy import select
from datetime import datetime, timezone

async def seed():
    async with async_session_maker() as db:
        # Seed Roles first to satisfy foreign key constraints
        roles_to_seed = [
            {"id": "504e6216-0fa2-42ae-a2dc-b78e327da208", "name": "ADMIN", "description": "Administrator role"},
            {"id": "64b0dee0-475c-4261-986d-b877612b0db7", "name": "TENANT", "description": "Tenant role"},
            {"id": "78b0dee0-475c-4261-986d-b877612b0db8", "name": "MAINTENANCE", "description": "Maintenance staff role"},
            {"id": "89b0dee0-475c-4261-986d-b877612b0db9", "name": "OWNER", "description": "Hostel owner role"}
        ]
        from app.models.role import Role
        for r_data in roles_to_seed:
            r_q = select(Role).where(Role.id == r_data["id"])
            role = (await db.execute(r_q)).scalars().first()
            if not role:
                role = Role(
                    id=r_data["id"],
                    name=r_data["name"],
                    description=r_data["description"],
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc)
                )
                db.add(role)
                print(f"Seeded role: {r_data['name']}")
        await db.commit()

        # Seed Admin
        admin_q = select(User).where(User.email == "admin@bhagirathihostel.com")
        admin = (await db.execute(admin_q)).scalars().first()
        if not admin:
            admin = User(
                email="admin@bhagirathihostel.com",
                phone="9876543210",
                full_name="Bhagirathi Admin",
                password_hash=get_password_hash("Password123"),
                role=UserRole.ADMIN,
                role_id="504e6216-0fa2-42ae-a2dc-b78e327da208",
                is_active=True,
                is_superuser=True,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            db.add(admin)
            print("Seeded admin@bhagirathihostel.com")
        else:
            print("admin@bhagirathihostel.com already exists")
            
        # Seed Tenant
        tenant_q = select(User).where(User.email == "tenant@bhagirathihostel.com")
        tenant = (await db.execute(tenant_q)).scalars().first()
        if not tenant:
            tenant = User(
                email="tenant@bhagirathihostel.com",
                phone="9876543211",
                full_name="Tenant User",
                password_hash=get_password_hash("Password123"),
                role=UserRole.TENANT,
                role_id="64b0dee0-475c-4261-986d-b877612b0db7",
                is_active=True,
                is_superuser=False,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            db.add(tenant)
            print("Seeded tenant@bhagirathihostel.com")
        else:
            print("tenant@bhagirathihostel.com already exists")

        # Seed staff@bhagirathihostel.com
        staff1_q = select(User).where(User.email == "staff@bhagirathihostel.com")
        staff1 = (await db.execute(staff1_q)).scalars().first()
        if not staff1:
            staff1 = User(
                email="staff@bhagirathihostel.com",
                phone="9876543212",
                full_name="Maintenance Staff",
                password_hash=get_password_hash("Password123"),
                role=UserRole.MAINTENANCE,
                role_id="78b0dee0-475c-4261-986d-b877612b0db8",
                is_active=True,
                is_superuser=False,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            db.add(staff1)
            await db.flush() # get user id
            
            # Link to MaintenanceStaff Table
            m_staff1 = MaintenanceStaff(
                user_id=staff1.id,
                specialty="GENERAL",
                status="ACTIVE"
            )
            db.add(m_staff1)
            print("Seeded staff@bhagirathihostel.com & linked staff profile")
        else:
            # Check if linked
            ms_q = select(MaintenanceStaff).where(MaintenanceStaff.user_id == staff1.id)
            ms = (await db.execute(ms_q)).scalars().first()
            if not ms:
                m_staff1 = MaintenanceStaff(
                    user_id=staff1.id,
                    specialty="GENERAL",
                    status="ACTIVE"
                )
                db.add(m_staff1)
                print("Linked staff@bhagirathihostel.com to maintenance_staff table")

        # Seed maintenance@bhagirathihostel.com
        staff2_q = select(User).where(User.email == "maintenance@bhagirathihostel.com")
        staff2 = (await db.execute(staff2_q)).scalars().first()
        if not staff2:
            staff2 = User(
                email="maintenance@bhagirathihostel.com",
                phone="9876543213",
                full_name="Maintenance Staff",
                password_hash=get_password_hash("Password123"),
                role=UserRole.MAINTENANCE,
                role_id="78b0dee0-475c-4261-986d-b877612b0db8",
                is_active=True,
                is_superuser=False,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            db.add(staff2)
            await db.flush()
            
            m_staff2 = MaintenanceStaff(
                user_id=staff2.id,
                specialty="GENERAL",
                status="ACTIVE"
            )
            db.add(m_staff2)
            print("Seeded maintenance@bhagirathihostel.com & linked staff profile")
        else:
            ms_q = select(MaintenanceStaff).where(MaintenanceStaff.user_id == staff2.id)
            ms = (await db.execute(ms_q)).scalars().first()
            if not ms:
                m_staff2 = MaintenanceStaff(
                    user_id=staff2.id,
                    specialty="GENERAL",
                    status="ACTIVE"
                )
                db.add(m_staff2)
                print("Linked maintenance@bhagirathihostel.com to maintenance_staff table")

        await db.commit()

asyncio.run(seed())
