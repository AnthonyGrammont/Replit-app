# Health Dashboard Application

## Overview

This is a full-stack health dashboard application built with React, Express, and TypeScript. The application provides a comprehensive health monitoring interface with metrics visualization, medication tracking, and user profile management. It follows a modern architecture with a clear separation between client and server code, shared type definitions, and a component-based UI design.

**Project Status**: Successfully migrated from Lovable to Replit (July 28, 2025)
**UI Design**: Updated to match original Lovable dark theme design with comprehensive health dashboard

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for build tooling
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: Hot reloading with Vite middleware integration
- **Build System**: ESBuild for production bundling

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (via Neon serverless)
- **Migrations**: Drizzle Kit for schema management
- **Session Storage**: PostgreSQL session store with connect-pg-simple

## Key Components

### Core UI Components
- **MobileHealthDashboard**: Main dashboard with dark theme matching original Lovable design
  - Purple-blue gradient header with personalized greeting and health score
  - User profile card with medications list and management
  - Health metrics grid (Sleep Quality, Hydration, Blood Pressure, Steps, Stress)
  - Interactive heart rate and daily activity charts
  - Health suggestions panel
- **MobileNavigation**: Bottom navigation bar with dark theme styling
- **Health Feature Pages**: Food tracking, HRV monitoring, appointments, medical vault, AI assistant
- **Profile Management**: Comprehensive health profile with medical information

### Backend Services
- **Storage Interface**: Abstracted storage layer with in-memory implementation
- **Route Registration**: Centralized API route management
- **Vite Integration**: Development server with hot module replacement

### Shared Resources
- **Schema Definitions**: Drizzle schema with Zod validation
- **Type Safety**: Shared TypeScript types between client and server

## Data Flow

1. **Client Requests**: React components use TanStack Query for data fetching
2. **API Layer**: Express.js handles HTTP requests with JSON middleware
3. **Storage Layer**: Abstract storage interface allows for flexible data persistence
4. **Type Safety**: Shared schema ensures consistent data structure across the stack
5. **Real-time Updates**: React Query provides automatic cache invalidation and refetching

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible component primitives for complex UI patterns
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Chart library for data visualization

### Data Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with performance optimization
- **Zod**: Runtime type validation and schema definition
- **Date-fns**: Date manipulation utilities

### Development Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Static type checking
- **ESLint/Prettier**: Code quality and formatting (implicit)

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Integrated with Express for seamless full-stack development
- **Hot Module Replacement**: Instant updates during development
- **TypeScript Compilation**: Real-time type checking

### Production Build
- **Client Build**: Vite builds React app to `dist/public`
- **Server Build**: ESBuild bundles Express server for Node.js
- **Static Assets**: Client serves pre-built static files
- **Database**: PostgreSQL with connection pooling via Neon

### Environment Configuration
- **Database URL**: Required environment variable for PostgreSQL connection
- **Session Management**: PostgreSQL-backed session storage
- **Asset Serving**: Express serves static files in production mode

The application is designed to be deployed on platforms that support Node.js with PostgreSQL, such as Railway, Vercel, or traditional VPS hosting. The build process creates optimized bundles for both client and server code, ensuring efficient deployment and runtime performance.

## Recent Changes (July 28, 2025)

- **UI Design Update**: Implemented dark theme design matching original Lovable interface
  - Dark gray (gray-900) background with gray-800 component cards
  - Purple-blue gradient header section with health metrics
  - User profile card with medication tracking and management
  - Health metrics grid with color-coded indicators and progress bars
  - Interactive charts for heart rate and daily activity monitoring
  - Updated navigation with dark theme styling
- **Database Integration**: Fixed UUID format issues for proper database connectivity
- **Component Architecture**: Created comprehensive mobile-first health dashboard with multiple feature pages