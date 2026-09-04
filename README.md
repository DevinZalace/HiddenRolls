# Hidden Rolls

Hidden Rolls is a hardware-software prototype for a camera-equipped tabletop dice tray and its React Native companion app.

The tray uses an ESP32-CAM to provide a live view of hidden dice rolls over a local Wi-Fi network. The companion app handles tray setup, local discovery, persistent pairing, live video, connection monitoring, and physical light control.

## Features

### Companion App

- Live ESP32-CAM MJPEG video feed
- Tray-specific QR code onboarding
- Bluetooth tray discovery and connection
- Wi-Fi network scanning and credential provisioning
- Persistent paired-tray storage across app restarts
- mDNS discovery of already-configured trays
- Recovery of forgotten app pairings without repeating setup
- Detection of trays already connected to Wi-Fi
- Option to reuse or reset and reprovision an existing tray
- Real connection health checks and stream recovery
- Physical light on/off control
- Adjustable LED brightness
- English and Spanish interface support
- Tray-agnostic routing with no hard-coded device hostname or IP

### ESP32-CAM Firmware

- Camera streaming over the local network
- HTTP status and light-control endpoints
- BLE Wi-Fi provisioning
- Saved Wi-Fi credential reconnect
- Automatic setup mode when no saved Wi-Fi exists
- Per-tray provisioning identity and mDNS hostname
- `_hiddenrolls._tcp` mDNS service advertising
- Tray identity exposed through `/status`
- Authenticated Wi-Fi reset and automatic reboot into provisioning mode
- Controlled release of BLE resources before camera initialization

## Device Identity

Each Hidden Rolls tray has its own six-character identifier, provisioning name, mDNS hostname, display name, and proof-of-possession secret.

Real per-device configuration is stored in `tray_config.h`, which is excluded from Git. A committed `tray_config.example.h` documents the expected structure without exposing device secrets.

## Setup Flow

New trays can move from QR scan to live camera view without manually editing firmware or entering an IP address:

1. Scan the tray QR code.
2. Find and connect to the tray over Bluetooth.
3. Scan nearby Wi-Fi networks.
4. Select a network and enter its password.
5. Provision the tray.
6. Wait for it to reconnect over Wi-Fi.
7. Open the live camera view.

If a scanned tray is already configured, the app can either reuse it immediately or reset its Wi-Fi credentials and run setup again.

Already-configured trays can also be rediscovered over the local network using mDNS if the app pairing is lost.

## Status

Hidden Rolls is an active hardware-software prototype.

Currently implemented and physically tested:

- QR onboarding
- Bluetooth provisioning
- Wi-Fi setup and reconnect
- Persistent pairing
- LAN tray discovery
- Existing-tray recovery
- Wi-Fi reset and reprovisioning
- Live camera streaming
- Connection monitoring and recovery
- Physical light and brightness control

Planned work includes:

- Physical recovery for trays stranded on an unavailable Wi-Fi network
- Multi-tray management
- Production hardware and enclosure hardening

## Built With

- React Native
- Expo
- JavaScript / TypeScript
- Kotlin
- React Native WebView
- AI Thinker ESP32-CAM
- Arduino
- Bluetooth Low Energy
- MJPEG streaming
- mDNS / DNS-SD

## Author

Created by Devin Zalace.