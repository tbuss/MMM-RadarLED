Module.register("MMM-RadarLED", {
  defaults: {
    radarSensorPin: 17,  // GPIO pin for the radar sensor
    wledIpAddress: "192.168.1.100",  // IP address of the WLED controller
    presenceTimeout: 5,  // Time in seconds before sending notification
  },

  start: function() {
    Log.info("Starting module: " + this.name);
    this.sendSocketNotification("CONFIG", this.config);
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "USER_PRESENCE") {
      this.sendNotification("USER_PRESENCE");
    }
  }
});
