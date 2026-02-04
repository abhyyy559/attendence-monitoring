import urllib.request
import json

url = "http://127.0.0.1:8000/api/auth/register"
data = {
    "email": "test_ipv6@example.com",
    "full_name": "Test IPv6",
    "role": "student",
    "password": "password123"
}
headers = {'Content-Type': 'application/json'}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode('utf-8'))
except urllib.error.URLError as e:
    print(f"URL Error: {e.reason}")
