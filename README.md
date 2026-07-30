# Hidden Rolls

Hidden Rolls is a working prototype for a camera-equipped tabletop dice tray and its React Native companion app.

The app connects to an ESP32-CAM over a local Wi-Fi network, displays a live view of the dice tray, and allows the user to control the tray’s built-in light.

## Features

- Live ESP32-CAM video feed
- Local camera access through `hiddenrolls.local`
- Real connection checks and automatic retries
- Detection of camera disconnection
- Stream recovery after reconnecting
- Physical light on/off control
- Adjustable light brightness
- English and Spanish interface options
- ESP32-CAM firmware included
- Wi-Fi credentials protected through an ignored `secrets.h` file

## Built With

- React Native
- Expo
- JavaScript
- React Native WebView
- AI Thinker ESP32-CAM
- Arduino
- MJPEG streaming
- mDNS local discovery

## Status

Hidden Rolls is an active hardware-software prototype.

The camera stream, connection recovery, light controls, and brightness adjustment have been tested with the physical ESP32-CAM hardware.

Wi-Fi onboarding, device pairing, and automatic dice recognition remain planned features.

## Author

Created by Devin Zalace.
