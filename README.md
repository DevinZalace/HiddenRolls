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
# Hidden Rolls

Hidden Rolls is a hardware-software prototype for a camera-equipped tabletop dice tray and its React Native companion app.

The tray uses an ESP32-CAM to provide a live view of hidden dice rolls over a local Wi-Fi network. The companion app connects to the tray, displays the camera stream, monitors connection health, and controls the tray's built-in lighting.

The project is currently expanding from a single development prototype toward a provisionable multi-device architecture, where each physical tray has its own identity and can be configured for a customer's Wi-Fi network without hard-coded credentials.

## Features

### Companion App

- Live ESP32-CAM MJPEG video feed
- Local tray connection through mDNS
- Real connection health checks
- Automatic connection retries
- Camera disconnection detection
- Stream recovery after reconnecting
- Physical light on/off control
- Adjustable LED brightness
- Synchronization with the tray's current light state
- English and Spanish interface options
- Separate landing, setup, connecting, and live-view screens
- Centralized camera configuration and camera service logic

### ESP32-CAM Firmware

- Camera streaming over the local network
- HTTP status and light-control endpoints
- mDNS service advertising
- BLE Wi-Fi provisioning
- Espressif Security 1 proof-of-possession provisioning
- Saved Wi-Fi credential reconnect on later boots
- Automatic first-boot setup mode when no saved network exists
- Per-tray provisioning identity
- Per-tray mDNS hostname
- Per-tray display name
- Provisioning event and connection-state handling
- Controlled release of BLE provisioning resources before camera initialization
- Startup safeguards for provisioning cleanup and unavailable saved networks

## Device Identity

Each Hidden Rolls tray is designed to have its own six-character identifier.

Each tray also receives its own proof-of-possession secret for secured BLE provisioning.

The real per-device configuration is stored in `tray_config.h`, which is excluded from Git. A `tray_config.example.h` file documents the expected structure without exposing device secrets.

## Provisioning Flow

The firmware now supports two startup paths.

1. New or Unconfigured Tray
2. Previously Configured Tray

Provisioning is intentionally completed before camera initialization because both systems compete for limited ESP32 memory, including DMA-capable memory required by the camera.

Hidden Rolls is an active hardware-software prototype.

The core physical tray system is working, including:

- Live camera streaming
- Local network communication
- Connection monitoring and recovery
- Physical light control
- Adjustable brightness
- Firmware-side BLE Wi-Fi provisioning
- Saved Wi-Fi reconnect
- Per-tray device identity

The current development focus is completing the consumer-facing onboarding experience inside the Hidden Rolls mobile app.

Planned work includes:

- Scan a tray-specific QR code from the Hidden Rolls app
- Connect to the correct tray over BLE
- Select a Wi-Fi network
- Send Wi-Fi credentials securely to the tray
- Discover the newly connected tray automatically
- Remove development-specific tray addressing from the app
- Improve recovery when a previously saved Wi-Fi network is unavailable
- Support multiple production trays cleanly
- Automatic dice recognition

The goal is a setup experience where a new tray can move from factory-fresh hardware to a working live camera feed without manually editing firmware or entering an IP address.

## Author

Created by Devin Zalace.
