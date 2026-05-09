"""SlowAPI rate-limiter setup.

Limits per spec section 14:
- Login: 5/min per IP
- Register: 3/min per IP
- Upvote: 30/min per authenticated citizen
- General API: 100/min per IP
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

LIMIT_LOGIN = "5/minute"
LIMIT_REGISTER = "3/minute"
LIMIT_UPVOTE = "30/minute"
