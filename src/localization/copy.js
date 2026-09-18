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
    `Hidden Rolls Terms and Conditions

    Effective Date: September 18, 2026
    Last Updated: September 18, 2026

    These Terms and Conditions (“Terms”) govern your use of the Hidden Rolls mobile application, associated Hidden Rolls device firmware, and related software provided by D&T Manufacturing LLC (“D&T,” “we,” “us,” or “our”).

    By downloading, installing, accessing, or using the Hidden Rolls application or associated software, you agree to these Terms.

    If you do not agree to these Terms, do not use the Hidden Rolls application or associated software.

    1. Hidden Rolls

    Hidden Rolls is designed to operate with compatible Hidden Rolls tabletop gaming hardware.

    The application provides features including hardware setup, Bluetooth provisioning, local-network device discovery, live local camera viewing, lighting controls, configuration controls, and other functionality relating to compatible Hidden Rolls products.

    Features may change as the application and Hidden Rolls hardware continue to develop.

    2. Hardware and Network Requirements

    Certain Hidden Rolls features require compatible Hidden Rolls hardware, a supported mobile device, Bluetooth functionality, and access to a compatible local Wi-Fi network.

    You are responsible for maintaining the mobile device, network equipment, internet or local-network configuration, electrical power, permissions, and other equipment necessary to use Hidden Rolls.

    D&T cannot guarantee compatibility with every mobile device, operating-system version, router, firewall configuration, network environment, or third-party device.

    Local network conditions, wireless interference, operating-system restrictions, hardware configuration, or other factors outside D&T's control may affect connection quality or application functionality.

    3. Local Camera Stream

    Compatible Hidden Rolls hardware includes an internal camera used to provide a live view of the concealed dice area during tabletop gameplay.  

    The camera and live stream are intended solely for use with Hidden Rolls gameplay features. Stream quality and availability may vary based on local network conditions, device compatibility, wireless interference, and hardware conditions.

    4. Responsible Use

    You agree to use Hidden Rolls lawfully and responsibly.

    You may not use the application, firmware, camera, or Hidden Rolls hardware to intentionally violate another person's privacy rights, unlawfully record or monitor another person, gain unauthorized access to a device or network, interfere with another system, or engage in conduct prohibited by applicable law.

    You are responsible for determining whether your use of any camera or recording capability complies with the laws and rules applicable where you use the product.

    Hidden Rolls is intended for tabletop gaming and related entertainment purposes.

    5. Account-Free Operation

    The current version of Hidden Rolls does not require a D&T user account for its primary features.

    Certain future features may require additional agreements, account registration, online services, purchases, or permissions.

    If those features are introduced, additional terms may apply.

    6. Privacy

    Your use of Hidden Rolls is also subject to the Hidden Rolls Privacy Policy.

    The Privacy Policy explains how the application processes device, network, camera, provisioning, and other information associated with its operation.

    7. Software License

    Subject to these Terms, D&T grants you a limited, personal, non-exclusive, non-transferable, non-sublicensable, and revocable license to install and use the Hidden Rolls application and associated firmware solely for lawful personal or internal use with compatible Hidden Rolls products.

    The application and firmware are licensed, not sold.

    This license does not transfer ownership of the software, firmware, intellectual property, artwork, branding, product designs, or other D&T materials to you.

    8. Restrictions

    Except where applicable law expressly permits otherwise, you may not copy, redistribute, sell, sublicense, rent, lease, commercially exploit, modify, circumvent security measures in, or create unauthorized derivative versions of the Hidden Rolls application or firmware.

    You may not use the Hidden Rolls software or firmware to interfere with D&T services, compromise compatible hardware, gain unauthorized access to another device or network, or distribute malicious software.

    Nothing in these Terms prevents activities that applicable law expressly gives you the right to perform.

    9. Intellectual Property

    Hidden Rolls, D&T Manufacturing LLC, associated names and logos, application interfaces, firmware, software, original artwork, product artwork, sculptural designs, product concepts, graphics, written materials, adventures, fictional material, and other original content may be protected by copyright, trademark, trade dress, patent, trade-secret, or other intellectual-property laws.

    Except for the limited software license granted under these Terms, no rights in D&T intellectual property are transferred to you.

    Third-party names, trademarks, game systems, artwork, or other materials remain the property of their respective owners.

    10. User-Provided Objects

    The Hidden Rolls camera is designed to view the enclosed dice area inside the product.

    Objects placed or rolled into that area, including dice or other tabletop gaming pieces, may appear in the local camera stream.

    D&T does not claim ownership of any objects or materials that appear in the Hidden Rolls camera stream.

    11. Updates and Firmware

    D&T may provide application or firmware updates to improve compatibility, security, stability, functionality, or user experience.

    Updates may modify or remove existing features or introduce new features.

    Certain updates may become necessary for continued compatibility with operating systems, mobile devices, app stores, or Hidden Rolls hardware.

    D&T does not guarantee that every previous version of the application or firmware will remain supported indefinitely.

    12. Beta and Development Features

    Certain Hidden Rolls features may be identified as beta, experimental, preview, development, or pre-release features.

    Such features may contain errors, change substantially, operate inconsistently, or be removed.

    You should not rely on beta or development features for any critical purpose.

    13. Third-Party Platforms and Services

    Hidden Rolls may depend on or interact with third-party operating systems, mobile-device manufacturers, application marketplaces, routers, networking equipment, Bluetooth implementations, or other technologies that D&T does not control.

    Your use of those third-party products and services may be governed by separate terms.

    D&T is not responsible for changes made by third parties that affect Hidden Rolls functionality, including operating-system changes, permission changes, networking restrictions, or application-marketplace requirements.

    14. Availability

    We may modify, suspend, discontinue, restrict, or replace part or all of the Hidden Rolls application or associated software at any time.

    We do not guarantee uninterrupted or error-free operation.

    Temporary interruptions may occur due to software bugs, updates, device conditions, network conditions, maintenance, hardware limitations, or factors outside our control.

    15. Disclaimer of Warranties

    To the fullest extent permitted by applicable law, the Hidden Rolls application, firmware, and related software are provided on an “as is” and “as available” basis.

    D&T does not warrant that the application or firmware will be uninterrupted, error-free, completely secure, compatible with every device or network, or free from defects.

    Nothing in these Terms limits any warranty or consumer right that cannot lawfully be excluded or limited.

    Any warranty applicable to physical Hidden Rolls products may be provided separately from these Terms.

    16. Limitation of Liability

    To the fullest extent permitted by applicable law, D&T Manufacturing LLC and its owners, officers, employees, contractors, and affiliates will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages arising from or related to your use of, or inability to use, the Hidden Rolls application or firmware.

    This includes, where permitted by law, loss of data, loss of use, loss of profits, interruption of gameplay, network problems, device incompatibility, or damage resulting from unauthorized or improper use of the software.

    To the extent liability cannot legally be excluded, D&T's liability will be limited to the maximum extent permitted by applicable law.

    Nothing in these Terms excludes liability that applicable law does not permit us to exclude.

    17. Your Responsibility for Network Security

    You are responsible for securing your Wi-Fi network, router, mobile device, passwords, and Hidden Rolls hardware.

    You should use reasonable network-security practices and should not intentionally expose local Hidden Rolls device interfaces directly to the public internet unless D&T expressly provides a feature designed for that purpose.

    D&T is not responsible for unauthorized access caused by insecure network configurations, shared credentials, modified firmware, unsupported modifications, or deliberate exposure of local device services to external networks.

    18. Modifications and Unsupported Use

    Hidden Rolls hardware and software may be modifiable by technically experienced users.

    D&T is not responsible for problems caused by unauthorized firmware, hardware modification, electrical modification, altered software, unsupported third-party components, or use of Hidden Rolls outside its intended operating conditions.

    Modification of a product may also affect any separate warranty applicable to the physical product.

    19. Suspension or Termination

    You may stop using Hidden Rolls at any time.

    D&T may restrict or terminate your authorization to use D&T-provided software if you materially violate these Terms or use the software for unlawful purposes.

    Sections of these Terms that by their nature should continue after termination, including intellectual-property provisions, disclaimers, limitations of liability, and governing-law provisions, will remain in effect.

    20. Changes to These Terms

    We may update these Terms as Hidden Rolls products and services evolve.

    When we make changes, we will update the “Last Updated” date above.

    If a change materially affects your rights or obligations, we may provide additional notice within the application or through another appropriate method.

    Your continued use of Hidden Rolls after updated Terms become effective constitutes acceptance of those updated Terms to the extent permitted by applicable law.

    21. Governing Law

    These Terms are governed by the laws of the State of Colorado, without regard to conflict-of-law principles.

    Except where applicable consumer law requires otherwise, disputes arising from these Terms or your use of the Hidden Rolls application or firmware will be subject to the jurisdiction of the state or federal courts located in or serving Denver County, Colorado.

    These Terms do not limit any rights you may have under mandatory consumer-protection laws that apply to you.

    22. Severability

    If any provision of these Terms is found unenforceable, that provision will be enforced to the maximum extent permitted by law and the remaining provisions will remain in effect.

    23. Entire Agreement

    These Terms, together with the Hidden Rolls Privacy Policy and any additional terms expressly presented for a particular Hidden Rolls feature or service, constitute the agreement between you and D&T regarding use of the Hidden Rolls application and firmware.

    Separate terms may govern the purchase, return, warranty, or physical use of Hidden Rolls products.

    24. Contact

    Questions about these Terms may be sent to:

    D&T Manufacturing LLC
    1500 N Grant St Ste N  
    Denver, CO 80203  
    United States

    Email: dntmfc@gmail.com`,

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

    //Settings
    settings: "Settings",
    language: "Language",
    appSettings: "App",
    languageDescription: "Choose the language used throughout Hidden Rolls.",
    about: "About",
    termsOfUse: "Terms of Use",
    privacyPolicy: "Privacy Policy",
    support: "Support",
    privacyPolicyText:
    `Hidden Rolls Privacy Policy

    Effective Date: September 18, 2026
    Last Updated: September 18, 2026

    D&T Manufacturing LLC (“D&T,” “we,” “us,” or “our”) operates the Hidden Rolls mobile application and develops the firmware used with Hidden Rolls products.

    This Privacy Policy explains how information is handled when you use the Hidden Rolls mobile application and compatible Hidden Rolls hardware.

    Hidden Rolls is designed around local communication between your mobile device and your Hidden Rolls hardware. We have intentionally designed the application to minimize the information transmitted to or collected by D&T.

    1. Information We Do Not Collect

    The Hidden Rolls application does not currently require user accounts and does not collect or transmit personal information to D&T for advertising, analytics, profiling, or marketing purposes.

    The application does not currently use third-party advertising networks, behavioral tracking tools, analytics platforms, or crash-reporting services that transmit user activity to D&T.

    We do not sell personal information.

    We do not use Hidden Rolls application activity for targeted advertising.

    2. Local Device and Network Information

    To connect to and operate Hidden Rolls hardware, the application may process certain information locally on your mobile device.

    This may include information such as:

    Wi-Fi network information used during device setup;

    Bluetooth or nearby-device information;

    a Hidden Rolls device identifier, device name, or local hostname;

    local network addresses used to locate and communicate with Hidden Rolls hardware;

    application preferences, such as language or interface settings;

    lighting settings or other device-control preferences; and

    information indicating whether setup or provisioning has been completed.

    This information is used to provide the application's core functionality.

    Unless specifically stated otherwise in a future version of this Privacy Policy, this information is processed locally and is not transmitted to D&T.

    3. Wi-Fi Provisioning

    Hidden Rolls hardware may use Bluetooth Low Energy, or BLE, during initial setup so that the application can configure the hardware to connect to your Wi-Fi network.

    During this process, the application may temporarily process your selected Wi-Fi network name and Wi-Fi credentials.

    Those credentials are transmitted directly from your mobile device to your Hidden Rolls hardware as part of the provisioning process. D&T does not receive or store your Wi-Fi password on its servers.

    Your Hidden Rolls hardware may store Wi-Fi credentials locally so that it can reconnect to your network after being powered off or restarted.

    4. QR Code and Camera Access

    The Hidden Rolls application may request access to your mobile device's camera when camera access is needed to scan a Hidden Rolls setup or device QR code.

    Camera access is used for this setup function.

    Images viewed by the QR scanner are processed on your device for the purpose of identifying the QR code and are not intended to be stored by the Hidden Rolls application or transmitted to D&T.

    You may deny or later revoke camera permission through your device settings, although doing so may prevent QR-based setup features from functioning.

    5. Bluetooth, Nearby Devices, and Local Network Access

    The application may request Bluetooth, Nearby Devices, local-network, or related system permissions depending on your mobile operating system and version.

    These permissions allow the application to discover, configure, connect to, and communicate with Hidden Rolls hardware.

    Operating systems may describe these permissions differently or associate certain device-discovery technologies with additional system permissions.

    Hidden Rolls uses these permissions only as needed to provide device setup and communication features.

    6. Hidden Rolls Camera and Video Stream

    Compatible Hidden Rolls hardware contains a camera that provides a live view of the designated dice area.

    The video stream is transmitted locally between your Hidden Rolls hardware and your mobile device over your local network.

    D&T does not receive, monitor, record, store, or upload the Hidden Rolls video stream to D&T servers.

    The Hidden Rolls application is not intended to provide cloud video storage or remote surveillance.

    Unless a future feature expressly states otherwise, video viewed through the Hidden Rolls application remains within the local connection between the Hidden Rolls hardware and the user's device.

    Your mobile device or operating system may independently provide features such as screenshots or screen recording. Those features are controlled by you and by your device's operating system rather than by D&T.

    7. Information Stored on Your Device

    The Hidden Rolls application may store application preferences and device configuration information locally on your mobile device.

    This may include settings necessary to make the application easier to use or to reconnect to previously configured Hidden Rolls hardware.

    Locally stored application information generally remains on your device until it is removed through application settings, operating-system controls, clearing application data, or uninstalling the application.

    Certain network configuration information may also remain stored on Hidden Rolls hardware until the hardware is reset, reconfigured, or otherwise cleared.

    Because this information is stored locally, D&T generally cannot remotely access, modify, or delete it for you.

    8. Third-Party Platforms

    You may obtain the Hidden Rolls application through a third-party application marketplace such as Google Play or the Apple App Store.

    Those platforms may independently collect information relating to application downloads, purchases, device information, diagnostics, or account activity according to their own privacy policies and settings.

    Information independently collected by an application marketplace or operating-system provider is controlled by that provider and is not governed by this Privacy Policy unless D&T separately receives that information.

    9. Network Security

    Hidden Rolls is intended to communicate with compatible hardware on a trusted local network.

    Some local communications used by embedded devices may not provide the same encryption or security protections used by internet-based services.

    You are responsible for maintaining reasonable security for your local network, Wi-Fi credentials, mobile device, and Hidden Rolls hardware.

    You should not intentionally expose Hidden Rolls local device interfaces directly to the public internet unless a feature provided by D&T expressly supports doing so.

    10. Disclosure of Information

    Because the Hidden Rolls application currently does not transmit user application data to D&T as part of its normal operation, we generally do not possess application data to disclose to third parties.

    If D&T receives information directly from you, such as when you contact us for customer support, we may use that information to respond to your request, troubleshoot an issue, maintain appropriate business records, or comply with applicable law.

    We may disclose information when reasonably necessary to comply with applicable law, legal process, or a valid governmental request, or when necessary to protect the rights, property, or safety of D&T, our users, or others.

    11. Your Choices

    You can control application permissions through your mobile device's operating-system settings.

    You may stop the application from accessing Bluetooth, nearby devices, the camera, or local-network functionality by disabling the applicable permission. Disabling a permission required for a feature may prevent that feature from working.

    You may remove locally stored application information by using available operating-system controls, clearing application data, or uninstalling the application.

    You may also reset or reconfigure your Hidden Rolls hardware using available device procedures.

    12. General Audience

    Hidden Rolls is intended for a general audience.

    The application is not designed around the collection of personal information and does not require a Hidden Rolls user account to operate its current core features.

    13. Changes to This Privacy Policy

    We may update this Privacy Policy as Hidden Rolls evolves, including when new application features, hardware capabilities, third-party services, or data practices are introduced.

    When we make changes, we will update the “Last Updated” date above.

    If a future change materially alters how information is collected, used, or shared, we may provide additional notice within the application or through another appropriate method.

    14. Contact Us

    If you have questions about this Privacy Policy or Hidden Rolls privacy practices, you may contact:

    D&T Manufacturing LLC 
    1500 N Grant St Ste N  
    Denver, CO 80203  
    United States

    Email: dntmfc@gmail.com`,
    supportText:
    "Need help with Hidden Rolls?\n\nContact D&T Manufacturing at dntmfc@gmail.com or visit hidden-rolls.com.",

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
    cameraSettings: "Camera Settings",
    imageBrightness: "Image Brightness",
    cameraContrast: "Contrast",
    cameraSaturation: "Saturation",
    cameraEffect: "Effect",
    cameraMirror: "Mirror",
    cameraFlip: "Flip",

    cameraEffectNormal: "Normal",
    cameraEffectNegative: "Negative",
    cameraEffectGrayscale: "Grayscale",
    cameraEffectRedTint: "Red Tint",
    cameraEffectGreenTint: "Green Tint",
    cameraEffectBlueTint: "Blue Tint",
    cameraEffectSepia: "Sepia",
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
    ` Términos y Condiciones de Hidden Rolls

    Fecha de entrada en vigor: 18 de septiembre de 2026  
    Última actualización: 18 de septiembre de 2026

    Estos Términos y Condiciones (“Términos”) rigen su uso de la aplicación móvil Hidden Rolls, el firmware asociado de los dispositivos Hidden Rolls y el software relacionado proporcionado por D&T Manufacturing LLC (“D&T”, “nosotros”, “nos” o “nuestro”).

    Al descargar, instalar, acceder o utilizar la aplicación Hidden Rolls o el software asociado, usted acepta estos Términos.

    Si no acepta estos Términos, no utilice la aplicación Hidden Rolls ni el software asociado.

    1. Hidden Rolls

    Hidden Rolls está diseñado para funcionar con hardware compatible de Hidden Rolls destinado a juegos de mesa.

    La aplicación proporciona funciones que incluyen configuración del hardware, aprovisionamiento mediante Bluetooth, detección de dispositivos en la red local, visualización local de video en vivo, controles de iluminación, controles de configuración y otras funciones relacionadas con productos Hidden Rolls compatibles.

    Las funciones pueden cambiar a medida que la aplicación y el hardware Hidden Rolls continúen desarrollándose.

    2. Requisitos de hardware y red

    Determinadas funciones de Hidden Rolls requieren hardware Hidden Rolls compatible, un dispositivo móvil compatible, funcionalidad Bluetooth y acceso a una red Wi-Fi local compatible.

    Usted es responsable de mantener el dispositivo móvil, el equipo de red, la configuración de Internet o de la red local, la alimentación eléctrica, los permisos y cualquier otro equipo necesario para utilizar Hidden Rolls.

    D&T no puede garantizar la compatibilidad con todos los dispositivos móviles, versiones de sistemas operativos, routers, configuraciones de firewall, entornos de red o dispositivos de terceros.

    Las condiciones de la red local, las interferencias inalámbricas, las restricciones del sistema operativo, la configuración del hardware u otros factores fuera del control de D&T pueden afectar la calidad de la conexión o el funcionamiento de la aplicación.

    3. Transmisión de la cámara interna

    El hardware compatible de Hidden Rolls incluye una cámara interna utilizada para proporcionar una vista en vivo del área oculta para los dados durante el juego de mesa.

    La cámara y la transmisión en vivo están destinadas exclusivamente al uso con las funciones de juego de Hidden Rolls. La calidad y disponibilidad de la transmisión pueden variar según las condiciones de la red local, la compatibilidad del dispositivo, las interferencias inalámbricas y las condiciones del hardware.

    4. Uso responsable

    Usted acepta utilizar Hidden Rolls de manera legal y responsable.

    No puede utilizar la aplicación, el firmware, la cámara o el hardware Hidden Rolls para violar intencionalmente los derechos de privacidad de otra persona, grabar o supervisar ilegalmente a otra persona, obtener acceso no autorizado a un dispositivo o red, interferir con otro sistema o participar en conductas prohibidas por la legislación aplicable.

    Usted es responsable de determinar si cualquier uso que haga de funciones de cámara o grabación cumple con las leyes y normas aplicables en el lugar donde utilice el producto.

    Hidden Rolls está destinado a juegos de mesa y actividades de entretenimiento relacionadas.

    5. Funcionamiento sin cuenta

    La versión actual de Hidden Rolls no requiere una cuenta de usuario de D&T para sus funciones principales.

    Determinadas funciones futuras pueden requerir acuerdos adicionales, registro de una cuenta, servicios en línea, compras o permisos.

    Si se introducen dichas funciones, pueden aplicarse términos adicionales.

    6. Privacidad

    Su uso de Hidden Rolls también está sujeto a la Política de Privacidad de Hidden Rolls.

    La Política de Privacidad explica cómo la aplicación procesa información relacionada con el dispositivo, la red, la cámara, el aprovisionamiento y otra información asociada con su funcionamiento.

    7. Licencia de software

    Sujeto a estos Términos, D&T le concede una licencia limitada, personal, no exclusiva, intransferible, no sublicenciable y revocable para instalar y utilizar la aplicación Hidden Rolls y el firmware asociado únicamente para uso personal o interno legítimo con productos Hidden Rolls compatibles.

    La aplicación y el firmware se otorgan bajo licencia y no se venden.

    Esta licencia no le transfiere la propiedad del software, firmware, propiedad intelectual, obras de arte, elementos de marca, diseños de productos ni otros materiales de D&T.

    8. Restricciones

    Excepto cuando la legislación aplicable permita expresamente lo contrario, usted no puede copiar, redistribuir, vender, sublicenciar, alquilar, arrendar, explotar comercialmente, modificar, eludir medidas de seguridad ni crear versiones derivadas no autorizadas de la aplicación o del firmware de Hidden Rolls.

    No puede utilizar el software o firmware de Hidden Rolls para interferir con los servicios de D&T, comprometer hardware compatible, obtener acceso no autorizado a otro dispositivo o red, ni distribuir software malicioso.

    Nada de lo dispuesto en estos Términos impide actividades que la legislación aplicable le otorgue expresamente el derecho de realizar.

    9. Propiedad intelectual

    Hidden Rolls, D&T Manufacturing LLC, los nombres y logotipos asociados, las interfaces de la aplicación, el firmware, el software, las obras de arte originales, el arte de los productos, los diseños escultóricos, los conceptos de productos, los gráficos, los materiales escritos, las aventuras, el material ficticio y otros contenidos originales pueden estar protegidos por leyes de derechos de autor, marcas comerciales, imagen comercial, patentes, secretos comerciales u otras leyes de propiedad intelectual.

    Salvo por la licencia limitada de software concedida en estos Términos, no se le transfiere ningún derecho sobre la propiedad intelectual de D&T.

    Los nombres, marcas comerciales, sistemas de juego, obras de arte u otros materiales pertenecientes a terceros siguen siendo propiedad de sus respectivos titulares.

    10. Objetos proporcionados por el usuario

    La cámara de Hidden Rolls está diseñada para visualizar el área cerrada destinada a los dados dentro del producto.

    Los objetos colocados o lanzados dentro de dicha área, incluidos dados u otras piezas de juegos de mesa, pueden aparecer en la transmisión local de la cámara.

    D&T no reclama la propiedad de ningún objeto o material que aparezca en la transmisión de la cámara de Hidden Rolls.

    11. Actualizaciones y firmware

    D&T puede proporcionar actualizaciones de la aplicación o del firmware para mejorar la compatibilidad, seguridad, estabilidad, funcionalidad o experiencia del usuario.

    Las actualizaciones pueden modificar o eliminar funciones existentes o introducir nuevas funciones.

    Determinadas actualizaciones pueden resultar necesarias para mantener la compatibilidad con sistemas operativos, dispositivos móviles, tiendas de aplicaciones o hardware Hidden Rolls.

    D&T no garantiza que todas las versiones anteriores de la aplicación o del firmware sigan siendo compatibles indefinidamente.

    12. Funciones beta y en desarrollo

    Determinadas funciones de Hidden Rolls pueden identificarse como beta, experimentales, preliminares, en desarrollo o de prelanzamiento.

    Estas funciones pueden contener errores, cambiar sustancialmente, funcionar de forma inconsistente o ser eliminadas.

    No debe depender de funciones beta o en desarrollo para ningún propósito crítico.

    13. Plataformas y servicios de terceros

    Hidden Rolls puede depender de o interactuar con sistemas operativos de terceros, fabricantes de dispositivos móviles, tiendas de aplicaciones, routers, equipos de red, implementaciones de Bluetooth u otras tecnologías que D&T no controla.

    El uso que usted haga de esos productos y servicios de terceros puede estar sujeto a términos independientes.

    D&T no es responsable de los cambios realizados por terceros que afecten al funcionamiento de Hidden Rolls, incluidos cambios en sistemas operativos, permisos, restricciones de red o requisitos de las tiendas de aplicaciones.

    14. Disponibilidad

    Podemos modificar, suspender, descontinuar, restringir o sustituir parte o la totalidad de la aplicación Hidden Rolls o del software asociado en cualquier momento.

    No garantizamos un funcionamiento ininterrumpido ni libre de errores.

    Pueden producirse interrupciones temporales debido a errores de software, actualizaciones, condiciones del dispositivo, condiciones de la red, mantenimiento, limitaciones del hardware u otros factores fuera de nuestro control.

    15. Exclusión de garantías

    En la máxima medida permitida por la legislación aplicable, la aplicación Hidden Rolls, el firmware y el software relacionado se proporcionan “tal cual” y “según disponibilidad”.

    D&T no garantiza que la aplicación o el firmware funcionen de manera ininterrumpida, estén libres de errores, sean completamente seguros, sean compatibles con todos los dispositivos o redes, ni estén libres de defectos.

    Nada de lo dispuesto en estos Términos limita ninguna garantía ni derecho del consumidor que legalmente no pueda excluirse o limitarse.

    Cualquier garantía aplicable a productos físicos de Hidden Rolls puede proporcionarse por separado de estos Términos.

    16. Limitación de responsabilidad

    En la máxima medida permitida por la legislación aplicable, D&T Manufacturing LLC y sus propietarios, directivos, empleados, contratistas y afiliados no serán responsables de daños indirectos, incidentales, especiales, consecuentes, ejemplares o punitivos que surjan de o estén relacionados con su uso de, o imposibilidad de utilizar, la aplicación o el firmware de Hidden Rolls.

    Esto incluye, cuando la ley lo permita, pérdida de datos, pérdida de uso, pérdida de beneficios, interrupción del juego, problemas de red, incompatibilidad de dispositivos o daños derivados del uso no autorizado o inadecuado del software.

    En la medida en que la responsabilidad no pueda excluirse legalmente, la responsabilidad de D&T se limitará al máximo permitido por la legislación aplicable.

    Nada de lo dispuesto en estos Términos excluye responsabilidades que la legislación aplicable no permita excluir.

    17. Su responsabilidad respecto de la seguridad de la red

    Usted es responsable de proteger su red Wi-Fi, router, dispositivo móvil, contraseñas y hardware Hidden Rolls.

    Debe utilizar prácticas razonables de seguridad de red y no debe exponer intencionalmente las interfaces locales de los dispositivos Hidden Rolls directamente a Internet público, a menos que D&T proporcione expresamente una función diseñada para ese propósito.

    D&T no es responsable del acceso no autorizado causado por configuraciones de red inseguras, credenciales compartidas, firmware modificado, modificaciones no compatibles o la exposición deliberada de servicios locales del dispositivo a redes externas.

    18. Modificaciones y uso no compatible

    El hardware y software de Hidden Rolls pueden ser modificables por usuarios con experiencia técnica.

    D&T no es responsable de problemas causados por firmware no autorizado, modificaciones del hardware, modificaciones eléctricas, software alterado, componentes de terceros no compatibles o el uso de Hidden Rolls fuera de sus condiciones de funcionamiento previstas.

    La modificación de un producto también puede afectar cualquier garantía independiente aplicable al producto físico.

    19. Suspensión o terminación

    Puede dejar de utilizar Hidden Rolls en cualquier momento.

    D&T puede restringir o terminar su autorización para utilizar el software proporcionado por D&T si usted incumple de manera sustancial estos Términos o utiliza el software para fines ilegales.

    Las secciones de estos Términos que, por su naturaleza, deban continuar después de la terminación, incluidas las disposiciones sobre propiedad intelectual, exclusiones de garantías, limitaciones de responsabilidad y legislación aplicable, seguirán vigentes.

    20. Cambios en estos Términos

    Podemos actualizar estos Términos a medida que evolucionen los productos y servicios de Hidden Rolls.

    Cuando realicemos cambios, actualizaremos la fecha de “Última actualización” indicada anteriormente.

    Si un cambio afecta de manera sustancial sus derechos u obligaciones, podemos proporcionar un aviso adicional dentro de la aplicación o mediante otro método apropiado.

    Su uso continuado de Hidden Rolls después de que los Términos actualizados entren en vigor constituye la aceptación de dichos Términos actualizados en la medida permitida por la legislación aplicable.

    21. Legislación aplicable

    Estos Términos se rigen por las leyes del Estado de Colorado, sin tener en cuenta los principios sobre conflictos de leyes.

    Salvo cuando la legislación de protección al consumidor aplicable disponga lo contrario, cualquier disputa derivada de estos Términos o de su uso de la aplicación o firmware de Hidden Rolls estará sujeta a la jurisdicción de los tribunales estatales o federales ubicados en, o que presten servicio al, Condado de Denver, Colorado.

    Estos Términos no limitan ningún derecho que pueda tener conforme a leyes obligatorias de protección al consumidor que le sean aplicables.

    22. Divisibilidad

    Si alguna disposición de estos Términos se considera inaplicable, dicha disposición se aplicará en la máxima medida permitida por la ley y las disposiciones restantes continuarán vigentes.

    23. Acuerdo completo

    Estos Términos, junto con la Política de Privacidad de Hidden Rolls y cualquier término adicional presentado expresamente para una función o servicio específico de Hidden Rolls, constituyen el acuerdo entre usted y D&T respecto del uso de la aplicación y el firmware de Hidden Rolls.

    Términos independientes pueden regir la compra, devolución, garantía o uso físico de los productos Hidden Rolls.

    24. Contacto

    Las preguntas relacionadas con estos Términos pueden enviarse a:

    **D&T Manufacturing LLC**  
    1500 N Grant St Ste N  
    Denver, CO 80203  
    Estados Unidos

    Correo electrónico: dntmfc@gmail.com`,

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

    //Settings
    settings: "Ajustes",
    language: "Idioma",
    appSettings: "Aplicación",
    languageDescription: "Elige el idioma utilizado en Hidden Rolls.",
    about: "Acerca de",
    termsOfUse: "Términos de Uso",
    privacyPolicy: "Política de Privacidad",
    support: "Soporte",
    privacyPolicyText:
    `Política de Privacidad de Hidden Rolls

    Fecha de entrada en vigor: 18 de septiembre de 2026
    Última actualización: 18 de septiembre de 2026

    D&T Manufacturing LLC (“D&T”, “nosotros”, “nos” o “nuestro”) opera la aplicación móvil Hidden Rolls y desarrolla el firmware utilizado con los productos Hidden Rolls.

    Esta Política de Privacidad explica cómo se maneja la información cuando utiliza la aplicación móvil Hidden Rolls y el hardware compatible de Hidden Rolls.

    Hidden Rolls está diseñado para funcionar mediante comunicación local entre su dispositivo móvil y su hardware Hidden Rolls. Hemos diseñado intencionalmente la aplicación para minimizar la información que se transmite a D&T o que D&T recopila.

    1. Información que no recopilamos

    Actualmente, la aplicación Hidden Rolls no requiere cuentas de usuario y no recopila ni transmite información personal a D&T con fines de publicidad, análisis, elaboración de perfiles o marketing.

    Actualmente, la aplicación no utiliza redes publicitarias de terceros, herramientas de seguimiento del comportamiento, plataformas de análisis ni servicios de informes de fallos que transmitan la actividad del usuario a D&T.

    No vendemos información personal.

    No utilizamos la actividad de la aplicación Hidden Rolls para publicidad dirigida.

    2. Información local del dispositivo y de la red

    Para conectarse al hardware Hidden Rolls y utilizarlo, la aplicación puede procesar determinada información localmente en su dispositivo móvil.

    Esto puede incluir información como:

    información de la red Wi-Fi utilizada durante la configuración del dispositivo;

    información de Bluetooth o de dispositivos cercanos;

    un identificador del dispositivo Hidden Rolls, el nombre del dispositivo o un nombre de host local;

    direcciones de red local utilizadas para localizar y comunicarse con el hardware Hidden Rolls;

    preferencias de la aplicación, como el idioma o la configuración de la interfaz;

    configuraciones de iluminación u otras preferencias de control del dispositivo; e

    información que indique si la configuración o el aprovisionamiento del dispositivo se han completado.

    Esta información se utiliza para proporcionar las funciones principales de la aplicación.

    A menos que se indique expresamente lo contrario en una versión futura de esta Política de Privacidad, esta información se procesa localmente y no se transmite a D&T.

    3. Configuración de Wi-Fi

    El hardware Hidden Rolls puede utilizar Bluetooth Low Energy, o BLE, durante la configuración inicial para que la aplicación pueda configurar el hardware y conectarlo a su red Wi-Fi.

    Durante este proceso, la aplicación puede procesar temporalmente el nombre de la red Wi-Fi seleccionada y sus credenciales de Wi-Fi.

    Estas credenciales se transmiten directamente desde su dispositivo móvil al hardware Hidden Rolls como parte del proceso de configuración. D&T no recibe ni almacena su contraseña de Wi-Fi en sus servidores.

    El hardware Hidden Rolls puede almacenar localmente las credenciales de Wi-Fi para poder volver a conectarse a su red después de apagarse o reiniciarse.

    4. Código QR y acceso a la cámara

    La aplicación Hidden Rolls puede solicitar acceso a la cámara de su dispositivo móvil cuando sea necesario para escanear un código QR de configuración o identificación de un dispositivo Hidden Rolls.

    El acceso a la cámara se utiliza para esta función de configuración.

    Las imágenes que visualiza el escáner de códigos QR se procesan en su dispositivo con el propósito de identificar el código QR y no están destinadas a ser almacenadas por la aplicación Hidden Rolls ni transmitidas a D&T.

    Puede denegar el permiso de acceso a la cámara o revocarlo posteriormente a través de la configuración de su dispositivo, aunque hacerlo puede impedir el funcionamiento de las funciones de configuración mediante código QR.

    5. Bluetooth, dispositivos cercanos y acceso a la red local

    La aplicación puede solicitar permisos relacionados con Bluetooth, Dispositivos cercanos, la red local u otros permisos del sistema, según el sistema operativo y la versión de su dispositivo móvil.

    Estos permisos permiten que la aplicación detecte, configure, se conecte y se comunique con el hardware Hidden Rolls.

    Los sistemas operativos pueden describir estos permisos de manera diferente o asociar determinadas tecnologías de detección de dispositivos con permisos adicionales del sistema.

    Hidden Rolls utiliza estos permisos únicamente cuando son necesarios para proporcionar funciones de configuración y comunicación con el dispositivo.

    6. Cámara y transmisión de video de Hidden Rolls

    El hardware compatible de Hidden Rolls contiene una cámara que proporciona una vista en vivo del área designada para los dados.

    La transmisión de video se realiza localmente entre su hardware Hidden Rolls y su dispositivo móvil a través de su red local.

    D&T no recibe, supervisa, graba, almacena ni carga la transmisión de video de Hidden Rolls en los servidores de D&T.

    La aplicación Hidden Rolls no está diseñada para proporcionar almacenamiento de video en la nube ni vigilancia remota.

    A menos que una función futura indique expresamente lo contrario, el video visualizado mediante la aplicación Hidden Rolls permanece dentro de la conexión local entre el hardware Hidden Rolls y el dispositivo del usuario.

    Su dispositivo móvil o sistema operativo puede proporcionar de manera independiente funciones como capturas de pantalla o grabación de pantalla. Estas funciones son controladas por usted y por el sistema operativo de su dispositivo, no por D&T.

    7. Información almacenada en su dispositivo

    La aplicación Hidden Rolls puede almacenar localmente en su dispositivo móvil preferencias de la aplicación e información de configuración del dispositivo.

    Esto puede incluir configuraciones necesarias para facilitar el uso de la aplicación o volver a conectarse a hardware Hidden Rolls previamente configurado.

    La información de la aplicación almacenada localmente generalmente permanece en su dispositivo hasta que se elimina mediante la configuración de la aplicación, los controles del sistema operativo, la eliminación de los datos de la aplicación o la desinstalación de la aplicación.

    Determinada información de configuración de red también puede permanecer almacenada en el hardware Hidden Rolls hasta que el hardware se restablezca, vuelva a configurarse o se borre de otra manera.

    Debido a que esta información se almacena localmente, D&T generalmente no puede acceder a ella, modificarla ni eliminarla de forma remota por usted.

    8. Plataformas de terceros

    Puede obtener la aplicación Hidden Rolls a través de una tienda de aplicaciones de terceros, como Google Play o Apple App Store.

    Estas plataformas pueden recopilar de manera independiente información relacionada con descargas de aplicaciones, compras, información del dispositivo, diagnósticos o actividad de la cuenta de acuerdo con sus propias políticas de privacidad y configuraciones.

    La información recopilada de manera independiente por una tienda de aplicaciones o por el proveedor de un sistema operativo es controlada por dicho proveedor y no se rige por esta Política de Privacidad, a menos que D&T reciba dicha información por separado.

    9. Seguridad de la red

    Hidden Rolls está diseñado para comunicarse con hardware compatible a través de una red local de confianza.

    Algunas comunicaciones locales utilizadas por dispositivos integrados pueden no proporcionar los mismos niveles de cifrado o protección de seguridad que los servicios basados en Internet.

    Usted es responsable de mantener una seguridad razonable para su red local, sus credenciales de Wi-Fi, su dispositivo móvil y su hardware Hidden Rolls.

    No debe exponer intencionalmente las interfaces locales de los dispositivos Hidden Rolls directamente a Internet público, a menos que una función proporcionada por D&T esté expresamente diseñada para permitirlo.

    10. Divulgación de información

    Debido a que actualmente la aplicación Hidden Rolls no transmite datos de uso de la aplicación a D&T como parte de su funcionamiento normal, por lo general no poseemos datos de la aplicación que podamos divulgar a terceros.

    Si D&T recibe información directamente de usted, por ejemplo, cuando se comunica con nosotros para obtener asistencia al cliente, podemos utilizar esa información para responder a su solicitud, solucionar un problema, mantener registros comerciales apropiados o cumplir con la legislación aplicable.

    Podemos divulgar información cuando sea razonablemente necesario para cumplir con la legislación aplicable, un proceso legal o una solicitud gubernamental válida, o cuando sea necesario para proteger los derechos, la propiedad o la seguridad de D&T, nuestros usuarios u otras personas.

    11. Sus opciones

    Puede controlar los permisos de la aplicación mediante la configuración del sistema operativo de su dispositivo móvil.

    Puede impedir que la aplicación acceda a Bluetooth, dispositivos cercanos, la cámara o las funciones de red local desactivando el permiso correspondiente. Desactivar un permiso necesario para una función puede impedir que dicha función opere correctamente.

    Puede eliminar la información de la aplicación almacenada localmente mediante los controles disponibles del sistema operativo, eliminando los datos de la aplicación o desinstalando la aplicación.

    También puede restablecer o volver a configurar su hardware Hidden Rolls mediante los procedimientos disponibles para el dispositivo.

    12. Público general

    Hidden Rolls está destinado a un público general.

    La aplicación no está diseñada en torno a la recopilación de información personal y no requiere una cuenta de usuario de Hidden Rolls para utilizar sus funciones principales actuales.

    13. Cambios en esta Política de Privacidad

    Podemos actualizar esta Política de Privacidad a medida que Hidden Rolls evolucione, incluso cuando se introduzcan nuevas funciones de la aplicación, capacidades de hardware, servicios de terceros o prácticas relacionadas con los datos.

    Cuando realicemos cambios, actualizaremos la fecha de “Última actualización” indicada anteriormente.

    Si un cambio futuro modifica de manera sustancial la forma en que se recopila, utiliza o comparte la información, podemos proporcionar un aviso adicional dentro de la aplicación o mediante otro método apropiado.

    14. Contáctenos

    Si tiene preguntas sobre esta Política de Privacidad o sobre las prácticas de privacidad de Hidden Rolls, puede comunicarse con:

    D&T Manufacturing LLC 
    1500 N Grant St Ste N  
    Denver, CO 80203  
    Estados Unidos

    Correo electrónico: dntmfc@gmail.com`,
    supportText:
    "¿Necesitas ayuda con Hidden Rolls?\n\nContacta a D&T Manufacturing en dntmfc@gmail.com o visita hidden-rolls.com.",

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
    cameraSettings: "Ajustes de Cámara",
    imageBrightness: "Brillo de Imagen",
    cameraContrast: "Contraste",
    cameraSaturation: "Saturación",
    cameraEffect: "Efecto",
    cameraMirror: "Espejo",
    cameraFlip: "Voltear",

    cameraEffectNormal: "Normal",
    cameraEffectNegative: "Negativo",
    cameraEffectGrayscale: "Escala de Grises",
    cameraEffectRedTint: "Tinte Rojo",
    cameraEffectGreenTint: "Tinte Verde",
    cameraEffectBlueTint: "Tinte Azul",
    cameraEffectSepia: "Sepia",
  },
};