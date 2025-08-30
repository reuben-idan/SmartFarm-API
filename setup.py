from setuptools import setup, find_packages

setup(
    name="smartfarm_api",
    version="0.1",
    packages=find_packages(where='.'),
    package_dir={"": "."},
    include_package_data=True,
    install_requires=[
        'fastapi>=0.68.0',
        'uvicorn[standard]>=0.15.0',
        'gunicorn>=20.1.0',
        'python-jose[cryptography]>=3.3.0',
        'passlib[bcrypt]>=1.7.4',
        'python-multipart>=0.0.5',
        'python-dotenv>=0.19.0',
        'pydantic>=1.8.2',
        'websockets>=10.0',
        'python-dateutil>=2.8.2'
    ],
    python_requires='>=3.8',
)
