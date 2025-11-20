# Soliloquy

**Soliloquy** is a private, on-device AI companion application.

It is designed for those who value data sovereignty and offline capability. By leveraging the power of your device's GPU, Soliloquy runs Large Language Models (LLMs) locally, ensuring your conversations never leave your phone.

> _Soliloquy: An act of speaking one's thoughts aloud when by oneself._

## 📱 Features

-   **On-Device Intelligence**: Runs LLMs (GGUF format) locally using `llama.rn`.
-   **Private by Design**: No data is sent to the cloud. Your thoughts stay yours.
-   **Hardware Accelerated**: Utilizes Metal (iOS) and OpenCL/Vulkan (Android) via `llama.cpp`.
-   **Modern UI**: Built with **React Native Paper** (Material Design 3) with a custom Dark Theme.
-   **Developer Aesthetic**: Typography powered by **JetBrains Mono** for a clean, technical feel.

## 🛠 Tech Stack

-   **Framework**: [React Native](https://reactnative.dev/) (via [Expo](https://expo.dev/))
-   **Language**: TypeScript
-   **UI System**: [React Native Paper](https://callstack.github.io/react-native-paper/)
-   **Typography**: JetBrains Mono (Native font integration)
-   **AI Engine**: [llama.rn](https://github.com/rn-llama/rn-llama) (Bindings for `llama.cpp`)

## 📸 Screenshots

<!-- Add screenshots of your dark mode UI here later -->

|   Home Screen   | Chat Interface  |
| :-------------: | :-------------: |
| _(Coming Soon)_ | _(Coming Soon)_ |

## 🚀 Getting Started

This project uses **Expo Prebuild**. Because it relies on native code for fonts and AI acceleration, it cannot be run inside the standard "Expo Go" client. You must build a development client.

### Prerequisites

-   Node.js
-   Android Studio (for Android Emulator/Device)
-   Xcode (for iOS Simulator/Device - macOS only)

### Installation

1. **Clone the repository**
    ```bash
    git clone https://github.com/YOUR_USERNAME/Soliloquy.git
    cd Soliloquy
    ```
