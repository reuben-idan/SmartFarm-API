import os

def verify_key():
    key_path = os.path.join('backend', 'serviceAccountKey.json')
    print(f"Verifying access to: {os.path.abspath(key_path)}")
    
    if not os.path.exists(key_path):
        print("❌ Error: File does not exist")
        return False
    
    try:
        with open(key_path, 'r') as f:
            content = f.read()
        print("✅ File exists and is readable")
        print(f"File size: {len(content)} bytes")
        return True
    except Exception as e:
        print(f"❌ Error reading file: {str(e)}")
        return False

if __name__ == "__main__":
    verify_key()
