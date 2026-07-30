# Hidden Rolls

Hidden Rolls is a working prototype for a camera-equipped tabletop dice tray and its React Native companion app. It allows players to view physical dice rolls privately from a mobile device on the same local Wi-Fi network.

## Features

- Live ESP32-CAM feed displayed in the mobile app
- Local camera access through `hiddenrolls.local`
- One active live-stream viewer at a time by design
- English and Spanish interface options
- ESP32-CAM firmware included in the repository
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

Hidden Rolls is an active proof-of-concept. The camera-to-phone streaming path and local mDNS hostname have been successfully tested with the prototype hardware.

Automatic device pairing, Wi-Fi provisioning, hardware light control, and dice-result logging remain planned work.

## Author

Created by Devin Zalace.