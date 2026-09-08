/**
 * copy.js
 *
 * Centralized localization strings for the entire app.
 * Supports multiple languages with a simple nested object structure.
 *
 * Organized by feature:
 * - Setup & onboarding (setupTitle, languageLabel, etc.)
 * - Bluetooth control (bluetoothUnavailableTitle, etc.)
 * - Connection, discovery, and streaming feedback
 * - Light control (light, brightness, lightControlErrorTitle, etc.)
 * - UI controls and terms acceptance
 *
 * Current languages: English (en), Spanish (es)
 * Can easily add more language objects following the same structure.
 */
export const copy = {
  en: {
    setupTitle: "Setup",
    languageLabel: "Language",
    next: "Next",
    back: "Back",
    english: "English",
    spanish: "Español",
    continue: "Continue",
    landingTitle: "Welcome to Hidden Rolls",
    connectionTitle: "Connection",
    howToConnect: "Set up your tray",
    connectSteps:
      "1) Power on your tray and turn on Bluetooth on your phone.\n" +
      "2) Connect your phone to the Wi-Fi network you want your tray to use.\n" +
      "3) Tap Scan Tray QR Code and scan the code included with your tray.\n" +
      "4) Follow the setup instructions. If asked to choose Wi-Fi, select the same network as your phone.",
    connectBtn: "Scan Tray QR Code",
    light: "Light",
    on: "On",
    off: "Off",
    camerafeed: "Camera Feed",
    dontagree: "Don't Agree",
    agree: "Agree",
    termsAndConditions: "Terms and Conditions",
    connecting: "Connecting...",
    connectingbody: "Searching for your HiddenRolls tray on the local network.",
    connectionFailedTitle: "Tray Not Found",
    connectionFailed:
    "HiddenRolls could not find the tray. Make sure it is powered on and connected to the same Wi-Fi network.",
    connectionTimeout:
    "The tray did not answer in time. Check its power and Wi-Fi connection, then try again.",
    retry: "Try Again",
    connectionLostTitle: "Camera Feed Unavailable",
    connectionLost:
    "The live feed could not be loaded. Check the tray's power and Wi-Fi connection, then try again.",
    lightUpdating: "Updating...",
    lightControlErrorTitle: "Light Control Failed",
    lightControlErrorBody:
    "HiddenRolls could not reach the tray light. Check the tray's power and Wi-Fi connection, then try again.",
    brightness: "Brightness",
    bluetoothUnavailableTitle: "Bluetooth unavailable",
    bluetoothUnavailableBody:
      "This device does not support the Bluetooth connection required to set up a Hidden Rolls tray.",

    bluetoothPermissionTitle: "Bluetooth permission required",
    bluetoothPermissionBody:
      "Hidden Rolls needs Bluetooth permission to find and set up your tray.",

    bluetoothOffTitle: "Turn on Bluetooth",
    bluetoothOffBody:
      "Bluetooth must be turned on before Hidden Rolls can set up your tray.",

    bluetoothErrorTitle: "Bluetooth error",
    bluetoothErrorBody:
      "Hidden Rolls could not check Bluetooth availability. Please try again.",

    checkingBluetooth: "Checking Bluetooth...",
    // Shared actions
    cancel: "Cancel",
    ok: "OK",
    pleaseTryAgain: "Please try again.",

    // Landing and paired trays
    openingTray: "Opening Tray...",
    openTray: "Open Tray",
    forgetTray: "Forget Tray",
    forgetTrayTitle: "Forget Tray?",
    forgetTrayBody:
      "This removes the tray from this app. It will not erase the Wi-Fi settings stored on the tray.",
    forgetTrayConfirm: "Forget",
    forgetTrayFailedTitle: "Could Not Forget Tray",
    setupNewTray: "Set Up New Tray",
    searchingTrays: "Searching...",
    findExistingTray: "Find Existing Tray",

    pairedTrayUnavailable:
      "Make sure your Hidden Rolls tray is powered on and connected to the same Wi-Fi network as your phone.",
    pairedTrayConnectionFailed:
      "Hidden Rolls could not connect to your paired tray.",
    existingTraysNotFound:
      "No Hidden Rolls trays were found. Make sure your tray is powered on and connected to the same Wi-Fi network as your phone.",
    existingTrayUnverified:
      "A device was discovered, but Hidden Rolls could not verify it.",
    multipleExistingTrays:
      "Multiple Hidden Rolls trays were found. Choose Set Up New Tray and scan the QR code of the tray you want to use.",
    existingTraySearchFailed:
      "Hidden Rolls could not search for existing trays.",

    // Terms
    termsRequired: "You must agree to continue using the app.",
    termsBody:
      "By using Hidden Rolls, you agree to the following:\n\n" +
      "• This app is intended for tabletop gameplay entertainment.\n" +
      "• Camera feeds are intended to be local. (No cloud storage by default.)\n" +
      "• You are responsible for complying with local laws and table rules.\n" +
      "• Use at your own risk. No warranties.\n\n" +
      "(Will replace this placeholder with real terms later.)",

    // QR scanning and permissions
    scanTitle: "Scan Your Tray",
    scanInstructions:
      "Scan the QR code included with your Hidden Rolls tray.",
    scanAgain: "Scan Again",
    savingTray: "Saving Tray...",
    cameraCheckingPermission: "Checking camera permission...",
    cameraPermissionTitle: "Camera permission required",
    cameraPermissionBody:
      "Hidden Rolls uses your camera to scan the setup QR code included with your tray.",
    allowCamera: "Allow Camera",

    // Setup cleanup
    setupStoppingTitle: "Stopping previous setup...",
    setupCleanupErrorTitle: "Setup could not stop",
    setupCleanupFailed:
      "Hidden Rolls could not stop the previous setup. Try again.",

    // Tray discovery and connection
    trayFoundTitle: "Tray Found",
    checkingTray: "Checking tray...",
    trayAlreadyConfigured: "This tray is already connected to Wi-Fi.",
    useThisTray: "Use This Tray",
    trayReady: "This tray is ready for setup.",
    trayUnreachable:
      "Hidden Rolls could not reach this tray over Wi-Fi or Bluetooth.",
    findingTray: "Finding Tray...",
    findTray: "Find Tray",
    trayFoundBle: "Tray found over Bluetooth.",
    connectToTray: "Connect to Tray",
    trayConnectedBle: "Tray connected over Bluetooth.",

    // Wi-Fi setup
    scanningWifi: "Scanning Wi-Fi...",
    scanWifi: "Scan Wi-Fi",
    wifiPassword: "Wi-Fi password",
    connectingTray: "Connecting Tray...",
    connectToWifi: "Connect to Wi-Fi",
    wifiConnected: "Tray connected to Wi-Fi successfully.",
    startingTray: "Checking your tray's Wi-Fi connection...",

    signalStrength: (rssi) => `Signal: ${rssi} dBm`,
    connectToNetwork: (ssid) => `Connect to ${ssid}`,

    // Wi-Fi reset
    resettingTray: "Resetting Tray...",
    resetWifiAndSetup: "Reset Wi-Fi & Set Up Again",
    resetWifiTitle: "Reset Wi-Fi?",
    resetWifiBody: (trayId) =>
      `This will remove the Wi-Fi network saved on Hidden Rolls ${trayId} and restart the tray. You will need to set up Wi-Fi again.`,
    resetWifiConfirm: "Reset & Continue",

    // Setup errors
    trayDiscoveryFailed:
      "Hidden Rolls could not find this tray nearby. Make sure the tray is powered on and ready for setup.",
    invalidTrayQr:
      "This QR code is not a valid Hidden Rolls tray.",
    resetTrayNotFound:
      "The tray restarted, but Hidden Rolls could not find it over Bluetooth yet. Try Find Tray again.",
    resetWifiFailed:
      "Hidden Rolls could not reset this tray's Wi-Fi.",
    trayConnectionFailed:
      "Hidden Rolls found the tray, but could not connect to it.",
    wifiScanTimedOut:
      "The Wi-Fi scan timed out. Reconnect to the tray and try again.",
    wifiScanFailed:
      "Hidden Rolls could not find nearby Wi-Fi networks.",
    wifiProvisionTimedOut:
      "The tray did not confirm Wi-Fi setup and could not be reached on the network. Reconnect to the tray and try again.",
    wifiProvisionFailed:
      "Hidden Rolls could not connect the tray to this Wi-Fi network. Check the password and try again.",
    wifiFinalizationFailed:
      "Your tray joined Wi-Fi, but your phone couldn't reach it. Make sure your phone is on the same Wi-Fi network as the tray, then tap Scan Again.",

    // Live view
    noTrayPairedTitle: "No tray paired",
    noTrayPairedBody:
      "Set up a Hidden Rolls tray before opening the live view.",
  },
  es: {
    setupTitle: "Configuración",
    languageLabel: "Idioma",
    next: "Siguiente",
    back: "Atrás",
    english: "Inglés",
    spanish: "Español",
    continue: "Continuar",
    landingTitle: "Bienvenido a Hidden Rolls",
    connectionTitle: "Conexión",
    howToConnect: "Configura tu bandeja",
    connectSteps:
      "1) Enciende tu bandeja y activa el Bluetooth de tu teléfono.\n" +
      "2) Conecta tu teléfono a la red Wi-Fi que quieres usar con tu bandeja.\n" +
      "3) Pulsa Escanear código QR y escanea el código incluido con tu bandeja.\n" +
      "4) Sigue las instrucciones de configuración. Si se te pide elegir una red Wi-Fi, selecciona la misma que usa tu teléfono.",
    connectBtn: "Escanear código QR",
    light: "Luz",
    on: "Activa",
    off: "Inactiva",
    camerafeed: "Video de la cámara",
    dontagree: "No Aceptar",
    agree: "Aceptar",
    termsAndConditions: "Términos y Condiciones",
    connecting: "Conectando...",
    connectingbody:
    "Buscando tu bandeja HiddenRolls en la red local.",
    connectionFailedTitle: "Bandeja No Encontrada",
    connectionFailed:
    "HiddenRolls no pudo encontrar la bandeja. Asegúrate de que esté encendida y conectada a la misma red Wi-Fi.",
    connectionTimeout:
    "La bandeja no respondió a tiempo. Revisa la alimentación y la conexión Wi-Fi, e inténtalo de nuevo.",
    retry: "Intentar de Nuevo",
    connectionLostTitle: "Transmisión No Disponible",
    connectionLost:
    "No se pudo cargar la transmisión en vivo. Revisa la alimentación y la conexión Wi-Fi de la bandeja, e inténtalo de nuevo.",
    lightUpdating: "Actualizando...",
    lightControlErrorTitle: "Error al Controlar la Luz",
    lightControlErrorBody:
    "HiddenRolls no pudo comunicarse con la luz de la bandeja. Revisa la alimentación y la conexión Wi-Fi, e inténtalo de nuevo.",
    brightness: "Brillo",
    bluetoothUnavailableTitle: "Bluetooth no disponible",
    bluetoothUnavailableBody:
      "Este dispositivo no admite la conexión Bluetooth necesaria para configurar una bandeja Hidden Rolls.",

    bluetoothPermissionTitle: "Se requiere permiso de Bluetooth",
    bluetoothPermissionBody:
      "Hidden Rolls necesita permiso de Bluetooth para encontrar y configurar tu bandeja.",

    bluetoothOffTitle: "Activa Bluetooth",
    bluetoothOffBody:
      "Bluetooth debe estar activado antes de que Hidden Rolls pueda configurar tu bandeja.",

    bluetoothErrorTitle: "Error de Bluetooth",
    bluetoothErrorBody:
      "Hidden Rolls no pudo comprobar la disponibilidad de Bluetooth. Inténtalo de nuevo.",

    checkingBluetooth: "Comprobando Bluetooth...",
    // Shared actions
    cancel: "Cancelar",
    ok: "Aceptar",
    pleaseTryAgain: "Inténtalo de nuevo.",

    // Landing and paired trays
    openingTray: "Abriendo bandeja...",
    openTray: "Abrir bandeja",
    forgetTray: "Olvidar bandeja",
    forgetTrayTitle: "¿Olvidar bandeja?",
    forgetTrayBody:
      "Esto elimina la bandeja de esta aplicación. No borra la configuración Wi-Fi guardada en la bandeja.",
    forgetTrayConfirm: "Olvidar",
    forgetTrayFailedTitle: "No se pudo olvidar la bandeja",
    setupNewTray: "Configurar nueva bandeja",
    searchingTrays: "Buscando...",
    findExistingTray: "Buscar bandeja existente",

    pairedTrayUnavailable:
      "Asegúrate de que tu bandeja Hidden Rolls esté encendida y conectada a la misma red Wi-Fi que tu teléfono.",
    pairedTrayConnectionFailed:
      "Hidden Rolls no pudo conectarse a tu bandeja vinculada.",
    existingTraysNotFound:
      "No se encontraron bandejas Hidden Rolls. Asegúrate de que tu bandeja esté encendida y conectada a la misma red Wi-Fi que tu teléfono.",
    existingTrayUnverified:
      "Se encontró un dispositivo, pero Hidden Rolls no pudo verificarlo.",
    multipleExistingTrays:
      "Se encontraron varias bandejas Hidden Rolls. Elige Configurar nueva bandeja y escanea el código QR de la bandeja que quieres usar.",
    existingTraySearchFailed:
      "Hidden Rolls no pudo buscar bandejas existentes.",

    // Terms
    termsRequired: "Debes aceptar para seguir usando la aplicación.",
    termsBody:
      "Al usar Hidden Rolls, aceptas lo siguiente:\n\n" +
      "• Esta aplicación está destinada al entretenimiento con juegos de mesa.\n" +
      "• Las transmisiones de la cámara están pensadas para uso local. (Sin almacenamiento en la nube de forma predeterminada.)\n" +
      "• Eres responsable de cumplir las leyes locales y las reglas de la mesa.\n" +
      "• Úsala bajo tu propia responsabilidad. Sin garantías.\n\n" +
      "(Este texto provisional se sustituirá por los términos definitivos más adelante.)",

    // QR scanning and permissions
    scanTitle: "Escanea tu bandeja",
    scanInstructions:
      "Escanea el código QR incluido con tu bandeja Hidden Rolls.",
    scanAgain: "Escanear de nuevo",
    savingTray: "Guardando bandeja...",
    cameraCheckingPermission: "Comprobando permiso de la cámara...",
    cameraPermissionTitle: "Se requiere permiso de la cámara",
    cameraPermissionBody:
      "Hidden Rolls usa la cámara para escanear el código QR de configuración incluido con tu bandeja.",
    allowCamera: "Permitir cámara",

    // Setup cleanup
    setupStoppingTitle: "Deteniendo la configuración anterior...",
    setupCleanupErrorTitle: "No se pudo detener la configuración",
    setupCleanupFailed:
      "Hidden Rolls no pudo detener la configuración anterior. Inténtalo de nuevo.",

    // Tray discovery and connection
    trayFoundTitle: "Bandeja encontrada",
    checkingTray: "Comprobando bandeja...",
    trayAlreadyConfigured: "Esta bandeja ya está conectada a Wi-Fi.",
    useThisTray: "Usar esta bandeja",
    trayReady: "Esta bandeja está lista para configurarse.",
    trayUnreachable:
      "Hidden Rolls no pudo conectarse a esta bandeja por Wi-Fi ni por Bluetooth.",
    findingTray: "Buscando bandeja...",
    findTray: "Buscar bandeja",
    trayFoundBle: "Bandeja encontrada por Bluetooth.",
    connectToTray: "Conectar a la bandeja",
    trayConnectedBle: "Bandeja conectada por Bluetooth.",

    // Wi-Fi setup
    scanningWifi: "Buscando redes Wi-Fi...",
    scanWifi: "Buscar redes Wi-Fi",
    wifiPassword: "Contraseña de Wi-Fi",
    connectingTray: "Conectando bandeja...",
    connectToWifi: "Conectar a Wi-Fi",
    wifiConnected: "La bandeja se conectó a Wi-Fi correctamente.",
    startingTray: "Comprobando la conexión Wi-Fi de tu bandeja...",

    signalStrength: (rssi) => `Señal: ${rssi} dBm`,
    connectToNetwork: (ssid) => `Conectar a ${ssid}`,

    // Wi-Fi reset
    resettingTray: "Restableciendo bandeja...",
    resetWifiAndSetup: "Restablecer Wi-Fi y configurar de nuevo",
    resetWifiTitle: "¿Restablecer Wi-Fi?",
    resetWifiBody: (trayId) =>
      `Esto eliminará la red Wi-Fi guardada en Hidden Rolls ${trayId} y reiniciará la bandeja. Tendrás que configurar el Wi-Fi de nuevo.`,
    resetWifiConfirm: "Restablecer y continuar",

    // Setup errors
    trayDiscoveryFailed:
      "Hidden Rolls no pudo encontrar esta bandeja cerca. Asegúrate de que esté encendida y lista para configurarse.",
    invalidTrayQr:
      "Este código QR no corresponde a una bandeja Hidden Rolls válida.",
    resetTrayNotFound:
      "La bandeja se reinició, pero Hidden Rolls aún no pudo encontrarla por Bluetooth. Pulsa Buscar bandeja de nuevo.",
    resetWifiFailed:
      "Hidden Rolls no pudo restablecer el Wi-Fi de esta bandeja.",
    trayConnectionFailed:
      "Hidden Rolls encontró la bandeja, pero no pudo conectarse a ella.",
    wifiScanTimedOut:
      "Se agotó el tiempo de búsqueda de redes Wi-Fi. Vuelve a conectarte a la bandeja e inténtalo de nuevo.",
    wifiScanFailed:
      "Hidden Rolls no pudo encontrar redes Wi-Fi cercanas.",
    wifiProvisionTimedOut:
      "La bandeja no confirmó la configuración Wi-Fi y no se pudo acceder a ella en la red. Vuelve a conectarte a la bandeja e inténtalo de nuevo.",
    wifiProvisionFailed:
      "Hidden Rolls no pudo conectar la bandeja a esta red Wi-Fi. Comprueba la contraseña e inténtalo de nuevo.",
    wifiFinalizationFailed:
      "Tu bandeja se conectó a Wi-Fi, pero tu teléfono no pudo acceder a ella. Asegúrate de que tu teléfono esté en la misma red Wi-Fi que la bandeja y pulsa Escanear de nuevo.",

    // Live view
    noTrayPairedTitle: "No hay ninguna bandeja vinculada",
    noTrayPairedBody:
      "Configura una bandeja Hidden Rolls antes de abrir la vista en directo.",
  },
};