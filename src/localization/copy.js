/**
 * copy.js
 *
 * Centralized localization strings for the entire app.
 * Supports multiple languages with a simple nested object structure.
 *
 * Organized by feature:
 * - Setup & onboarding (setupTitle, languageLabel, etc.)
 * - Bluetooth control (bluetoothUnavailableTitle, etc.)
 * - Connection & streaming (connecting, connectionFailed, etc.)
 * - Light control (light, brightness, lightControlErrorTitle, etc.)
 * - UI controls (back, continue, agree, etc.)
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
    howToConnect: "How to connect",
    connectSteps: "1) Power on the tray camera.\n2) Join the tray’s Wi-Fi on your phone.\n3) Tap Connect to view the feed.",
    connectBtn: "Connect to Camera Feed",
    connecting: "Connecting...",
    connectingbody: "Make sure you’re on the tray’s Wi-Fi.",
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
    howToConnect: "Cómo conectar",
    connectSteps:"1) Enciende la cámara.\n2) Conecta tu teléfono al Wi-Fi de la bandeja.\n3) Pulsa Conectar para ver el video.",
    connectBtn: "Conectar a la cámara",
    connecting: "Conectando...",
    connectingbody: "Asegúrate de estar conectado al Wi-Fi de la bandeja.",
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
  },
};