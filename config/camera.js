// Central configuration for locating the HiddenRolls camera.
//
// The known IP address remains the default for now so that moving this
// configuration out of App.js does not change the app's behavior yet.

export const CAMERA_CONFIG = {
  defaultHost: "hiddenrolls.local",
  fallbackHost: "192.168.0.84",

  statusPort: 80,
  statusPath: "/status",

  streamPort: 81,
  streamPath: "/stream",
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