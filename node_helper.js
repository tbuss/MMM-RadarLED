const NodeHelper = require("node_helper");
const { exec } = require("child_process");
const request = require("request");

module.exports = NodeHelper.create({
  start: function() {
    console.log("Starting node helper for: " + this.name);
    this.userPresenceDetected = false;
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "CONFIG") {
      this.config = payload;
      this.initializeRadarSensor();
    }
  },

  initializeRadarSensor: function() {
    // Initialize the radar sensor here, e.g., with GPIO pin configurations
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
      this.controlWLED(true);
      setTimeout(() => {
        this.sendSocketNotification("USER_PRESENCE");
      }, this.config.presenceTimeout * 1000);
    } else if (!userDetected && this.userPresenceDetected) {
      this.userPresenceDetected = false;
      this.controlWLED(false);
    }
  },

  controlWLED: function(state) {
    const url = `http://${this.config.wledIpAddress}/win&FX=${state ? 128 : 0}`;
    request(url, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        console.log("WLED state set to " + state);
      }
    });
  }
});
