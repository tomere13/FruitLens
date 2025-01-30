import os
import signal
import subprocess
import sys
import time

flask_process = None
expo_process = None

def start_flask():
    """Start Flask backend."""
    global flask_process
    backend_path = os.path.join(os.getcwd(), "backend")

    if not os.path.isdir(backend_path):
        print("❌ Backend directory not found!")
        return

    print("🚀 Starting Flask backend...")
    os.chdir(backend_path)

    # Start Flask and forward output to the terminal
    flask_process = subprocess.Popen(["python3", "app.py"], stdout=sys.stdout, stderr=sys.stderr)

def start_expo():
    """Start Expo frontend with interactive shell support."""
    global expo_process
    frontend_path = os.path.join(os.getcwd(), "../frontend")

    if not os.path.isdir(frontend_path):
        print("❌ Frontend directory not found!")
        return

    print("🚀 Starting Expo frontend...")
    os.chdir(frontend_path)

    # Use os.execvp to start Expo in the same process environment
    expo_process = subprocess.Popen(
        ["npx", "expo", "start", "-c"],
        stdout=sys.stdout,
        stderr=sys.stderr,
        stdin=sys.stdin,  # Forward user input
        bufsize=1,  # Disable output buffering
        universal_newlines=True,
    )

def stop_services():
    """Stop both Flask and Expo."""
    print("\n🛑 Stopping services...")

    if flask_process:
        print("📌 Stopping Flask backend...")
        flask_process.terminate()
        flask_process.wait()

    if expo_process:
        print("📌 Stopping Expo frontend...")
        expo_process.terminate()
        expo_process.wait()

    print("✅ Services stopped.")

def signal_handler(sig, frame):
    """Handle CTRL + C to stop everything gracefully."""
    stop_services()
    sys.exit(0)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)

    start_flask()

    # Give Flask time to start
    time.sleep(3)

    start_expo()

    # Keep the script running until Ctrl+C is pressed
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        stop_services()