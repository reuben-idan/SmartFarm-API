# SmartFarm Frontend

Modern React-based dashboard for the SmartFarm API, built with Vite, TypeScript, and Tailwind CSS.

## Prerequisites

- Node.js 16+ and npm 8+
- SmartFarm API running locally (default: http://localhost:8000)

## Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Setup**

   Create a `.env` file in the frontend directory:

   ```env
   VITE_API_URL=http://localhost:8000/api
   VITE_APP_NAME=SmartFarm
   VITE_APP_ENV=development
   ```

3. **Development**

   Start the development server:
   
   ```bash
   npm run dev
   ```

   The app will be available at http://localhost:3000

4. **Building for Production**

   To build for production:

   ```bash
   npm run build
   ```

   The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/      # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and API clients
├── pages/          # Page components
├── styles/         # Global styles and Tailwind config
└── types/          # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## API Integration

The frontend uses React Query for data fetching and caching. API clients are defined in `src/lib/api`.

## Styling

- Tailwind CSS for utility-first styling
- CSS Modules for component-scoped styles
- Class Variance Authority (cva) for type-safe component variants

## Deployment

For production deployment, build the frontend and configure your web server to serve the `dist` directory.

## License

MIT
