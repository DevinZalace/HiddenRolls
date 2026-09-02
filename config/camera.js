/**
 * camera.js
 *
 * Central configuration for the ESP32-CAM device communication.
 * Contains:
 * - Network settings (host, ports, paths)
 * - Light control settings (min/max intensity, default level)
 * - URL builder functions for HTTP requests
 *
 * The camera communicates via HTTP on three ports:
 * - 80: Status checking and light control
 * - 81: MJPEG video stream
 *
 * The default mDNS hostname (hiddenrolls-*.local) is device-specific.
 * A fallback IP address is provided for environments without mDNS support.
 */

export const CAMERA_CONFIG = {
    defaultHost: "hiddenrolls-lgz32z.local",
    fallbackHost: "192.168.0.84",

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
 * A different host can be supplied later for discovery, testing,
 * or support for multiple HiddenRolls devices.
 */
export function buildCameraStreamUrl(
  host = CAMERA_CONFIG.defaultHost
) {
  return `http://${host}:${CAMERA_CONFIG.streamPort}${CAMERA_CONFIG.streamPath}`;
}

/**
 * Builds the URL used to verify that the ESP32-CAM is reachable.
 */
export function buildCameraStatusUrl(
  host = CAMERA_CONFIG.defaultHost
) {
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
  host = CAMERA_CONFIG.defaultHost
) {
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