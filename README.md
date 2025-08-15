# Shift Tracker

A modern web application for managing care worker shifts with location-based tracking, real-time analytics, and role-based access control.

## 🎯 Features

### For Managers
- **Location Perimeter Management**: Set geographical boundaries where staff can clock in/out
- **Real-time Staff Monitoring**: View all active shifts and staff locations
- **Analytics Dashboard**: Track average hours, daily attendance, and weekly summaries
- **Staff Management**: Overview of all care workers and their performance metrics
- **Data Visualization**: Interactive charts showing shift patterns and trends

### For Care Workers
- **Location-based Clock In/Out**: Automatic location verification within organization perimeter
- **Shift Notes**: Add optional notes when clocking in or out
- **Shift History**: View personal shift history and total hours worked
- **Real-time Status**: Current shift status and duration tracking

### Technical Features
- **Progressive Web App (PWA)**: Install on mobile devices for app-like experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Offline Support**: Service worker provides offline functionality
- **Real-time Updates**: Live data updates for managers viewing active shifts
- **Location Services**: GPS-based attendance verification

## 🛠 Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Ant Design**: Professional UI component library
- **Chart.js**: Interactive data visualizations
- **Tailwind CSS**: Utility-first styling

### Backend
- **GraphQL API**: Type-safe API with Apollo Server
- **Prisma ORM**: Database modeling and queries
- **SQLite**: Lightweight database for development

### Authentication
- **Auth0**: Secure authentication with Google and email login
- **Role-based Access Control**: Manager and Care Worker roles

### Infrastructure
- **Progressive Web App**: Manifest, service workers, and offline support
- **Geolocation API**: Browser-based location services
- **Responsive Design**: Mobile-first approach

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Auth0 account (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shift-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy `.env.local` and configure the following variables:
   ```bash
   # Auth0 Configuration
   AUTH0_SECRET='your-32-byte-secret'
   AUTH0_BASE_URL='http://localhost:3000'
   AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
   AUTH0_CLIENT_ID='your_client_id'
   AUTH0_CLIENT_SECRET='your_client_secret'

   # Database
   DATABASE_URL="file:./dev.db"
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Application Flow

### First Time Setup
1. **User Registration**: Sign up using email or Google OAuth
2. **Role Selection**: Choose between Manager or Care Worker role
3. **Organization Setup**: (Managers only) Create organization with location and perimeter
4. **Dashboard Access**: Redirected to role-appropriate dashboard

### Manager Workflow
1. **Dashboard Overview**: View key metrics and active shifts
2. **Staff Management**: Monitor all care workers and their shift data
3. **Analytics**: Review performance trends and generate reports
4. **Organization Settings**: Manage location perimeter and settings

### Care Worker Workflow
1. **Location Check**: App automatically detects current location
2. **Clock In/Out**: Button enabled only when within organization perimeter
3. **Add Notes**: Optional notes for each clock in/out action
4. **Shift Tracking**: View current shift status and history

## 🏗 Project Structure

```
shift-tracker/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Auth0 authentication
│   │   │   └── graphql/       # GraphQL API endpoint
│   │   ├── dashboard/         # Dashboard pages
│   │   │   ├── clock/         # Clock in/out page
│   │   │   └── staff/         # Staff management page
│   │   ├── setup/             # User onboarding
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable React components
│   ├── graphql/              # GraphQL schema and resolvers
│   ├── lib/                  # Utility libraries
│   └── generated/            # Generated Prisma client
├── prisma/                   # Database schema and migrations
├── public/                   # Static assets and PWA files
└── package.json              # Dependencies and scripts
```

## 🔐 Authentication & Authorization

### Auth0 Setup
1. Create Auth0 application with SPA configuration
2. Configure callback URLs for development and production
3. Enable Google social connection (optional)
4. Set up roles and permissions for Manager/Care Worker

### Role-based Access
- **Managers**: Full access to organization data, staff management, analytics
- **Care Workers**: Personal shift data, clock in/out functionality

## 📊 Database Schema

### Core Models
- **User**: Profile information, role, organization association
- **Organization**: Company/facility details, location, perimeter settings
- **Shift**: Clock in/out records, location data, notes, duration

### Key Relationships
- Users belong to Organizations
- Shifts belong to Users and Organizations
- Role-based data filtering ensures proper access control

## 🌍 Location Services

### Geofencing Implementation
- Haversine formula for distance calculations
- Real-time location verification
- Configurable perimeter radius (default: 2km)
- Graceful handling of location permission denials

### Privacy & Security
- Location data only stored during active shifts
- No continuous location tracking
- Secure transmission of location coordinates
- User consent required for location access

## 📱 Progressive Web App Features

### Installation
- Automatic PWA installation prompt
- Home screen installation on mobile devices
- App-like navigation and experience

### Offline Support
- Service worker caching strategy
- Offline functionality for core features
- Background sync when connectivity returns
- Push notification support (future enhancement)

## 🚀 Deployment

### Production Deployment
1. **Build the application**
   ```bash
   npm run build
   ```

2. **Configure production environment variables**
   - Update Auth0 URLs for production domain
   - Configure production database
   - Set secure secrets

3. **Deploy to Vercel** (recommended)
   ```bash
   npx vercel --prod
   ```

4. **Database Migration**
   ```bash
   npx prisma db push
   ```

## 📈 Features Implemented

### ✅ Completed Features
- [x] User authentication with Auth0 (Google + Email login)
- [x] Role-based access control (Manager/Care Worker)
- [x] Location-based clock in/out with perimeter checking
- [x] Manager dashboard with real-time analytics
- [x] Care worker shift interface
- [x] Data visualization with Chart.js
- [x] Responsive design with Ant Design
- [x] Progressive Web App configuration
- [x] GraphQL API with Prisma ORM
- [x] Real-time shift monitoring
- [x] Shift history and reporting
- [x] Organization management

### 🎁 Bonus Features
- [x] Progressive Web App with offline support
- [x] Service worker implementation
- [x] Installation prompt for mobile devices
- [x] Real-time location verification
- [x] Interactive data visualizations
- [x] Mobile-optimized interface

## 🤝 Development Notes

### Code Quality
- TypeScript for type safety
- ESLint configuration with strict rules
- Consistent code formatting
- Error boundary implementation
- Comprehensive error handling

### Performance Optimizations
- Next.js App Router for optimal loading
- Code splitting and lazy loading
- Image optimization
- Database query optimization
- Efficient state management with React Context

### Security Considerations
- Secure authentication flow
- Role-based API access
- Input validation and sanitization
- Secure database queries with Prisma
- HTTPS enforcement in production

## 📞 Support

For questions or issues:
- Review the documentation above
- Check the source code comments
- Contact: career@lief.care

## 🙏 Acknowledgments

- Lief for providing the development challenge
- Auth0 for authentication services
- Ant Design for the component library
- Vercel for hosting and deployment platform
