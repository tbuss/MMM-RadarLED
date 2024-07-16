const NodeHelper = require("node_helper");
const { exec } = require("child_process");

module.exports = NodeHelper.create({
  start: function() {
    console.log("Starting node helper for: " + this.name);
    this.startPythonScript();
  },

  startPythonScript: function() {
    // Start the Python script as a child process
    this.pythonProcess = exec("python3 radar_sensor.py", { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Python script execution error: ${error}`);
      }
      console.error(`Python script stderr: ${stderr}`);
    });

    this.pythonProcess.stdout.on('data', (data) => {
      console.log(`Python script stdout: ${data}`);
      // Example: Parse data from Python script and send notifications if needed
      if (data.includes("presence")) {
        this.sendSocketNotification("USER_PRESENCE", true);
      }
    });
  },

  stop: function() {
    if (this.pythonProcess) {
      this.pythonProcess.kill();
    }
    console.log("Stopping node helper for: " + this.name);
  },

  socketNotificationReceived: function(notification, payload) {
    // Handle any notifications from MMM-RadarLED.js if needed
  }
});
