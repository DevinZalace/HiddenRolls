#pragma once

#include "sensor.h"

// One complete set of requested image adjustments.
struct CameraImageSettings {
  int brightness = 0;
  int contrast = 0;
  int saturation = 0;
  int specialEffect = 0;
};

// Applies all four settings together to an OV2640.
// Returns 0 on success, or -1 on invalid input/write failure.
// Updates sensor->status only after every write succeeds.
int applyCameraImageSettings(
  sensor_t *sensor,
  const CameraImageSettings &settings
);