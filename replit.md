# replit.md

## Overview

This is a full-stack American Wedding Planning application built with React, TypeScript, Express, and Drizzle ORM. The application provides a comprehensive platform for managing all aspects of American weddings including events, guest lists, task management, budget tracking, and vendor management. It features a modern UI with shadcn/ui components and supports multiple user roles (bride, groom, planner, parents, family).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom wedding theme colors
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **API Design**: RESTful API with JSON responses
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### Database Schema
The application uses six main entities:
- **Users**: Authentication and role management
- **Wedding Profiles**: Wedding details with date ranges for multi-day celebrations
- **Events**: Wedding events (Rehearsal Dinner, Wedding Ceremony, Cocktail Hour, Reception, etc.)
- **Guests**: Guest information with RSVP tracking
- **Tasks**: Kanban-style task management with categories
- **Budget Items**: Vendor expense tracking with payment status
- **Vendors**: Vendor management with contract tracking

## Key Components

### Frontend Components
- **App.tsx**: Main application component with routing setup
- **Sidebar**: Navigation with role-based context switching
- **EventCard**: Display wedding events with progress tracking
- **GuestTable**: Guest management with CRUD operations
- **KanbanBoard**: Task management with drag-and-drop functionality
- **RoleSelector**: Dynamic role switching for different user perspectives

### Backend Components
- **Database Layer**: PostgreSQL database with Drizzle ORM for data persistence
- **Storage Layer**: Database storage implementation with full CRUD operations
- **Routes**: RESTful API endpoints for all CRUD operations
- **Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error handling middleware

### Shared Components
- **Schema**: Drizzle ORM table definitions and Zod validation schemas
- **Types**: TypeScript type definitions shared between frontend and backend

## Data Flow

1. **Client Request**: React components make API calls using TanStack Query
2. **API Layer**: Express routes validate requests and delegate to storage layer
3. **Storage Layer**: Database storage implementation using Drizzle ORM
4. **Database**: PostgreSQL with Neon Database for persistent data storage
5. **Response**: JSON responses with proper error handling

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React with comprehensive Radix UI component library
- **Styling**: Tailwind CSS with custom wedding theme
- **Data Fetching**: TanStack Query for efficient server state management
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Database**: Neon Database (PostgreSQL) with Drizzle ORM
- **Authentication**: Session-based with PostgreSQL storage
- **Validation**: Zod for runtime type checking
- **Development**: tsx for TypeScript execution, esbuild for production builds

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx with nodemon-like behavior
- **Database**: Configured for Neon Database with connection pooling

### Production
- **Build Process**: 
  - Frontend: Vite build to `dist/public`
  - Backend: esbuild bundle to `dist/index.js`
- **Database**: PostgreSQL with Drizzle migrations
- **Environment**: NODE_ENV-based configuration

### Key Features
- **Multi-Day Wedding Support**: Support for wedding date ranges spanning multiple days (3+ days)
- **Indian Wedding Events in America**: Manage traditional Indian wedding events taking place in American locations (Ganesh Puja, Welcome Party, Grah Shanti, Haldi, Mayra, Sangeet, Wedding, Reception)
- **US Geographic Support**: Complete US states list for wedding location planning
- **Role-Based Views**: Different perspectives for bride, groom, planner, parents, family
- **Guest Management**: Comprehensive guest tracking with RSVP status and bulk import
- **Task Management**: Kanban-style boards with categorized tasks and predefined templates
- **Budget Management**: Vendor expense tracking with payment status monitoring in USD
- **Vendor Management**: Contract tracking and vendor relationship management
- **Database Integration**: PostgreSQL with Drizzle ORM for persistent data storage
- **Export Functionality**: CSV export for guests and tasks
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Indian-American Wedding Focus**: Traditional Indian wedding ceremonies adapted for American locations with US states and venues
- **Custom Event Creation**: Users can add their own custom events beyond the traditional Indian ceremony options

## Recent Changes (December 2024)

### American Wedding Migration
- **Date Range Support**: Updated wedding profiles to support multi-day celebrations with start and end dates
- **US Geographic Data**: Replaced Indian states with complete US states list for location planning
- **Indian Wedding Events in America**: Updated event types to reflect traditional Indian wedding ceremonies in American locations:
  - Ganesh Puja: Prayer ceremony to Lord Ganesha for auspicious beginnings
  - Welcome Party: Welcome celebration for out-of-town guests
  - Grah Shanti: Ceremony to remove obstacles and bring peace
  - Haldi: Turmeric ceremony for purification and blessings
  - Mayra: Maternal uncle's blessing ceremony
  - Sangeet: Musical celebration with dance and performances
  - Wedding: Main wedding ceremony with sacred rituals
  - Reception: Grand celebration and dinner for all guests
- **Currency Updates**: All budget tracking now uses USD
- **Sample Data**: Updated seed data with American wedding example (Sarah & Michael in Napa Valley, CA)
- **Database Schema**: Modified wedding_profiles table to use wedding_start_date and wedding_end_date

### UI/UX Improvements
- **Form Simplification**: Simplified registration and onboarding forms using plain HTML inputs for better reliability
- **Date Range Display**: Updated dashboard and sidebar to show wedding date ranges
- **Indian Wedding Themes**: Updated wedding themes to reflect traditional Indian wedding styles
- **Enhanced Event Management**: Added comprehensive icon and color options for Indian wedding events
- **Custom Event Support**: Users can create custom events with personalized icons and colors

The application is designed to be scalable, with clear separation of concerns and a flexible architecture that can accommodate future features and advanced Indian-American wedding planning capabilities.