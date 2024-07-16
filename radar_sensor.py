import sys
import serial
import requests
import time

# Default configurations (placeholders)
serial_port = "/dev/serial0"
baud_rate = 256000
wled_ip_address = "192.168.1.100"


# Other stuff
ser = serial.Serial()
serial_status = False

HEADER = bytes([0xfd, 0xfc, 0xfb, 0xfa])
TERMINATOR = bytes([0x04, 0x03, 0x02, 0x01])
NULLDATA = bytes([])
REPORT_HEADER = bytes([0xf4, 0xf3, 0xf2, 0xf1])
REPORT_TERMINATOR = bytes([0xf8, 0xf7, 0xf6, 0xf5])

STATE_NO_TARGET = 0
STATE_MOVING_TARGET = 1
STATE_STATIONARY_TARGET = 2
STATE_COMBINED_TARGET = 3
TARGET_NAME = ["no_target", "moving_target", "stationary_target", "combined_target"]

meas = {
    "state": STATE_NO_TARGET,
    "moving_distance": 0,
    "moving_energy": 0,
    "stationary_distance": 0,
    "stationary_energy": 0,
    "detection_distance": 0 }

def print_bytes(data):
    if len(data) == 0:
        print("<no data>")
        return
    text = f"hex: {data[0]:02x}"
    for i in range(1, len(data)):
        text = text + f" {data[i]:02x}"
    print(text)

def send_command(cmd, data=NULLDATA, response_expected=True):
    if serial_status == False:
        ser.open()
    cmd_data_len = bytes([len(cmd) + len(data), 0x00])
    frame = HEADER + cmd_data_len + cmd + data + TERMINATOR
    ser.write(frame)
    if response_expected:
        response = ser.read()#readline()
    else:
        response = NULLDATA
    ser.close()
    return response

def enable_config():
    response = send_command(bytes([0xff, 0x00]), bytes([0x01, 0x00]));
    print_bytes(response)

def end_config():
    response = send_command(bytes([0xfe, 0x00]), response_expected=False);

def read_firmware_version():
    response = send_command(bytes([0xa0, 0x00]));
    print_bytes(response)

def enable_engineering():
    response = send_command(bytes([0x62, 0x00]));
    print_bytes(response)

def end_engineering():
    response = send_command(bytes([0x63, 0x00]));
    print_bytes(response)

def read_serial_buffer():
    if serial_status == False:
        ser.open()
    response = ser.readline()
    ser.close()
    print_bytes(response)
    return response

def print_meas():
    print(f"state: {TARGET_NAME[meas['state']]}")
    print(f"moving distance: {meas['moving_distance']}")
    print(f"moving energy: {meas['moving_energy']}")
    print(f"stationary distance: {meas['stationary_distance']}")
    print(f"stationary energy: {meas['stationary_energy']}")
    print(f"detection distance: {meas['detection_distance']}")

def parse_report(data):
    global meas
    # sanity checks
    if len(data) < 23:
        print(f"error, frame length {data} is too short")
        return
    if data[0:4] != REPORT_HEADER:
        print(f"error, frame header is incorrect")
        return
    # Check if data[4] (frame length) is valid. It must be 0x0d or 0x23
    # depending on if we are in basic mode or engineering mode
    if data[4] != 0x0d and data[4] != 0x23:
        print(f"error, frame length is incorrect")
        return
    # data[7] must be report 'head' value 0xaa
    if data[7] != 0xaa:
        print(f"error, frame report head value is incorrect")
        return
    # sanity checks passed. Store the sensor data in meas
    meas["state"] = data[8]
    meas["moving_distance"] = data[9] + (data[10] << 8)
    meas["moving_energy"] = data[11]
    meas["stationary_distance"] = data[12] + (data[13] << 8)
    meas["stationary_energy"] = data[14]
    meas["detection_distance"] = data[15] + (data[16] << 8)
    # print the data
    print_meas()

def read_serial_frame():
    if serial_status == False:
        ser.open()
    response = ser.read_until(REPORT_TERMINATOR)
    # check that the length is 23 or 45 (for basic or engineering modes respectively)
    if len(response) != 23 and len(response) != 45:
        # if not, then read again
        response = ser.read_until(REPORT_TERMINATOR)
    ser.close()
    print(f"length read: {len(response)}")
    print_bytes(response)
    parse_report(response)
    return response

# Function to read radar sensor data
def read_radar_sensor():
    resp = read_serial_frame()
    #print(resp)

    return TARGET_NAME[meas['state']]


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

    ser.port = serial_port
    ser.baudrate = baud_rate
    ser.timeout = 1

    no = 0
    mov = 0
    sta_com = 0

    read_firmware_version()
    while True:
        data = read_radar_sensor()
        # Example logic based on received data
        if "no_target" in data:
            print(data)
            no = no + 1
            #control_wled(True)
            time.sleep(0.1)  # Adjust as needed
        elif "moving_target" in data:
            print(data)
            mov = mov + 1
            time.sleep(0.1)  # Adjust as needed
        
        elif "stationary_target" in data or "combined_target" in data:
            print(data)
            sta_com = sta_com + 1
            time.sleep(0.1)  # Adjust as needed
        

            #control_wled(False)
        print("--")
        print(f"no:{no}, mov:{mov}, sta_com:{sta_com}")
        #time.sleep(1)
