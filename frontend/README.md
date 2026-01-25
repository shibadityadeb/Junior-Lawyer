# AskJunior Frontend

A production-grade React frontend for the AI Legal Information Assistant.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Lucide React** for icons
- **Axios** for API calls
- **React Router** for navigation

## Features

- 🎨 Modern, responsive design
- ♿ WCAG-compliant accessibility
- 📱 Mobile-first approach
- 🔒 Secure authentication
- 🚀 Optimized performance
- 🎭 Smooth animations
- 🌐 Environment-based configuration

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your API base URL:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Navbar.tsx      # Navigation component
│   ├── HeroSection.tsx # Landing page hero
│   └── ...
├── pages/              # Page components
│   ├── LandingPage.tsx # Public landing page
│   ├── LoginPage.tsx   # Authentication
│   └── ...
├── services/           # API integration
│   └── api.ts          # Axios client & endpoints
├── lib/                # Utilities
│   └── utils.ts        # Helper functions
└── App.tsx             # Main app component
```

## API Integration

The app uses environment variables for API configuration:

- `VITE_API_BASE_URL` - Backend API base URL
- Automatically handles authentication tokens
- Includes request/response interceptors

## Design System

- **Colors**: Green primary (#22c55e) with neutral grays
- **Typography**: System font stack with proper hierarchy
- **Spacing**: Consistent 4px grid system
- **Components**: Built with shadcn/ui for consistency

## Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Fully responsive navigation and layouts
- Touch-friendly interactions

## Accessibility

- WCAG 2.1 AA compliant
- Proper semantic HTML
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios

## Performance

- Code splitting with React.lazy
- Optimized images and assets
- Minimal bundle size
- Fast loading animations

## Environment Variables

Create a `.env` file with:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=AskJunior
VITE_APP_VERSION=1.0.0
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

Private - All rights reserved