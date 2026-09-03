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
- Tray-specific QR code scanning during setup
- Bluetooth tray discovery and connection
- Wi-Fi network scanning and secure credential provisioning
- Automatic wait for the tray to become reachable after provisioning
- Paired-tray routing to the live camera view
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

The mobile setup flow is:

1. Accept the app terms and open tray setup.
2. Grant camera and Bluetooth permissions.
3. Scan the tray-specific QR code.
4. Find and connect to the tray over Bluetooth.
5. Scan Wi-Fi networks visible to the tray.
6. Select a network and enter its password.
7. Wait for the tray to reconnect over Wi-Fi.
8. Open the live camera view using the paired tray's hostname.

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

The consumer-facing onboarding flow is implemented in the mobile app. The project remains an active hardware-software prototype, and production hardening is still in progress.

Planned work includes:

- Improve recovery when a previously saved Wi-Fi network is unavailable
- Support multiple production trays cleanly
- Automatic dice recognition

The goal is a setup experience where a new tray can move from factory-fresh hardware to a working live camera feed without manually editing firmware or entering an IP address.

## Author

Created by Devin Zalace.
