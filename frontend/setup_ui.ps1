# Install required dependencies
Write-Host "Installing required dependencies..."
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-slot @radix-ui/react-tabs @tanstack/react-table class-variance-authority clsx lucide-react react-chartjs-2 recharts tailwind-merge tailwindcss-animate @heroicons/react react-hook-form @hookform/resolvers zod @hookform/error-message framer-motion

# Install dev dependencies
Write-Host "Installing dev dependencies..."
npm install -D @types/node @types/react @types/react-dom autoprefixer postcss tailwindcss typescript @types/react-chartjs-2

Write-Host "\nDependencies installed successfully!"
Write-Host "\nNext steps:"
Write-Host "1. Run 'npx tailwindcss init -p' to create Tailwind config"
Write-Host "2. Start the development server with 'npm run dev'"
