# LensPro Rentals

A professional camera equipment rental platform built with React, TypeScript, Vite, and Supabase.

## 🚀 Features

- **Equipment Catalog**: Browse professional cameras, lenses, and accessories
- **Flexible Rental Periods**: 12-hour and 24-hour rental options
- **User Management**: Staff and admin roles with proper access control
- **Order Management**: Complete rental order workflow
- **Suggestions System**: Users can suggest new equipment
- **Responsive Design**: Works perfectly on all devices
- **Real-time Updates**: Powered by Supabase for instant data sync

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd lenspro-rentals
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** in your Supabase dashboard
3. Copy your **Project URL** and **anon/public key**

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up Database Schema

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and run the migration file: `supabase/migrations/20250101000000_initial_schema.sql`

This will create:
- All necessary tables with proper relationships
- Row Level Security (RLS) policies
- Sample equipment data
- User creation trigger

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🗄️ Database Schema

### Tables

- **users**: User profiles with roles (admin, staff)
- **equipments**: Camera equipment catalog with rates
- **orders**: Rental orders and bookings
- **suggestions**: User equipment suggestions

### User Roles

- **Staff**: Can rent equipment and view orders (default for new registrations)
- **Admin**: Full access to manage equipment, users, and all data

## 🔐 Authentication & Security

- Email/password authentication via Supabase Auth
- All new users are assigned 'staff' role by default
- Admin must manually promote users to 'admin' role in database
- Row Level Security ensures proper data access control
- No role selection in UI - security by design

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

## 📱 Features by Role

### Staff (Default)
- Browse equipment catalog with real-time availability
- Rent equipment with 12hr/24hr options
- View all rental orders
- Submit equipment suggestions

### Admin
- All staff features
- Manage equipment inventory (add, edit, delete)
- Manage user roles
- View and delete suggestions
- Full system administration

## 🎯 Key Improvements

- **Clean Architecture**: Modular components with clear separation of concerns
- **Type Safety**: Full TypeScript implementation with proper typing
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Performance**: Lazy loading, optimized queries, and efficient state management
- **Security**: Proper RLS policies and secure authentication flow
- **UX**: Toast notifications, loading states, and responsive design
- **Maintainability**: Clean code structure with reusable components

## 🐛 Troubleshooting

### Common Issues

1. **White Screen**: Check browser console for errors and verify environment variables
2. **Database Connection**: Ensure Supabase URL and key are correct
3. **Migration Issues**: Run the SQL migration in Supabase SQL Editor
4. **Build Issues**: Run `npm run build` to check for TypeScript errors

### Environment Variables

Make sure these are set correctly:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📄 License

This project is licensed under the MIT License.