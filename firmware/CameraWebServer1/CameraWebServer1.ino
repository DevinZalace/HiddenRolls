#include <Arduino.h>
#include "esp_camera.h"
#include <WiFi.h>
#include <ESPmDNS.h>
#include "tray_config.h"
#include "WiFiProv.h"
#include "esp_heap_caps.h"
#include <esp_wifi.h>

// ===========================
// Select camera model in board_config.h
// ===========================
#include "board_config.h"

// Main startup sequence for the Hidden Rolls firmware.
//
// Networking and any required BLE provisioning are completed before camera
// initialization so provisioning resources can be released before the camera
// requests its DMA-capable memory.
//
// After Wi-Fi is ready, the firmware initializes the camera and exposes the
// HTTP and mDNS services used by the Hidden Rolls companion app.


void startCameraServer();
void setupLedFlash();

enum class NetworkStartupMode {
  Unknown,
  SavedCredentials,
  Provisioning,
  ProvisioningCleanupComplete
};

NetworkStartupMode networkStartupMode =
    NetworkStartupMode::Unknown;
// Receives provisioning and Wi-Fi events from the Arduino ESP32 framework.
void onProvisioningEvent(arduino_event_t *event) {
  switch (event->event_id) {

    case ARDUINO_EVENT_PROV_START:
      networkStartupMode = NetworkStartupMode::Provisioning;
      Serial.print("BLE provisioning started: ");
      Serial.println(HR_PROV_NAME);
      break;

    case ARDUINO_EVENT_PROV_CRED_RECV:
      Serial.println("Wi-Fi credentials received.");
      break;

    case ARDUINO_EVENT_PROV_CRED_FAIL:
      Serial.println("Provisioning failed: Wi-Fi connection rejected.");
      break;

    case ARDUINO_EVENT_PROV_CRED_SUCCESS:
      Serial.println("Provisioning succeeded.");
      break;

    case ARDUINO_EVENT_PROV_END:
      Serial.println("Provisioning service stopped.");
      break;

    case ARDUINO_EVENT_WIFI_STA_GOT_IP:
      Serial.print("Wi-Fi connected. IP address: ");
      Serial.println(WiFi.localIP());
      break;

    case ARDUINO_EVENT_PROV_DEINIT:
      if (networkStartupMode == NetworkStartupMode::Provisioning) {
        networkStartupMode =
            NetworkStartupMode::ProvisioningCleanupComplete;
      }
      Serial.println("Provisioning resources released.");
      break;

    default:
      break;
  }
}

bool hasSavedWifiCredentials() {
  wifi_config_t savedConfig = {};

  esp_err_t result =
      esp_wifi_get_config(WIFI_IF_STA, &savedConfig);

  if (result != ESP_OK) {
    Serial.printf(
      "Unable to read saved Wi-Fi configuration: 0x%x\n",
      result
    );

    return false;
  }

  return savedConfig.sta.ssid[0] != '\0';
}

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();

  // Keep the Wi-Fi interface in STA mode before starting BLE provisioning so
  // the provisioning manager can allocate its queues without competing with an
  // already-initialized camera frame buffer pool.
  WiFi.mode(WIFI_STA);
  WiFi.setHostname(HR_MDNS_HOSTNAME);
  WiFi.setSleep(false);
  Serial.println("Initializing network...");

  // Register before provisioning begins so we can observe every stage.
  WiFi.onEvent(onProvisioningEvent);


  bool savedCredentialsExist = hasSavedWifiCredentials();
// Initialize network provisioning before the camera.
  //
  // BLE provisioning requires internal memory, while camera initialization also
  // needs a sufficiently large contiguous DMA-capable allocation. Provisioning
  // must therefore finish and release its resources before esp_camera_init().
if (savedCredentialsExist) {
  networkStartupMode =
      NetworkStartupMode::SavedCredentials;

  Serial.println(
    "Saved Wi-Fi credentials found. Connecting..."
  );

  WiFi.begin();
} else {
  Serial.println(
    "No saved Wi-Fi credentials. Starting setup mode."
  );

  WiFiProv.beginProvision(
    NETWORK_PROV_SCHEME_BLE,
    NETWORK_PROV_SCHEME_HANDLER_FREE_BTDM,
    NETWORK_PROV_SECURITY_1,
    HR_PROV_POP,
    HR_PROV_NAME
  );
}

  Serial.println("Waiting for Wi-Fi...");

  if (
    networkStartupMode ==
    NetworkStartupMode::SavedCredentials
  ) {
    const unsigned long wifiTimeoutMs = 30000;
    const unsigned long connectionStartedAt = millis();

    while (WiFi.status() != WL_CONNECTED) {
      if (
        millis() - connectionStartedAt >= wifiTimeoutMs
      ) {
        Serial.println(
          "Saved Wi-Fi network unavailable."
        );

        // Recovery provisioning 
        break;
      }

      delay(250);
    }
  } else {
    // Initial provisioning has no arbitrary timeout.
    // The customer may still be completing setup in the app.
    while (WiFi.status() != WL_CONNECTED) {
      delay(250);
    }
  }
  if (WiFi.status() != WL_CONNECTED) {
      Serial.println(
        "Recovery provisioning is required."
      );

      return;
    }
  if (
      networkStartupMode == NetworkStartupMode::Provisioning ||
      networkStartupMode == NetworkStartupMode::ProvisioningCleanupComplete) {
    if (networkStartupMode == NetworkStartupMode::Provisioning) {
      Serial.println("Wi-Fi connected. Waiting for provisioning cleanup...");

      const unsigned long provisioningWaitTimeoutMs = 10000;
      unsigned long provisioningWaitStartMs = millis();
      while (networkStartupMode == NetworkStartupMode::Provisioning) {
        if (millis() - provisioningWaitStartMs >= provisioningWaitTimeoutMs) {
          Serial.println(
            "ERROR: Provisioning cleanup timed out. Restarting safely."
          );

          delay(500);
          ESP.restart();
        }
        delay(50);
      }
    }

    Serial.println("Provisioning cleanup complete.");
  } else {
    networkStartupMode = NetworkStartupMode::SavedCredentials;
    Serial.println("Wi-Fi connected using saved credentials.");
  }

  Serial.println("Wi-Fi ready.");

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.frame_size = FRAMESIZE_UXGA;
  config.pixel_format = PIXFORMAT_JPEG;  // for streaming
  //config.pixel_format = PIXFORMAT_RGB565; // for face detection/recognition
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;
  config.fb_count = 1;

  // if PSRAM IC present, init with UXGA resolution and higher JPEG quality
  //                      for larger pre-allocated frame buffer.
  if (config.pixel_format == PIXFORMAT_JPEG) {
    if (psramFound()) {
      config.jpeg_quality = 10;
      config.fb_count = 2;
      config.grab_mode = CAMERA_GRAB_LATEST;
    } else {
      // Limit the frame size when PSRAM is not available
      config.frame_size = FRAMESIZE_SVGA;
      config.fb_location = CAMERA_FB_IN_DRAM;
    }
  } else {
    // Best option for face detection/recognition
    config.frame_size = FRAMESIZE_240X240;
#if CONFIG_IDF_TARGET_ESP32S3
    config.fb_count = 2;
#endif
  }

#if defined(CAMERA_MODEL_ESP_EYE)
  pinMode(13, INPUT_PULLUP);
  pinMode(14, INPUT_PULLUP);
#endif

  // camera init
  esp_err_t err = esp_camera_init(&config);

  if (err != ESP_OK) {
  Serial.printf(
    "ERROR: Camera initialization failed with error 0x%x\n",
    err
  );

  Serial.printf(
    "Free heap: %u bytes\n",
    ESP.getFreeHeap()
  );

  Serial.printf(
    "Largest DMA-capable block: %u bytes\n",
    heap_caps_get_largest_free_block(MALLOC_CAP_DMA)
  );

  Serial.printf(
    "Free PSRAM: %u bytes\n",
    ESP.getFreePsram()
  );

  return;
}

  sensor_t *s = esp_camera_sensor_get();
  // initial sensors are flipped vertically and colors are a bit saturated
  if (s->id.PID == OV3660_PID) {
    s->set_vflip(s, 1);        // flip it back
    s->set_brightness(s, 1);   // up the brightness just a bit
    s->set_saturation(s, -2);  // lower the saturation
  }
  // drop down frame size for higher initial frame rate
  if (config.pixel_format == PIXFORMAT_JPEG) {
    s->set_framesize(s, FRAMESIZE_QVGA);
  }

#if defined(CAMERA_MODEL_M5STACK_WIDE) || defined(CAMERA_MODEL_M5STACK_ESP32CAM)
  s->set_vflip(s, 1);
  s->set_hmirror(s, 1);
#endif

#if defined(CAMERA_MODEL_ESP32S3_EYE)
  s->set_vflip(s, 1);
#endif

// Setup LED FLash if LED pin is defined in camera_pins.h
#if defined(LED_GPIO_NUM)
  setupLedFlash();
#endif

  // Once networking is available, register the camera handlers and expose the
  // device over mDNS so the mobile app can discover it more easily.
startCameraServer();

if (MDNS.begin(HR_MDNS_HOSTNAME)) {
  MDNS.setInstanceName(HR_DISPLAY_NAME);

  // Standard HTTP service for the camera control/status server.
  MDNS.addService("http", "tcp", 80);

  // Hidden Rolls product discovery service.
  // Port 80 is used because discovery will verify the tray through /status.
  MDNS.addService("hiddenrolls", "tcp", 80);

  MDNS.addServiceTxt(
    "hiddenrolls",
    "tcp",
    "id",
    HR_TRAY_ID
  );

  MDNS.addServiceTxt(
    "hiddenrolls",
    "tcp",
    "ver",
    "1"
  );

  Serial.print("Camera page: http://");
  Serial.print(HR_MDNS_HOSTNAME);
  Serial.println(".local");

  Serial.print("Camera stream: http://");
  Serial.print(HR_MDNS_HOSTNAME);
  Serial.println(".local:81/stream");

  Serial.print("mDNS hostname: ");
  Serial.println(HR_MDNS_HOSTNAME);

  Serial.println(
    "Hidden Rolls discovery service: _hiddenrolls._tcp"
  );
} else {
  Serial.println("Error starting mDNS responder");
}

Serial.print("Camera Ready! Use 'http://");
Serial.print(WiFi.localIP());
Serial.println("' to connect");

}

void loop() {
  // The web server handles camera requests asynchronously, so the main loop
  // can remain lightweight and avoid unnecessary work.
  delay(10000);
}
