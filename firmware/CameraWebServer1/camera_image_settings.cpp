#include "camera_image_settings.h"

#include <stdint.h>

// Internal camera-driver function exported by the installed
// Arduino ESP32 3.3.11 camera library.
extern "C" int SCCB_Write(
  uint8_t slv_addr,
  uint8_t reg,
  uint8_t data
);

namespace {

constexpr int kSdeAddressRegister = 0x007C;
constexpr uint8_t kSdeDataRegister = 0x7D;

constexpr uint8_t kBrightnessContrastEnable = 0x04;
constexpr uint8_t kSaturationEnable = 0x02;

struct EffectPreset {
  uint8_t flags;
  uint8_t u;
  uint8_t v;
};

// Matches the app's existing effect values, 0 through 6.
constexpr EffectPreset kEffectPresets[] = {
  {0x00, 0x80, 0x80},  // Normal
  {0x40, 0x80, 0x80},  // Negative
  {0x18, 0x80, 0x80},  // Grayscale
  {0x18, 0x40, 0xC0},  // Red tint
  {0x18, 0x40, 0x40},  // Green tint
  {0x18, 0xA0, 0x40},  // Blue tint
  {0x18, 0x40, 0xA6},  // Sepia
};

bool isValidAdjustment(int value) {
  return value >= -2 && value <= 2;
}

int writeSdeValue(
  sensor_t *sensor,
  uint8_t address,
  uint8_t value
) {
  // Select the DSP bank and the desired internal SDE address
  // through the driver, preserving its cached bank selection.
  if (
    sensor->set_reg(
      sensor,
      kSdeAddressRegister,
      0xFF,
      address
    ) != 0
  ) {
    return -1;
  }

  // Write the data directly. The generic set_reg function
  // performs a read first; this data port needs only a write.
  return SCCB_Write(
    sensor->slv_addr,
    kSdeDataRegister,
    value
  ) == 0 ? 0 : -1;
}

}  // namespace

int applyCameraImageSettings(
  sensor_t *sensor,
  const CameraImageSettings &settings
) {
  if (
    sensor == nullptr ||
    sensor->set_reg == nullptr ||
    sensor->id.PID != OV2640_PID
  ) {
    return -1;
  }

  if (
    !isValidAdjustment(settings.brightness) ||
    !isValidAdjustment(settings.contrast) ||
    !isValidAdjustment(settings.saturation) ||
    settings.specialEffect < 0 ||
    settings.specialEffect > 6
  ) {
    return -1;
  }

  const EffectPreset &effect =
    kEffectPresets[settings.specialEffect];

  const uint8_t enableFlags = static_cast<uint8_t>(
    kBrightnessContrastEnable |
    kSaturationEnable |
    effect.flags
  );

  const uint8_t saturationValue = static_cast<uint8_t>(
    0x48 + settings.saturation * 0x10
  );

  const uint8_t contrastValue = static_cast<uint8_t>(
    0x20 + settings.contrast * 4
  );

  // Empirical combined mapping from esp32-camera issue #401.
  int brightnessValue =
    0x20 +
    settings.brightness * 10 -
    settings.contrast * 10;

  if (brightnessValue < 0) {
    brightnessValue = 0;
  } else if (brightnessValue > 255) {
    brightnessValue = 255;
  }

  // Each pair is {internal SDE address, value}.
  // Write the combined enable flags last.
  const uint8_t writes[][2] = {
    {0x03, saturationValue},
    {0x04, saturationValue},
    {0x05, effect.u},
    {0x06, effect.v},
    {0x07, 0x20},
    {0x08, contrastValue},
    {0x09, static_cast<uint8_t>(brightnessValue)},
    {0x0A, 0x06},
    {0x00, enableFlags},
  };

  for (const auto &entry : writes) {
    if (writeSdeValue(sensor, entry[0], entry[1]) != 0) {
      // Earlier writes may have succeeded. The caller must
      // treat this as a failed application, not confirmation.
      return -1;
    }
  }

  sensor->status.brightness = settings.brightness;
  sensor->status.contrast = settings.contrast;
  sensor->status.saturation = settings.saturation;
  sensor->status.special_effect = settings.specialEffect;

  return 0;
}