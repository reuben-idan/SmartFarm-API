import os
import json

def check_service_account():
    key_path = os.path.join('backend', 'serviceAccountKey.json')
    print(f"Checking for service account key at: {os.path.abspath(key_path)}")
    
    if not os.path.exists(key_path):
        print("❌ Error: serviceAccountKey.json not found")
        return False
    
    try:
        with open(key_path, 'r') as f:
            data = json.load(f)
        print("✅ serviceAccountKey.json is valid JSON")
        print("\nService Account Info:")
        print(f"Project ID: {data.get('project_id')}")
        print(f"Client Email: {data.get('client_email')}")
        print(f"Private Key ID: {data.get('private_key_id')}")
        print(f"Private Key: {'*' * 20}{data.get('private_key', '')[-5:] if data.get('private_key') else 'None'}")
        return True
    except json.JSONDecodeError as e:
        print(f"❌ Error: serviceAccountKey.json is not valid JSON: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Error reading serviceAccountKey.json: {str(e)}")
        return False

if __name__ == "__main__":
    check_service_account()
