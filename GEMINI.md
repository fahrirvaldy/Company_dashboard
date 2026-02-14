# GEMINI.md

This file provides a comprehensive overview of the **Company Dashboard** project, designed to serve as a quick-start guide and instructional context for Gemini AI.

## Project Overview

This is a web application built with **React** and **Vite**. It appears to be a company dashboard with different sections for data visualization and tools.

*   **Framework**: [React](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Routing**: [React Router](https://reactrouter.com/)
*   **Charting**: [Recharts](https://recharts.org/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Linting**: [ESLint](https://eslint.org/)

The application is structured with a main layout component (`src/components/Layout.jsx`) and separate pages for different sections like `Dashboard` and `Tools`.

## Building and Running

The following scripts are available in `package.json` to build and run the application:

*   **`npm install`**: Installs all the necessary dependencies.
*   **`npm run dev`**: Starts the development server with Hot Module Replacement (HMR). The application will be available at `http://localhost:5173` by default.
*   **`npm run build`**: Bundles the application for production. The output is generated in the `dist` directory.
*   **`npm run preview`**: Starts a local server to preview the production build.
*   **`npm run lint`**: Lints the codebase using ESLint to check for code quality and style issues.

## Development Conventions

*   **Component-Based Architecture**: The project follows a component-based architecture, with reusable components in `src/components` and page-level components in `src/pages`.
*   **File Naming**: Components and pages use PascalCase (e.g., `Dashboard.jsx`, `Card.jsx`).
*   **Routing**: Routing is handled by React Router in `src/App.jsx`, with nested routes for different pages.
*   **Styling**: The project uses CSS files (`App.css`, `index.css`) for styling.
