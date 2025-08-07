# Three.js Cube Configurator Demo

This is a demo project built with **Three.js** and **Vite**, showcasing an interactive 3D cube configurator. Each cube represents a module that users can customize independently. When a cube exceeds the default width, a new module is automatically added next to it.

## Features

- Interactive 3D cube rendered with Three.js
- Independent configuration for each cube (width, height, depth)
- Automatic module addition when width exceeds 60 cm

## Live Demo

https://cube-demo-five.vercel.app

### Installation

```bash
git clone https://github.com/xxaralin/cube_demo.git
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

## How It Works

- Each cube represents a **module**.
- Default width of a module is **60 cm**.
- When the width of a module is increased beyond 60 cm, a new module is added to the right.
- Clicking on a module allows you to configure the dimentions independently.
- Uses OrbitControls for camera movement and user interaction.

