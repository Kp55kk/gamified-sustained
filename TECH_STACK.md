# Gamified Sustained - Tech Stack

This document outlines the technologies, libraries, and frameworks used to build the "Gamified Sustained" project.

## Core Framework
*   **React (v19):** The core library used for building the user interface.
*   **React Router DOM (v7):** Used for managing navigation and routing between different game levels and hub screens.

## 3D Graphics & Environments
*   **Three.js:** The underlying 3D graphics library powered by WebGL.
*   **React Three Fiber (@react-three/fiber):** A React renderer for Three.js, allowing 3D scenes to be built using React components (used for the interactive 3D house, appliances, and environments).
*   **React Three Drei (@react-three/drei):** A growing ecosystem of useful helpers and abstractions for React Three Fiber (used for camera controls, text rendering, HTML overlays in 3D space, etc.).

## Animations
*   **Framer Motion:** A production-ready motion library for React, used for UI animations, transitions, and the sliding "Learn Before Play" concept cards.

## Voice Over & Audio
*   **Web Speech API (window.speechSynthesis):** A native browser API used for the localized voice-over narration and interactive appliance personalities. It does not require any external dependencies and supports dynamic adjustments to pitch, speaking rate, and language.

## Styling
*   **Tailwind CSS (v4):** A utility-first CSS framework used for rapid UI development and styling.
*   **Vanilla CSS:** Custom `.css` files are also heavily utilized for component-specific styles, complex customized animations, and specialized game UI layouts.
*   **PostCSS & Autoprefixer:** Tools for transforming CSS with JavaScript plugins.

## Build Tools & Development
*   **Vite (v8):** A next-generation frontend tooling that provides a blazing fast development server and optimized production builds.
*   **ESLint:** Pluggable JavaScript linter to enforce code quality and standards.
*   **Node.js / npm:** The JavaScript runtime and package manager used for dependency management and running build scripts.

## Deployment
*   **gh-pages:** Used for deploying the static built application to GitHub Pages.
