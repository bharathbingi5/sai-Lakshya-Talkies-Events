# Sai Lakshya Talkies & Events - MERN Stack

A luxury private theatre and celebration booking system built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🚀 Features

- **Full-Stack Architecture**: Complete MERN stack implementation
- **User Authentication**: Secure JWT-based admin authentication
- **Room Management**: Dynamic room configuration and availability
- **Booking System**: Complete booking workflow with payment options
- **Admin Dashboard**: Comprehensive analytics and booking management
- **Responsive Design**: Mobile-first design with royal theme
- **Real-time Data**: Live updates and synchronization

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### DevOps & Quality
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing (frontend)
- **Morgan** - HTTP request logger
- **Compression** - Response compression

## 📁 Project Structure

```
sai-lakshya-talkies-events/
├── backend/                 # Express.js server
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── scripts/           # Database seeding
│   └── server.js          # Main server file
├── src/                   # React frontend
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── services/         # API service layer
│   └── ...
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sai-lakshya-talkies-events
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**

   **Backend (.env in backend/ folder):**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/sai-lakshya-talkies
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=24h
   FRONTEND_URL=http://localhost:3000
   ```

   **Frontend (.env in root folder):**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Seed the database**
   ```bash
   npm run backend:seed
   ```

5. **Start the development servers**
   ```bash
   # Option 1: Run both frontend and backend together
   npm run dev:full

   # Option 2: Run separately
   npm run backend:dev    # Terminal 1
   npm run dev           # Terminal 2
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## 🔐 Default Admin Credentials

- **Username:** admin
- **Password:** admin123

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Bookings
- `GET /api/bookings` - Get all bookings (admin)
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking
- `GET /api/bookings/analytics/summary` - Get analytics

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/availability/:date` - Check availability

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 🚢 Production Deployment

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```env
   NODE_ENV=production
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=your-production-jwt-secret
   ```

3. **Start the production server**
   ```bash
   cd backend && npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Sai Lakshya Talkies & Events Team

---

**Experience entertainment like never before** ✨
