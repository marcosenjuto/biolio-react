# Biolio

A modern portfolio and bio application built with React, Vite, TypeScript, TailwindCSS, and Zustand.

## Features

- 🎨 Beautiful, responsive UI with TailwindCSS
- ⚡ Fast development with Vite
- 🔒 Type-safe with TypeScript
- 📦 Feature-based modular architecture
- 🗂️ Global state management with Zustand
- 🧭 Client-side routing with React Router
- 🎯 Clean, declarative, and maintainable code
- 🧪 **Organic Chemistry Library** with 60+ reactions
- 🔬 **Molecular Visualization** using Kekule.js
- 📊 **SMILES Notation** for chemical structures

## Project Structure

```
biolio/
├── src/
│   ├── assets/              # Static assets
│   ├── components/          # Shared UI components
│   │   └── ui/             # Reusable UI elements
│   ├── features/           # Feature-based modules
│   │   └── contact/        # Contact feature
│   │       ├── hooks/      # Feature-specific hooks
│   │       └── services/   # Feature-specific services
│   ├── hooks/              # Shared custom hooks
│   ├── pages/              # Page components
│   ├── services/           # Shared services
│   ├── store/              # Zustand stores
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   ├── App.tsx             # App wrapper
│   ├── AppRouter.tsx       # Route definitions
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Technologies

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Kekule.js** - Chemical structure visualization
- **Axios** - HTTP client for API requests
- **PubChem API** - Chemical compound data

## Architecture Principles

- **Feature-based modules**: Each feature has its own hooks and services
- **Functional components**: No class components, only functional with hooks
- **Declarative code**: Logic separated from JSX
- **Minimalist design**: Clean and maintainable codebase
- **Type safety**: TypeScript throughout the application

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Chemistry Library

The app includes a comprehensive **Organic Chemistry Library** featuring:
- 60+ curated organic reactions
- Interactive molecular visualization with Kekule.js
- SMILES notation for all compounds
- Search and filter by reaction type, tags, and more
- PubChem API integration for compound data

See [CHEMISTRY_LIBRARY.md](CHEMISTRY_LIBRARY.md) for detailed documentation.

## License

MIT
