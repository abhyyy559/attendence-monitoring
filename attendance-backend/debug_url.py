from sqlalchemy.engine.url import make_url
import os
from dotenv import load_dotenv

load_dotenv()
url_str = os.getenv("DATABASE_URL")
print(f"Original URL: {url_str}")

try:
    u = make_url(url_str)
    print(f"Parsed Host: '{u.host}'")
    print(f"Parsed Port: {u.port}")
    print(f"Parsed Password: '{u.password}'")
    print(f"Parsed User: '{u.username}'")
except Exception as e:
    print(f"Parsing Error: {e}")
