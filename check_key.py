import os
import json

def check_key_file():
    key_path = 'backend/serviceAccountKey.json'
    print(f"Checking key file: {os.path.abspath(key_path)}")
    
    # Check if file exists
    if not os.path.exists(key_path):
        print("❌ Error: serviceAccountKey.json not found")
        return False
    
    print("✅ File exists")
    
    # Check file permissions
    try:
        with open(key_path, 'r') as f:
            content = f.read()
        print(f"✅ File is readable ({len(content)} bytes)")
        
        # Try to parse as JSON
        try:
            data = json.loads(content)
            print("✅ File contains valid JSON")
            
            # Check required fields
            required_fields = [
                'type', 'project_id', 'private_key_id',
                'private_key', 'client_email', 'client_id'
            ]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ Missing required fields: {', '.join(missing_fields)}")
                return False
            
            print("✅ All required fields present")
            print(f"Project ID: {data.get('project_id')}")
            print(f"Client Email: {data.get('client_email')}")
            
            return True
            
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return False

if __name__ == "__main__":
    check_key_file()
