# Urban Infrastructure Feedback System - Frontend

A modern React-based frontend for the Urban Infrastructure Feedback System, providing an intuitive interface for citizens to report infrastructure issues and administrators to manage them.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **User Authentication**: Secure login/signup with JWT tokens
- **Role-Based Access**: Different interfaces for citizens and administrators
- **Issue Reporting**: Easy-to-use form for reporting infrastructure problems
- **Issue Management**: Comprehensive dashboard for administrators
- **Real-time Updates**: Dynamic issue status updates
- **Mobile Responsive**: Works seamlessly on all devices
- **Password Visibility Toggle**: Eye button to show/hide passwords
- **Sticky Navigation**: Navigation bar stays visible while scrolling

## 🛠️ Tech Stack

- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing and navigation
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Axios**: HTTP client for API communication
- **Context API**: Global state management for authentication
- **JWT**: Secure token-based authentication

## 📦 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on port 5001

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── api/                 # API service functions
├── components/          # Reusable UI components
├── context/            # React Context providers
├── pages/              # Page components
├── App.js              # Main application component
├── index.js            # Application entry point
└── index.css           # Global styles
```

## 🎯 Key Components

- **Navbar**: Sticky navigation with user authentication status
- **Login/Signup**: Secure authentication forms with password visibility toggle
- **IssueList**: Display and filter reported issues
- **ReportIssue**: Form for citizens to report new issues
- **AdminDashboard**: Administrative interface for issue management
- **Profile**: User profile management

## 📜 Available Scripts

- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm eject`: Eject from Create React App

## 🔧 Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5001/api
```

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 Access Credentials

### Admin Access
- **Email**: `admin@system.com`
- **Password**: `admin123`

### Test User Access
- **Email**: `test@example.com`
- **Password**: `password123`

## 🔒 Security Features

- JWT token-based authentication
- Secure password handling
- Role-based access control
- Protected routes
- Input validation and sanitization

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Subtle transitions and hover effects
- **Accessibility**: Keyboard navigation and screen reader support
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during operations
