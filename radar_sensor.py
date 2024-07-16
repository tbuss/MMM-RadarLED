import serial
import requests
import time

# Configurations
serial_port = "/dev/ttyS0"  # Adjust as per your Raspberry Pi's setup
baud_rate = 115200
wled_ip_address = "192.168.1.100"

def read_radar_sensor():
    ser = serial.Serial(serial_port, baud_rate)
    while True:
        if ser.in_waiting > 0:
            data = ser.readline().strip().decode('utf-8')
            print("Data received from radar sensor:", data)
            return data

def control_wled(state):
    url = f"http://{wled_ip_address}/win&FX={128 if state else 0}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        print(f"WLED state set to {state}")
    except requests.exceptions.RequestException as e:
        print(f"Error setting WLED state: {e}")

if __name__ == "__main__":
    while True:
        data = read_radar_sensor()
        # Example logic based on received data
        if "presence" in data:
            control_wled(True)
            time.sleep(5)  # Adjust as needed
        else:
            control_wled(False)
