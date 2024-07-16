import sys
import serial
import requests
import time

# Default configurations (placeholders)
serial_port = "/dev/serial0"
baud_rate = 256000
wled_ip_address = "192.168.1.100"

# Function to read radar sensor data
def read_radar_sensor():
    ser = serial.Serial(serial_port, baud_rate)
    while True:
        if ser.in_waiting > 0:
            data = ser.readline().strip().decode('utf-8')
            print("Data received from radar sensor:", data)
            return data

# Function to control WLED
def control_wled(state):
    url = f"http://{wled_ip_address}/win&FX={128 if state else 0}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        print(f"WLED state set to {state}")
    except requests.exceptions.RequestException as e:
        print(f"Error setting WLED state: {e}")

# Main execution
if __name__ == "__main__":
    # Read configuration variables from command-line arguments
    if len(sys.argv) > 1:
        serial_port = sys.argv[1]
        baud_rate = int(sys.argv[2])
        wled_ip_address = sys.argv[3]

    while True:
        data = read_radar_sensor()
        # Example logic based on received data
        if "presence" in data:
            control_wled(True)
            time.sleep(5)  # Adjust as needed
        else:
            control_wled(False)
