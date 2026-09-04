/**
 * cameraService.js
 *
 * Service layer for HTTP communication with the ESP32-CAM device.
 * Provides:
 * - Connection verification (ping/status checks)
 * - Light intensity control via HTTP requests
 * - Timeout handling and error recovery
 *
 * All methods return result objects instead of throwing errors,
 * allowing screens to decide how to present failures.
 */

import {
  CAMERA_CONFIG,
  buildCameraControlUrl,
  buildCameraStatusUrl,
} from "../config/camera";

// Default timeout for all HTTP requests to the camera
const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Checks whether the HiddenRolls camera is reachable.
 *
 * Returns a result object instead of throwing an error so that screens
 * can decide how connection failures should be presented to the user.
 */
export async function checkCameraConnection({
  host,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const statusUrl = buildCameraStatusUrl(host);

    const response = await fetch(statusUrl, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        connected: false,
        reason: "http-error",
        statusCode: response.status,
      };
    }

    let cameraStatus = null;

    try {
      cameraStatus = await response.json();
    } catch {
      // A successful response still proves the camera is reachable,
      // even if its body could not be parsed as JSON.
    }

    return {
      connected: true,
      statusCode: response.status,
      cameraStatus,
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      return {
        connected: false,
        reason: "timeout",
      };
    }

    return {
      connected: false,
      reason: "network-error",
      error,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function verifyHiddenRollsTray(
  tray,
  timeoutMs = 3000
) {
  if (!tray?.hostname || !tray?.trayId) {
    return false;
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(
      `http://${tray.hostname}/status`,
      {
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      return false;
    }

    const status = await response.json();

    return (
      status?.device === "hiddenrolls" &&
      status?.tray_id === tray.trayId &&
      status?.schema === 1
    );
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Sets the HiddenRolls camera light to a specific intensity.
 *
 * The ESP32 accepts whole-number values from 0 through 255.
 */
export async function setCameraLightIntensity(
  intensity,
  {
    host,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = {}
) {
  const numericIntensity = Number(intensity);

  if (!Number.isFinite(numericIntensity)) {
    return {
      success: false,
      reason: "invalid-intensity",
    };
  }

  const normalizedIntensity = Math.min(
    CAMERA_CONFIG.lightMaximumIntensity,
    Math.max(
      CAMERA_CONFIG.lightMinimumIntensity,
      Math.round(numericIntensity)
    )
  );

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const controlUrl = buildCameraControlUrl(
      CAMERA_CONFIG.lightVariable,
      normalizedIntensity,
      host
    );

    const response = await fetch(controlUrl, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        success: false,
        reason: "http-error",
        statusCode: response.status,
      };
    }

    return {
      success: true,
      enabled:
        normalizedIntensity >
        CAMERA_CONFIG.lightMinimumIntensity,
      intensity: normalizedIntensity,
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      return {
        success: false,
        reason: "timeout",
      };
    }

    return {
      success: false,
      reason: "network-error",
      error,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Turns the light on at its default intensity or completely off.
 *
 * This wrapper preserves the simple on/off interface while the underlying
 * service supports the full brightness range.
 */
export async function setCameraLight(
  enabled,
  options = {}
) {
  const intensity = enabled
    ? CAMERA_CONFIG.lightDefaultIntensity
    : CAMERA_CONFIG.lightMinimumIntensity;

  return setCameraLightIntensity(intensity, options);
}

// Helper function to pause execution for a given number of milliseconds.
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Waits for the tray to become reachable over Wi-Fi after provisioning.
export async function waitForTrayReady(
  hostname,
  {
    timeoutMs = 60000,
    intervalMs = 1500,
  } = {}
) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const controller = new AbortController();

    const requestTimeout = setTimeout(() => {
      controller.abort();
    }, 3000);

    try {
      const response = await fetch(
        buildCameraStatusUrl(hostname),
        {
          signal: controller.signal,
          cache: "no-store",
        }
      );

      if (response.ok) {
        return true;
      }
    } catch {
      // Expected while the tray is tearing down BLE,
      // starting the camera, or registering mDNS.
    } finally {
      clearTimeout(requestTimeout);
    }

    await sleep(intervalMs);
  }

  throw new Error(
    `${hostname} did not become reachable after provisioning.`
  );
}