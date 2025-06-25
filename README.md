# LensPro Rentals

A professional camera equipment rental platform built with React, TypeScript, Vite, and Supabase.

## 🚀 Features

- **Equipment Catalog**: Browse professional cameras, lenses, and accessories
- **Flexible Rental Periods**: 12-hour and 24-hour rental options
- **User Management**: Customer, staff, and admin roles
- **Order Management**: Complete rental order workflow
- **Suggestions System**: Users can suggest new equipment
- **Responsive Design**: Works on all devices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## 🔧 Setup Instructions

### 1. Clone the Repository

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
3. Copy and run the migration file: `supabase/migrations/20250624010000_complete_schema_fix.sql`

This will create:
- `users` table with role-based access
- `equipments` table with sample data
- `orders` table for rental management
- `suggestions` table for user feedback
- Row Level Security (RLS) policies
- Sample equipment data

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🗄️ Database Schema

### Tables

- **users**: User profiles with roles (admin, staff, customer)
- **equipments**: Camera equipment catalog
- **orders**: Rental orders and bookings
- **suggestions**: User equipment suggestions

### Default Roles

- **Customer**: Can browse equipment and place orders
- **Staff**: Can manage orders and view suggestions
- **Admin**: Full access to all features and user management

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

### Environment Variables for Production

Make sure to set these in your deployment platform:

```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

## 🔐 Authentication

- All users register as **customers** by default
- Admin can promote users to **staff** or **admin** roles via database
- Email/password authentication with Supabase Auth
- Row Level Security ensures data access control

## 📱 Features by Role

### Customer
- Browse equipment catalog
- Add items to cart
- View rental history
- Submit equipment suggestions

### Staff
- All customer features
- Manage orders (confirm, complete)
- View all suggestions
- Access staff dashboard

### Admin
- All staff features
- Manage equipment inventory
- Manage users and roles
- Full system administration

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Project Structure

```
src/
├── components/      # Reusable UI components
├── contexts/        # React contexts (Auth, Cart)
├── lib/            # Utilities and Supabase client
├── pages/          # Page components
└── types/          # TypeScript type definitions
```

## 🐛 Troubleshooting

### White Screen Issues
- Check browser console for errors
- Verify environment variables are set
- Ensure Supabase connection is working

### Database Connection Issues
- Verify Supabase URL and key are correct
- Check if migration was run successfully
- Ensure RLS policies are properly configured

### Build Issues
- Run `npm run type-check` to check for TypeScript errors
- Clear node_modules and reinstall dependencies
- Check for missing dependencies

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Supabase documentation
3. Create an issue in the repository