# WARNING: Destructive Database Scripts

> [!CAUTION]
> **DO NOT EXECUTE THESE SCRIPTS AGAINST PRODUCTION OR STAGING DATABASES.**
> These scripts perform hard deletes, truncations, schema wipes, or direct credential resets.
> They are quarantined here for historical audit and reference only.

## Script Inventory
1. `purge_tenants.py`: Performs cascading hard deletes of tenants, contracts, room allocations, payments, receipts, audit logs, and Cloudinary assets.
2. `cleanup.py`: Deletes all records from `Receipt`, `PaymentAllocation`, `Payment`, `ElectricityBill`, `Contract`, `Room`, `Floor`, and `Building`.
3. `reset_jay.py`: Overwrites password hashes directly in the database.
4. `reset_db.py`: Executes `DROP SCHEMA public CASCADE;` which completely destroys the entire database schema and all data.

Execution of these scripts will lead to unrecoverable data loss.
