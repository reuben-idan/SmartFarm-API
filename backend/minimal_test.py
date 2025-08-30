#!/usr/bin/env python
"""Minimal test to verify Python environment."""

def test_minimal():
    """A simple test that should always pass."""
    print("Running minimal test...")
    assert 1 + 1 == 2, "Basic math should work"
    print("Minimal test passed!")

if __name__ == "__main__":
    test_minimal()
