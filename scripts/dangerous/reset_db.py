import os
import sys
import asyncio

backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "apps", "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

def enforce_safety():
    """Enforces multiple layers of safeguards against accidental database drops."""
    # 1. Immediate rejection if in production
    app_env = os.environ.get("APP_ENV", getattr(settings, "APP_ENV", "development")).lower()
    if app_env == "production":
        print("\n==================================================================")
        print("FATAL REFUSAL: reset_db.py is strictly forbidden in production.")
        print("Execution aborted immediately with zero database operations.")
        print("==================================================================\n")
        sys.exit(1)

    # 2. Require mandatory command-line confirmation flag
    if "--confirm-reset" not in sys.argv:
        print("\nSAFETY REFUSAL: reset_db.py requires explicit '--confirm-reset' flag.")
        print("Usage: python scripts/dangerous/reset_db.py --confirm-reset\n")
        sys.exit(1)

    # 3. If in an interactive terminal, require explicit typed confirmation
    if hasattr(sys.stdin, "isatty") and sys.stdin.isatty():
        prompt_val = input("WARNING: This will drop all tables! Type 'CONFIRM_WIPE_DATABASE' to proceed: ")
        if prompt_val.strip() != "CONFIRM_WIPE_DATABASE":
            print("Confirmation mismatch. Database reset aborted.\n")
            sys.exit(1)

async def reset_db():
    enforce_safety()

    print("Wiping development database schema...")
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+asyncpg://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    engine = create_async_engine(db_url)
    try:
        async with engine.begin() as conn:
            # Drop public schema to drop all tables, types, views cascadingly
            await conn.execute(text("DROP SCHEMA public CASCADE;"))
            await conn.execute(text("CREATE SCHEMA public;"))
            await conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
            print("Successfully wiped development database schema.")
    except Exception as e:
        print(f"Error wiping database schema: {str(e)}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(reset_db())
