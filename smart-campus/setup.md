# Smart Campus Management System - Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Installation Steps

1. **Clone or download the project**
   ```bash
   # If using git
   git clone <repository-url>
   cd smart-campus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Update the environment variables in `.env`:
     ```
     PORT=3000
     MONGODB_URI=mongodb://localhost:27017/smart-campus
     SESSION_SECRET=your-super-secret-session-key-here
     NODE_ENV=development
     ```

4. **Database Setup**
   - Make sure MongoDB is running
   - For local MongoDB: `mongod`
   - For MongoDB Atlas: Update the connection string in `.env`

5. **Start the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   - Open your browser and go to: `http://localhost:3000`
   - The application should be running

## Initial Setup

1. **Create Admin Account**
   - First, register with a college email address
   - The system will automatically assign student role
   - To create admin accounts, you can:
     - Manually update the database: `db.users.updateOne({email: "admin@college.edu"}, {$set: {role: "admin"}})`
     - Or use the registration form with special admin email patterns

2. **Configure Buildings and Navigation**
   - Login as admin
   - Go to Navigation → Admin → Buildings
   - Add campus buildings with proper coordinates and information

3. **Set up Cafeteria**
   - Login as admin
   - Go to Cafeteria Admin
   - Add menu items, tables, and inventory

## Features Overview

### Authentication System
- College email validation
- Role-based access (Student/Admin)
- Secure session management

### Event Management
- Create and manage campus events
- Event registration with QR codes
- Category-based event organization

### Academic Calendar
- View and manage academic schedule
- Important dates and deadlines
- Export calendar functionality

### Lost & Found
- Report lost items with descriptions
- Claim found items with verification
- Image upload support

### Cafeteria Management
- Online menu browsing
- Real-time queue tracking
- Order management system
- Admin dashboard for menu/inventory

### Campus Navigation
- Interactive campus map
- Building information
- Route planning and directions
- Real-time location services

## Admin Features

### Event Admin
- Create/edit/delete events
- Manage registrations
- Generate attendance reports

### Cafeteria Admin
- Menu management
- Table status management
- Inventory control
- Order tracking
- Sales reports and analytics

### Navigation Admin
- Building management
- Campus map configuration
- Location services setup

## API Endpoints

The system provides RESTful APIs for:
- User authentication and management
- Event creation and registration
- Lost & found item management
- Cafeteria operations
- Navigation services

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **Port Already in Use**
   - Change PORT in `.env`
   - Or kill the process using the port

3. **Session Issues**
   - Clear browser cookies
   - Restart the server

4. **File Upload Issues**
   - Ensure `uploads` directory exists and has write permissions

### Development Tips

- Use `npm run dev` for development with auto-reload
- Check server logs for detailed error information
- Use browser developer tools for frontend debugging

## Deployment

For production deployment:
1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2
3. Configure reverse proxy (nginx/Apache)
4. Set up SSL certificate
5. Configure database backups

## Support

For issues and questions:
- Check the documentation
- Review server logs
- Contact the development team

---

**Note**: This is a prototype system. For production use, ensure proper security measures, database backups, and regular updates.
