# MMM-RadarLED
MagicMirror module to detect user presence using a radar sensor and control WLED.

## Installation
1. Clone this repository into the `modules` folder of your MagicMirror:
    ```sh
    git clone https://github.com/your-repo/MMM-RadarLED.git
    ```

2. Install the dependencies:
    ```sh
    cd MMM-RadarLED
    npm install
    ```

## Configuration
Add the configuration to your `config.js` file:
```js
{
    module: "MMM-RadarLED",
    config: {
        radarSensorPin: 17,  // GPIO pin for the radar sensor
        wledIpAddress: "192.168.1.100",  // IP address of the WLED controller
        presenceTimeout: 5  // Time in seconds before sending notification
    }
}
