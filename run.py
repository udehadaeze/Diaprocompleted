#!/usr/bin/env python3
"""
Run script for Diapro application
This script starts the FastAPI server
"""

import os
import sys
import subprocess
import platform

def check_virtual_environment():
    """Check if virtual environment is activated"""
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("✅ Virtual environment is activated")
        return True
    else:
        print("⚠️  Virtual environment is not activated")
        print("Please activate it first:")
        if platform.system() == "Windows":
            print("   venv\\Scripts\\activate")
        else:
            print("   source venv/bin/activate")
        return False

def run_server():
    """Run the FastAPI server"""
    print("🚀 Starting Diapro FastAPI server...")
    
    # Change to backend directory
    os.chdir("backend")
    
    # Run uvicorn
    try:
        subprocess.run([
            "uvicorn", "main:app", 
            "--reload", 
            "--host", "0.0.0.0", 
            "--port", "8000"
        ], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

def main():
    """Main function"""
    print("Diapro - Diabetes Management Application")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not os.path.exists("backend"):
        print("❌ Please run this script from the project root directory")
        sys.exit(1)
    
    # Check virtual environment
    if not check_virtual_environment():
        response = input("Continue anyway? (y/N): ")
        if response.lower() != 'y':
            sys.exit(1)
    
    # Run the server
    run_server()

if __name__ == "__main__":
    main() 