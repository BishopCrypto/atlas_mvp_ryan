# CLAUDE.md - Atlas Intelligence Frontend

This is the **frontend** portion of Atlas Intelligence - a Next.js application for the screening management dashboard.

## Project Structure

```
atlas_intelligence/ (Frontend - Next.js)
├── app/                 # Next.js app router
│   ├── page.tsx        # Main dashboard page
│   ├── layout.tsx      # Root layout
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── Header.tsx      # Top navigation
│   ├── Sidebar.tsx     # Container list sidebar
│   ├── ContainerDetails.tsx # Container detail view
│   ├── QuickScreenMode.tsx  # Front desk quick screening
│   ├── EmptyState.tsx       # Empty state component
│   └── ui/             # shadcn/ui components
└── lib/                # Utilities
    └── utils.ts        # Class utilities
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React

## Features

- Role-based dashboard views (Security, Front Desk, Education)
- Container management with filtering and search
- Quick screening mode for front desk operations
- Responsive design with modular components

## Server Info

- Development server runs on http://localhost:3001
- Frontend communicates with backend via API routes and external services

## Backend Integration

The backend services are located in separate directories:
- `../atlas_intelligence_api/` - Main API server
- `../atlas_intelligence_db/` - Database services
- `../atlas_intelligence_ml/` - ML/AI processing services

## Component Architecture

- **Header**: Navigation, role switching, action buttons
- **Sidebar**: Container filtering, search, list view
- **ContainerDetails**: Detailed container information and actions
- **QuickScreenMode**: Streamlined visitor screening interface
- **EmptyState**: Placeholder when no container selected