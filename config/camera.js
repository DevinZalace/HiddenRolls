/**
 * camera.js
 *
 * Central configuration for HTTP communication with a Hidden Rolls tray.
 * Contains endpoint ports and paths, light limits, and URL builders.
 *
 * The camera communicates via HTTP on three ports:
 * - 80: Status checking and light control
 * - 81: MJPEG video stream
 *
 * Tray hostnames are device-specific mDNS names such as
 * hiddenrolls-abc123.local. A caller may supply an IP address instead.
 */

export const CAMERA_CONFIG = {
    statusPort: 80,
    statusPath: "/status",

    streamPort: 81,
    streamPath: "/stream",

    controlPort: 80,
    controlPath: "/control",

    lightVariable: "led_intensity",
    lightMinimumIntensity: 0,
    lightMaximumIntensity: 255,
    lightDefaultIntensity: 64,
};

/**
 * Builds the complete URL used to display the ESP32-CAM video stream.
 *
 * The host is supplied by the paired-tray record so multiple trays can be
 * supported without changing this configuration.
 */
export function buildCameraStreamUrl(host) {
  if (!host) {
    throw new Error(
      "A paired Hidden Rolls tray hostname is required."
    );
  }

  return `http://${host}:${CAMERA_CONFIG.streamPort}${CAMERA_CONFIG.streamPath}`;
}

/**
 * Builds the URL used to verify that the ESP32-CAM is reachable.
 */
export function buildCameraStatusUrl(host) {
  if (!host) {
    throw new Error(
      "A paired Hidden Rolls tray hostname is required."
    );
  }

  const port =
    CAMERA_CONFIG.statusPort === 80
      ? ""
      : `:${CAMERA_CONFIG.statusPort}`;

  return `http://${host}${port}${CAMERA_CONFIG.statusPath}`;
}

/**
 * Builds an ESP32 camera-control URL.
 */
export function buildCameraControlUrl(
  variable,
  value,
  host
) {
  if (!host) {
    throw new Error(
      "A paired Hidden Rolls tray hostname is required."
    );
  }

  const port =
    CAMERA_CONFIG.controlPort === 80
      ? ""
      : `:${CAMERA_CONFIG.controlPort}`;

  const query = new URLSearchParams({
    var: variable,
    val: String(value),
  });

  return `http://${host}${port}${CAMERA_CONFIG.controlPath}?${query.toString()}`;
}