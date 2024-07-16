Module.register("MMM-RadarLED", {
    defaults: {
      radarSensorPin: 17,  // GPIO pin for the radar sensor signal
      wledIpAddress: "192.168.1.100",  // IP address of the WLED controller
      presenceTimeout: 5,  // Time in seconds before sending notification
      serialPort: "/dev/ttyS0",  // Serial port for RX/TX communication
      baudRate: 115200  // Baud rate for serial communication
    },
  
    start: function() {
      Log.info("Starting module: " + this.name);
      this.sendSocketNotification("CONFIG", this.config);S
    },
  
    socketNotificationReceived: function(notification, payload) {
      if (notification === "USER_PRESENCE") {
        this.sendNotification("USER_PRESENCE");
      }
    }
  });
  