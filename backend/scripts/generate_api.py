#!/usr/bin/env python3
"""
Script to automatically generate API endpoints for all models in the project.
"""
import os
import re
import inspect
import importlib
from pathlib import Path
from django.apps import apps

# Project root directory
BASE_DIR = Path(__file__).resolve().parent.parent
APPS_DIR = os.path.join(BASE_DIR, 'apps')

# Template for serializers
SERIALIZER_TEMPLATE = """"""
# This file is auto-generated. Do not edit manually.
from rest_framework import serializers
from {app_name}.models import {model_name}
from apps.api.base_serializers import BaseModelSerializer

class {model_name}Serializer(BaseModelSerializer):
    """Serializer for the {model_name} model."""
    
    class Meta(BaseModelSerializer.Meta):
        model = {model_name}
"""

# Template for views
VIEW_TEMPLATE = """"""
# This file is auto-generated. Do not edit manually.
from rest_framework import viewsets
from {app_name}.models import {model_name}
from {app_name}.serializers import {model_name}Serializer
from apps.api.base_views import BaseModelViewSet

class {model_name}ViewSet(BaseModelViewSet):
    """API endpoint for {model_name} model."""
    
    queryset = {model_name}.objects.all()
    serializer_class = {model_name}Serializer
"""

def get_model_names(app_name):
    """Get all model names for a given app."""
    try:
        models_module = importlib.import_module(f"apps.{app_name}.models")
        models = []
        for name, obj in inspect.getmembers(models_module):
            if inspect.isclass(obj) and hasattr(obj, '_meta') and not obj._meta.abstract:
                models.append(name)
        return models
    except ImportError:
        return []

def ensure_directory(path):
    """Ensure that a directory exists."""
    os.makedirs(path, exist_ok=True)

def write_file(path, content):
    """Write content to a file if it doesn't exist."""
    if not os.path.exists(path):
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Created {path}")
    else:
        print(f"Skipped {path} (already exists)")

def generate_serializer(app_name, model_name):
    """Generate a serializer for a model."""
    serializer_dir = os.path.join(APPS_DIR, app_name, 'serializers')
    ensure_directory(serializer_dir)
    
    # Create __init__.py if it doesn't exist
    init_file = os.path.join(serializer_dir, '__init__.py')
    if not os.path.exists(init_file):
        with open(init_file, 'w') as f:
            f.write("# This file makes the serializers directory a Python package\n")
    
    # Create the serializer file
    serializer_file = os.path.join(serializer_dir, f"{model_name.lower()}_serializers.py")
    serializer_content = SERIALIZER_TEMPLATE.format(
        app_name=app_name,
        model_name=model_name
    )
    write_file(serializer_file, serializer_content)

def generate_view(app_name, model_name):
    """Generate a view for a model."""
    views_dir = os.path.join(APPS_DIR, app_name, 'views')
    ensure_directory(views_dir)
    
    # Create __init__.py if it doesn't exist
    init_file = os.path.join(views_dir, '__init__.py')
    if not os.path.exists(init_file):
        with open(init_file, 'w') as f:
            f.write("# This file makes the views directory a Python package\n")
    
    # Create the view file
    view_file = os.path.join(views_dir, f"{model_name.lower()}_views.py")
    view_content = VIEW_TEMPLATE.format(
        app_name=app_name,
        model_name=model_name
    )
    write_file(view_file, view_content)

def update_urls(app_name, model_name):
    """Update the urls.py file to include the new viewset."""
    urls_file = os.path.join(APPS_DIR, app_name, 'urls.py')
    
    # If urls.py doesn't exist, create it
    if not os.path.exists(urls_file):
        with open(urls_file, 'w') as f:
            f.write(f""""""
# {app_name} URLs
# This file is auto-generated. Do not edit manually.
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import {model_name}ViewSet

app_name = '{app_name}'

router = DefaultRouter()
router.register(r'{model_name.lower()}s', {model_name}ViewSet, basename='{model_name.lower()}')

urlpatterns = [
    path('', include(router.urls)),
]
""")
        print(f"Created {urls_file}")
        return
    
    # If urls.py exists, update it
    with open(urls_file, 'r+') as f:
        content = f.read()
        
        # Check if the viewset is already imported
        view_import = f"from .views import {model_name}ViewSet"
        if view_import not in content:
            # Add the import
            content = content.replace(
                "from rest_framework.routers import DefaultRouter",
                f"from rest_framework.routers import DefaultRouter\nfrom .views import {model_name}ViewSet"
            )
        
        # Check if the viewset is already registered
        register_pattern = re.compile(rf"router\.register\(r'{model_name.lower()}s'")
        if not register_pattern.search(content):
            # Add the router registration before urlpatterns
            content = content.replace(
                "urlpatterns = [",
                f"router.register(r'{model_name.lower()}s', {model_name}ViewSet, basename='{model_name.lower()}')\n\nurlpatterns = ["
            )
            
            # Write the updated content back to the file
            f.seek(0)
            f.write(content)
            f.truncate()
            
            print(f"Updated {urls_file}")
        else:
            print(f"Skipped {urls_file} (already registered)")

def main():
    """Main function to generate API endpoints for all models."""
    # Get all installed apps
    for app_config in apps.get_app_configs():
        app_name = app_config.name.split('.')[-1]
        
        # Skip third-party apps
        if not app_name.startswith('apps.'):
            continue
            
        app_name = app_name.replace('apps.', '')
        
        # Skip the api app
        if app_name == 'api':
            continue
            
        print(f"\nProcessing app: {app_name}")
        
        # Get all models in the app
        model_names = get_model_names(app_name)
        
        if not model_names:
            print(f"  No models found in {app_name}")
            continue
            
        for model_name in model_names:
            # Skip abstract models
            if model_name in ['BaseModel', 'TimeStampedModel', 'SoftDeleteModel']:
                continue
                
            print(f"  Generating API for {model_name}")
            
            # Generate serializer
            generate_serializer(app_name, model_name)
            
            # Generate view
            generate_view(app_name, model_name)
            
            # Update URLs
            update_urls(app_name, model_name)

if __name__ == "__main__":
    main()
