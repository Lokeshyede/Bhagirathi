import asyncio
import sys
from uuid import UUID
import re

sys.path.insert(0, ".")

async def purge_test_tenants():
    from app.database.session import get_db
    from sqlalchemy import select, delete, text, func
    from app.models.tenant import Tenant
    from app.models.user import User, UserToken, PasswordResetToken
    from app.models.contract import Contract
    from app.models.allocation import RoomAllocation
    from app.models.rent import Rent
    from app.models.payment import Payment, PaymentAllocation, PaymentHistory
    from app.models.receipt import Receipt
    from app.models.notification import Notification, NotificationLog
    from app.models.document import Document
    from app.models.complaint import Complaint
    from app.models.security import FraudFlag, SecurityEvent
    from app.models.audit import AuditLog
    from app.models.hostel import Room
    from app.services.cloudinary import CloudinaryService

    tenant_ids = [
        UUID('72641091-f7ac-4803-8024-6527bd5259e4'), # Audit Test Tenant
        UUID('e75fccac-3a30-4565-bfe8-7427ee8080b2')  # Lokesh Yede
    ]

    print("=" * 60)
    print("STARTING TEST TENANT PURGE")
    print("=" * 60)

    async for db in get_db():
        # Step 1: Collect User IDs and delete Cloudinary files
        user_ids = []
        for tid in tenant_ids:
            t = await db.get(Tenant, tid)
            if t:
                user_ids.append(t.user_id)
                
                # Cloudinary: Receipts
                rcpt_q = await db.execute(select(Receipt).where(
                    Receipt.payment_id.in_(select(Payment.id).where(Payment.tenant_id == tid))
                ))
                receipts = rcpt_q.scalars().all()
                for r in receipts:
                    if r.pdf_url and "cloudinary.com" in r.pdf_url:
                        # Extract public ID from URL: e.g. .../upload/v123456/development/receipts/xxx.pdf
                        match = re.search(r"upload/(?:v\d+/)?(development/receipts/[a-zA-Z0-9_-]+)", r.pdf_url)
                        if match:
                            public_id = match.group(1)
                            print(f"Deleting Cloudinary Receipt Asset: {public_id}")
                            try:
                                await CloudinaryService.delete_image(public_id)
                            except Exception as e:
                                print(f"Cloudinary deletion failed for {public_id}: {e}")

                # Cloudinary: Documents
                doc_q = await db.execute(select(Document).where(Document.tenant_id == tid))
                docs = doc_q.scalars().all()
                for d in docs:
                    if d.document_url and "cloudinary.com" in d.document_url:
                        match = re.search(r"upload/(?:v\d+/)?(development/tenant-documents/[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+)", d.document_url)
                        if match:
                            public_id = match.group(1)
                            print(f"Deleting Cloudinary Document Asset: {public_id}")
                            try:
                                await CloudinaryService.delete_image(public_id)
                            except Exception as e:
                                print(f"Cloudinary deletion failed for {public_id}: {e}")

        if not user_ids:
            print("No users found. Already deleted?")
            break

        print("\nExecuting deletions within transaction...")
        
        # Step 2: Delete dependencies in reverse order
        
        # Notifications
        res = await db.execute(delete(NotificationLog).where(NotificationLog.notification_id.in_(
            select(Notification.id).where(Notification.user_id.in_(user_ids))
        )))
        print(f"Deleted NotificationLogs: {res.rowcount}")
        
        res = await db.execute(delete(Notification).where(Notification.user_id.in_(user_ids)))
        print(f"Deleted Notifications: {res.rowcount}")

        # Receipts
        res = await db.execute(delete(Receipt).where(Receipt.payment_id.in_(
            select(Payment.id).where(Payment.tenant_id.in_(tenant_ids))
        )))
        print(f"Deleted Receipts: {res.rowcount}")

        # Payment History, FraudFlags, SecurityEvents
        res = await db.execute(delete(PaymentHistory).where(PaymentHistory.tenant_id.in_(tenant_ids)))
        print(f"Deleted PaymentHistory: {res.rowcount}")
        
        res = await db.execute(delete(FraudFlag).where(FraudFlag.payment_id.in_(
            select(Payment.id).where(Payment.tenant_id.in_(tenant_ids))
        )))
        print(f"Deleted FraudFlags: {res.rowcount}")

        res = await db.execute(delete(SecurityEvent).where(SecurityEvent.triggered_by.in_(user_ids)))
        print(f"Deleted SecurityEvents: {res.rowcount}")
        
        res = await db.execute(delete(AuditLog).where(AuditLog.user_id.in_(user_ids)))
        print(f"Deleted AuditLogs: {res.rowcount}")

        # Payments and Allocations
        res = await db.execute(delete(PaymentAllocation).where(PaymentAllocation.payment_id.in_(
            select(Payment.id).where(Payment.tenant_id.in_(tenant_ids))
        )))
        print(f"Deleted PaymentAllocations: {res.rowcount}")

        res = await db.execute(delete(Payment).where(Payment.tenant_id.in_(tenant_ids)))
        print(f"Deleted Payments: {res.rowcount}")

        # Rents
        res = await db.execute(delete(Rent).where(Rent.tenant_id.in_(tenant_ids)))
        print(f"Deleted Rents: {res.rowcount}")

        # RoomAllocations and Room Counters
        # Find which rooms are affected
        room_q = await db.execute(select(RoomAllocation.room_id).where(RoomAllocation.tenant_id.in_(tenant_ids)))
        affected_rooms = [r for r in room_q.scalars().all() if r is not None]
        
        res = await db.execute(delete(RoomAllocation).where(RoomAllocation.tenant_id.in_(tenant_ids)))
        print(f"Deleted RoomAllocations: {res.rowcount}")

        # Contracts
        res = await db.execute(delete(Contract).where(Contract.tenant_id.in_(tenant_ids)))
        print(f"Deleted Contracts: {res.rowcount}")

        # Tokens
        res = await db.execute(delete(UserToken).where(UserToken.user_id.in_(user_ids)))
        print(f"Deleted UserTokens: {res.rowcount}")
        
        res = await db.execute(delete(PasswordResetToken).where(PasswordResetToken.user_id.in_(user_ids)))
        print(f"Deleted PasswordResetTokens: {res.rowcount}")

        # Tenant
        res = await db.execute(delete(Tenant).where(Tenant.id.in_(tenant_ids)))
        print(f"Deleted Tenants: {res.rowcount}")

        # User
        res = await db.execute(delete(User).where(User.id.in_(user_ids)))
        print(f"Deleted Users: {res.rowcount}")
        
        # Commit deletion
        await db.commit()
        print("\nDeletion transaction COMMITTED.")

        # Step 3: Repair Room Occupancy
        if affected_rooms:
            print(f"\nRepairing room occupancy for rooms: {affected_rooms}")
            for r_id in set(affected_rooms):
                room = await db.get(Room, r_id)
                if room:
                    actual_count = (await db.execute(
                        select(func.count())
                        .select_from(RoomAllocation)
                        .where(RoomAllocation.room_id == r_id, RoomAllocation.is_active == True)
                    )).scalar()
                    room.active_occupants = actual_count
                    if room.active_occupants < room.capacity:
                        room.status = "AVAILABLE"
                    db.add(room)
            await db.commit()
            print("Room occupancy repaired.")
        
        # Verify
        remaining_t = (await db.execute(select(func.count()).select_from(Tenant))).scalar()
        remaining_u = (await db.execute(select(func.count()).select_from(User))).scalar()
        print(f"\nFinal DB State: Tenants={remaining_t}, Users={remaining_u}")
        assert remaining_t == 0, f"Expected 0 tenants, found {remaining_t}"
        # We expect 1 admin user left
        assert remaining_u == 1, f"Expected 1 admin user, found {remaining_u}"
        
        break

asyncio.run(purge_test_tenants())
