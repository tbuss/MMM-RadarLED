const NodeHelper = require("node_helper");
const { exec } = require("child_process");

module.exports = NodeHelper.create({
  start: function() {
    console.log("Starting node helper for: " + this.name);
    this.startPythonScript();
  },

  startPythonScript: function() {
    const { radarSensorPin, serialPort, baudRate, wledIpAddress } = this.config;

    // Start the Python script as a child process with configuration variables
    const pythonProcess = exec(`python3 radar_sensor.py ${serialPort} ${baudRate} ${wledIpAddress}`, { cwd: __dirname });

    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python script stdout: ${data}`);
      // Example: Parse data from Python script and send notifications if needed
      if (data.includes("presence")) {
        this.sendSocketNotification("USER_PRESENCE", true);
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python script stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python script process exited with code ${code}`);
    });
  },

  stop: function() {
    // Clean up any resources if needed
    console.log("Stopping node helper for: " + this.name);
  },

  socketNotificationReceived: function(notification, payload) {
    // Handle any notifications from MMM-RadarLED.js if needed
  }
});
