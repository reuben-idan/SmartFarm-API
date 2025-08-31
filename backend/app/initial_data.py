import os
from passlib.context import CryptContext
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_initial_admin_user():
    """
    Returns the initial admin user data from environment variables.
    This should only be used for the first-time setup.
    """
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_username = os.getenv("ADMIN_USERNAME")
    admin_password = os.getenv("ADMIN_PASSWORD")
    
    if not all([admin_email, admin_username, admin_password]):
        return None
    
    return {
        "username": admin_username,
        "email": admin_email,
        "hashed_password": pwd_context.hash(admin_password),
        "is_admin": True
    }

# This is a mock database for demo purposes
# In a production environment, you would use a real database
class MockDB:
    def __init__(self):
        self.users = {}
        
    def get_user_by_email(self, email: str):
        return self.users.get(email)
    
    def create_user(self, user_data: dict):
        self.users[user_data["email"]] = user_data
        return user_data

# Initialize the mock database
mock_db = MockDB()

# Create initial admin user if it doesn't exist
def initialize_admin_user():
    admin_user = get_initial_admin_user()
    if admin_user and not mock_db.get_user_by_email(admin_user["email"]):
        mock_db.create_user(admin_user)
        print(f"Created initial admin user: {admin_user['email']}")
    return mock_db

# Initialize the database when this module is imported
db = initialize_admin_user()
