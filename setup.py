from setuptools import setup, find_packages

with open("requirements.txt") as f:
    requirements = f.read().splitlines()

setup(
    name="smartfarm-api",
    version="0.1.0",
    packages=find_packages(include=['backend', 'backend.*']),
    install_requires=requirements,
    python_requires=">=3.11.0",
    include_package_data=True,
    package_data={
        '': ['*.yaml', '*.yml', '*.json', '*.md', '.env*'],
    },
    entry_points={
        'console_scripts': [
            'smartfarm-api=backend.app.main:main',
        ],
    },
)
