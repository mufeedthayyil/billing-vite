# LensPro Rentals - Fresh Installation

A professional camera equipment rental platform built with React, TypeScript, Vite, and Supabase.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
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

### 4. Set Up Database
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and run the migration file: `supabase/migrations/fresh_setup.sql`

### 5. Run the Application
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## ✨ Features

- **Equipment Catalog**: Browse professional cameras, lenses, and accessories
- **Flexible Rental**: 12-hour and 24-hour rental options
- **User Management**: Staff and admin roles
- **Order Management**: Complete rental workflow
- **Suggestions**: Users can suggest new equipment
- **Responsive Design**: Works on all devices

## 🔐 User Roles

- **Staff**: Can rent equipment and view orders (default for new users)
- **Admin**: Full access to manage equipment, users, and suggestions

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## 📱 Key Improvements

- **Clean Architecture**: Simplified, modular components
- **Fast Loading**: Optimized for speed and performance
- **Error Handling**: Comprehensive error handling
- **Type Safety**: Full TypeScript implementation
- **Security**: Proper RLS policies and authentication

This is a completely fresh installation designed for speed, stability, and ease of use.