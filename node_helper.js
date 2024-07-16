const NodeHelper = require("node_helper");
const { exec } = require("child_process");
const request = require("request");
const SerialPort = require("serialport");

module.exports = NodeHelper.create({
  start: function() {
    console.log("Starting node helper for: " + this.name);
    this.userPresenceDetected = false;
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "CONFIG") {
      this.config = payload;
      this.initializeRadarSensor();
      this.initializeSerialPort();
    }
  },

  initializeRadarSensor: function() {
    // Initialize the radar sensor GPIO pin
    // Example: Using Raspberry Pi GPIO interface (see WiringPi or similar libraries)

    // Simulated initialization and monitoring of the radar sensor
    setInterval(() => {
      this.checkRadarSensor();
    }, 1000);  // Check every second
  },

  checkRadarSensor: function() {
    // Simulated detection of a user in front of the mirror
    // Actual radar sensor code needs to be implemented here

    // Example radar detection (simulation)
    const userDetected = Math.random() < 0.5;  // 50% chance a user is detected

    if (userDetected && !this.userPresenceDetected) {
      this.userPresenceDetected = true;
      this.controlWLED(true).catch(err => console.error("Error controlling WLED:", err));
      setTimeout(() => {
        this.sendSocketNotification("USER_PRESENCE");
      }, this.config.presenceTimeout * 1000);
    } else if (!userDetected && this.userPresenceDetected) {
      this.userPresenceDetected = false;
      this.controlWLED(false).catch(err => console.error("Error controlling WLED:", err));
    }
  },

  initializeSerialPort: function() {
    const port = new SerialPort(this.config.serialPort, {
      baudRate: this.config.baudRate
    });

    port.on("data", (data) => {
      this.handleSerialData(data);
    });

    port.on("error", (err) => {
      console.error("Error: ", err.message);
    });
  },

  handleSerialData: function(data) {
    // Process the data received from the radar sensor via serial communication
    // Example: Parsing the data to get more detailed information about user presence

    console.log("Serial Data Received: ", data);

    // Assuming data contains presence information, update user presence state
    const userDetected = data.includes("presence");  // Modify according to actual data format

    if (userDetected && !this.userPresenceDetected) {
      this.userPresenceDetected = true;
      this.controlWLED(true).catch(err => console.error("Error controlling WLED:", err));
      setTimeout(() => {
        this.sendSocketNotification("USER_PRESENCE");
      }, this.config.presenceTimeout * 1000);
    } else if (!userDetected && this.userPresenceDetected) {
      this.userPresenceDetected = false;
      this.controlWLED(false).catch(err => console.error("Error controlling WLED:", err));
    }
  },

  controlWLED: function(state) {
    const url = `http://${this.config.wledIpAddress}/win&FX=${state ? 128 : 0}`;
    return new Promise((resolve, reject) => {
      request(url, (error, response, body) => {
        if (error) {
          console.error("Error setting WLED state:", error);
          reject(error);
        } else if (response.statusCode !== 200) {
          const err = new Error(`Failed to set WLED state, status code: ${response.statusCode}`);
          console.error(err);
          reject(err);
        } else {
          console.log("WLED state set to " + state);
          resolve(body);
        }
      });
    });
  }
});
