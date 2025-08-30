#!/usr/bin/env python
"""
Check for syntax errors in Python files.
"""
import ast
import os

def check_file(filepath):
    """Check a Python file for syntax errors."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            ast.parse(f.read())
        return True
    except SyntaxError as e:
        print(f"Syntax error in {filepath}:{e.lineno}: {e.msg}")
        return False
    except Exception as e:
        print(f"Error checking {filepath}: {e}")
        return False

def main():
    # Check test files
    test_dir = os.path.join('apps', 'farmers', 'tests')
    for root, _, files in os.walk(test_dir):
        for file in files:
            if file.endswith('.py') and file != '__init__.py':
                filepath = os.path.join(root, file)
                if check_file(filepath):
                    print(f"✓ {filepath} has no syntax errors")

if __name__ == '__main__':
    main()
