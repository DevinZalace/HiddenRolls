import {
  CAMERA_CONFIG,
  buildCameraControlUrl,
  buildCameraStatusUrl,
} from "../config/camera";

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