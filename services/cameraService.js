import {
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