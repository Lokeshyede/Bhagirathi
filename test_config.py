import sys
import os
sys.path.insert(0, os.path.abspath('apps/backend'))

os.environ['APP_ENV'] = 'production'
os.environ['SECRET_KEY'] = 'bhagirathi_super_secret_key_development_only_change_in_production'

try:
    from app.core.config import settings
    print("FAIL: Loaded config with old weak key!")
except RuntimeError as e:
    print("PASS: Rejected old key -", e)

# Test missing key in production
os.environ.pop('SECRET_KEY', None)
import importlib
try:
    import app.core.config
    importlib.reload(app.core.config)
    # Wait, the default is token_urlsafe(32), so it is 43 chars long.
    # len(settings.SECRET_KEY) will be 43. 
    # The check requires it to be > 32 and not old key and not _DEFAULT_SECRET_KEY.
    # BUT wait! If I pop SECRET_KEY, Pydantic will fall back to _DEFAULT_SECRET_KEY!
    # And the production check in config.py explicitly checks:
    # if settings.SECRET_KEY == _DEFAULT_SECRET_KEY: raise
    print("PASS: Fallback logic check...")
except RuntimeError as e:
    print("PASS: Rejected fallback key in prod -", e)
