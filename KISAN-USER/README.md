# Kisan Mitra - User Dashboard

A professional React-based user dashboard for the Kisan Mitra farming products platform. This application allows users to browse farming products directly from farmers, place orders, and track their order status.

## Features

- **User Authentication**: Sign up and sign in functionality with mobile number and password
- **Product Browsing**: View all farming products with detailed information
- **Category Filtering**: Filter products by category for easier navigation
- **Order Management**: Place orders and track their status
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Professional UI**: Clean, modern interface with smooth animations and transitions

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: React Context API
- **Backend API**: Node.js REST API (http://localhost:5000)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running at http://localhost:5000

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── Header.tsx
│   ├── Notification.tsx
│   ├── OrderCard.tsx
│   └── ProductCard.tsx
├── pages/             # Page components
│   ├── HomePage.tsx
│   ├── ProductsPage.tsx
│   ├── OrdersPage.tsx
│   ├── SignInPage.tsx
│   └── SignUpPage.tsx
├── context/           # React Context providers
│   └── AuthContext.tsx
├── hooks/             # Custom React hooks
│   └── useNotification.ts
├── types/             # TypeScript type definitions
│   └── index.ts
├── config/            # Configuration files
│   └── api.ts
├── App.tsx            # Main app component
└── main.tsx           # App entry point
```

## API Endpoints

The application connects to the following API endpoints:

- `GET /api/products/products` - Fetch all products
- `POST /api/customers/signup` - User registration
- `POST /api/customers/login` - User login
- `POST /api/orders` - Place a new order
- `GET /api/orders/customer/:mobile` - Fetch user orders

## Usage

### For Users

1. **Sign Up**: Create a new account with your name, mobile number, password, and location
2. **Sign In**: Log in with your mobile number and password
3. **Browse Products**: View featured products on the home page or browse all products
4. **Filter Products**: Use category filters to find specific types of products
5. **Place Orders**: Click "Buy Now" on any product to place an order
6. **Track Orders**: View your order history and status in the "My Orders" section

### Authentication Flow

- User authentication state is persisted in localStorage
- Protected routes (Orders page) redirect to sign-in if user is not authenticated
- Users must be logged in to place orders

## Design Features

- **Green Color Scheme**: Professional green theme representing agriculture
- **Smooth Transitions**: All interactive elements have smooth hover and transition effects
- **Card-based Layout**: Products and orders displayed in clean, modern cards
- **Responsive Grid**: Automatically adjusts layout based on screen size
- **Loading States**: Spinner animations while data is being fetched
- **Notifications**: Toast notifications for user actions and errors

## Configuration

To change the API base URL, edit the `src/config/api.ts` file:

```typescript
export const API_BASE_URL = 'http://localhost:5000';
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
