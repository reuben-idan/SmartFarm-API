#!/usr/bin/env python3
import json
import os
from pathlib import Path

def generate_env_from_service_account(service_account_path):
    """Generate environment variables from Firebase service account JSON."""
    try:
        with open(service_account_path, 'r') as f:
            service_account = json.load(f)
        
        env_vars = {
            'FIREBASE_TYPE': service_account.get('type', ''),
            'FIREBASE_PROJECT_ID': service_account.get('project_id', ''),
            'FIREBASE_PRIVATE_KEY_ID': service_account.get('private_key_id', ''),
            'FIREBASE_PRIVATE_KEY': service_account.get('private_key', '').replace('\n', '\\n'),
            'FIREBASE_CLIENT_EMAIL': service_account.get('client_email', ''),
            'FIREBASE_CLIENT_ID': service_account.get('client_id', ''),
            'FIREBASE_AUTH_URI': service_account.get('auth_uri', 'https://accounts.google.com/o/oauth2/auth'),
            'FIREBASE_TOKEN_URI': service_account.get('token_uri', 'https://oauth2.googleapis.com/token'),
            'FIREBASE_AUTH_PROVIDER_X509_CERT_URL': service_account.get('auth_provider_x509_cert_url', ''),
            'FIREBASE_CLIENT_X509_CERT_URL': service_account.get('client_x509_cert_url', '')
        }
        
        # Generate .env file content
        env_content = ""
        for key, value in env_vars.items():
            env_content += f'{key}="{value}"\n'
        # Generate Render environment variables format
        render_vars = ""
        for key, value in env_vars.items():
            render_vars += f'{key}={value}\n'
        # Save to files
        with open('.env', 'w') as f:
            f.write(env_content)
            
        with open('render.env', 'w') as f:
            f.write(render_vars)
            
        print("Generated environment files:")
        print("1. .env - For local development")
        print("2. render.env - For Render deployment")
        print("\nAdd these environment variables to your Render dashboard:")
        print(render_vars)
        
    except FileNotFoundError:
        print(f"Error: {service_account_path} not found.")
        print("Please provide the path to your service account JSON file.")
    except json.JSONDecodeError:
        print("Error: Invalid JSON file. Please provide a valid Firebase service account JSON file.")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python generate_firebase_env.py <path_to_service_account.json>")
        sys.exit(1)
    
    generate_env_from_service_account(sys.argv[1])
