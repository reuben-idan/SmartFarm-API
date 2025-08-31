import os
import json
from pathlib import Path

def setup_firebase():
    """
    Interactive script to set up Firebase Admin SDK credentials.
    This will create or update the serviceAccountKey.json file.
    """
    print("\n🔥 Firebase Admin SDK Setup 🔥\n")
    print("1. Go to Firebase Console: https://console.firebase.google.com/")
    print("2. Select your project")
    print("3. Go to Project Settings > Service Accounts")
    print("4. Click 'Generate New Private Key'")
    print("5. Copy the contents of the downloaded JSON file\n")
    
    # Get the service account info from user input
    print("Please paste the contents of your service account JSON file (press Enter then Ctrl+Z on Windows or Ctrl+D on Unix to finish):\n")
    
    try:
        # Read multiline JSON input
        lines = []
        while True:
            try:
                line = input()
                lines.append(line)
            except EOFError:
                break
            except KeyboardInterrupt:
                return
                
        service_account = json.loads('\n'.join(lines))
        
        # Create the service account file
        key_path = Path("serviceAccountKey.json")
        with open(key_path, 'w') as f:
            json.dump(service_account, f, indent=2)
            
        print(f"\n✅ Successfully saved service account key to {key_path.absolute()}")
        print("\n🔒 Make sure to add serviceAccountKey.json to your .gitignore file!")
        
        # Update .gitignore if it exists
        gitignore = Path(".gitignore")
        if gitignore.exists():
            with open(gitignore, 'a+') as f:
                f.seek(0)
                content = f.read()
                if 'serviceAccountKey.json' not in content:
                    f.write('\n# Firebase service account key\nserviceAccountKey.json\n')
        
    except json.JSONDecodeError:
        print("\n❌ Error: Invalid JSON. Please try again with valid JSON content.")
    except Exception as e:
        print(f"\n❌ An error occurred: {str(e)}")

if __name__ == "__main__":
    setup_firebase()
