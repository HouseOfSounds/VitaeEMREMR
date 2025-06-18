# MedCore EMR - Electronic Medical Records Platform

## Overview

MedCore EMR is a modern Electronic Medical Records platform designed for small hospitals and clinics. It provides comprehensive patient management, appointment scheduling, clinical note management, and healthcare workflow automation. The application features a clean, medical-focused UI built with React and shadcn/ui components, backed by a robust Express.js server with PostgreSQL database integration.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom medical theme colors
- **State Management**: TanStack Query for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful API with JSON responses
- **Middleware**: Express session management, JSON parsing, CORS handling
- **Error Handling**: Centralized error handling with proper HTTP status codes

### Database Architecture
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema generation
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication & Authorization
- **Provider**: Replit Authentication (OIDC)
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **Security**: HTTP-only cookies, CSRF protection, secure session storage
- **Authorization**: Role-based access control (doctor, nurse, admin)

### Core Modules

#### Patient Management
- **Features**: Complete patient records, medical history, allergies, medications
- **Search**: Real-time patient search functionality
- **Status Tracking**: Active, inactive, follow-up patient states
- **Demographics**: Contact information, emergency contacts, demographics

#### Appointment Scheduling
- **Calendar Integration**: Date/time scheduling with duration management
- **Status Workflow**: Scheduled → Confirmed → In-Progress → Completed/Cancelled
- **Provider Assignment**: Doctor assignment and specialty matching
- **Notifications**: Appointment reminders and status updates

#### Clinical Documentation
- **Note Types**: Progress notes, consultation notes, discharge summaries
- **Structured Data**: Patient-doctor relationships, timestamped entries
- **Search & Filter**: Content-based search and filtering capabilities
- **Templates**: Standardized note templates for consistency

### UI Components
- **Design System**: Consistent medical-themed UI with custom color palette
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Accessibility**: ARIA compliance and keyboard navigation
- **Loading States**: Skeleton loaders and loading indicators
- **Error Handling**: User-friendly error messages and fallbacks

## Data Flow

### Request Flow
1. Client makes authenticated requests with session cookies
2. Express middleware validates sessions and user permissions
3. Route handlers process requests and interact with database via Drizzle ORM
4. Responses are formatted as JSON and returned to client
5. TanStack Query caches responses and manages loading states

### Database Operations
1. Drizzle ORM provides type-safe database queries
2. Connection pooling manages PostgreSQL connections
3. Transactions ensure data consistency for complex operations
4. Migrations handle schema evolution and updates

### State Management
1. Server state managed by TanStack Query with automatic caching
2. Local component state handled by React hooks
3. Form state managed by React Hook Form
4. Global app state minimal, focused on authentication

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives
- **react-hook-form**: Form state management
- **zod**: Runtime type validation and schema definition

### Development Tools
- **TypeScript**: Static type checking and developer experience
- **Vite**: Fast development server and build tool
- **Tailwind CSS**: Utility-first CSS framework
- **ESLint/Prettier**: Code quality and formatting

### Authentication
- **openid-client**: OIDC authentication flow
- **passport**: Authentication middleware
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with Replit environment
- **Database**: PostgreSQL 16 with automatic provisioning
- **Hot Reload**: Vite HMR for instant development feedback
- **Port Configuration**: Development server on port 5000

### Production Build
- **Client Build**: Vite builds optimized static assets
- **Server Build**: esbuild bundles server code for production
- **Asset Serving**: Express serves static files in production
- **Environment**: Production deployment via Replit autoscale

### Database Management
- **Migrations**: Drizzle Kit handles schema migrations
- **Environment Variables**: DATABASE_URL for connection string
- **Session Storage**: Dedicated sessions table for auth state

## Changelog

- June 18, 2025: Initial setup with core EMR functionality
- June 18, 2025: Major expansion - Added Prescriptions, Analytics, Staff Management, and Settings modules with complete CRUD operations and UI

## User Preferences

Preferred communication style: Simple, everyday language.