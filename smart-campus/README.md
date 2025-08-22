# Smart Campus Management System

A comprehensive web application for managing campus operations including event management, lost & found, cafeteria queue tracking, and campus navigation.

## Features

### 🎯 Core Modules
- **Authentication System**: Student and admin login with college email validation
- **Event Management**: Create, manage, and register for campus events
- **Academic Calendar**: Yearly calendar with college events and schedules
- **Lost & Found**: Report and claim lost items with image uploads
- **Cafeteria Management**: Menu ordering, queue tracking, and admin dashboard
- **Campus Navigation**: Interactive maps and building information

### 🎨 User Interface
- Responsive design for desktop and mobile
- Real-time queue status updates
- Interactive campus maps
- Admin dashboard with analytics
- User-friendly forms and navigation

### 🔧 Technical Features
- Express.js backend with Handlebars templating
- MongoDB database with Mongoose ODM
- Session-based authentication
- File upload capabilities
- RESTful API endpoints
- Real-time updates (WebSocket ready)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-campus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update the environment variables:
     ```env
     PORT=3000
     MONGODB_URI=mongodb://localhost:27017/smart-campus
     SESSION_SECRET=your-super-secret-session-key-here
     NODE_ENV=development
     ```

4. **Database Setup**
   - Make sure MongoDB is running
   - The application will create collections automatically

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   - Open http://localhost:3000 in your browser

## Default Admin Account

To create an admin account, register with a college email and then update the user role in MongoDB:

```javascript
// In MongoDB shell
use smart-campus
db.users.updateOne({email: "admin@college.edu"}, {$set: {role: "admin"}})
```

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/logout` - User logout

### Events
- `GET /events` - List all events
- `POST /events/create` - Create new event (admin only)
- `GET /events/:id` - Get event details
- `POST /events/register/:id` - Register for event

### Cafeteria
- `GET /cafeteria` - Cafeteria dashboard
- `GET /cafeteria/menu` - View menu items
- `POST /cafeteria/order` - Place order
- `GET /cafeteria/queue/status` - Get queue status

### Navigation
- `GET /navigation/map` - Campus map
- `GET /navigation/building/:id` - Building details
- `GET /navigation/route` - Route to college

## Database Schema

### Users Collection
- name, email, password, role, phone, collegeId, isActive

### Events Collection
- title, description, date, time, venue, organizer, category, status

### Menu Items Collection
- name, description, price, category, availability, image

### Orders Collection
- user, items, totalAmount, status, orderDate

### Lost Items Collection
- itemName, description, location, image, contactInfo, status

## Project Structure

```
smart-campus/
├── config/          # Database and session configuration
├── controllers/     # Route controllers
├── middleware/      # Authentication and validation
├── models/         # MongoDB schemas
├── routes/         # Express routes
├── public/         # Static assets
│   ├── css/        # Stylesheets
│   └── js/         # Client-side JavaScript
├── views/          # Handlebars templates
│   ├── layouts/    # Main layout
│   ├── auth/       # Authentication views
│   └── partials/   # Reusable components
├── utils/          # Utility functions
└── uploads/        # File uploads (auto-created)
```

## Development

### Adding New Features
1. Create model schema in `models/`
2. Add controller logic in `controllers/`
3. Define routes in `routes/`
4. Create views in `views/`
5. Update navigation in layout

### Testing
```bash
# Start development server with auto-reload
npm run dev

# Check for linting errors
npm run lint

# Run tests (when implemented)
npm test
```

## Deployment

### Production Setup
1. Set `NODE_ENV=production` in environment
2. Use MongoDB Atlas or managed database
3. Configure proper session storage
4. Set up reverse proxy (nginx)
5. Enable HTTPS
6. Configure file upload limits

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
SESSION_SECRET=strong-secret-key
PORT=3000
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Email: support@smartcampus.edu
- Campus IT Helpdesk

## Roadmap

- [ ] Mobile app development
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Integration with college systems
- [ ] Multi-language support
- [ ] Advanced search functionality
- [ ] Real-time chat support
- [ ] Payment integration
- [ ] IoT device integration
- [ ] Machine learning features
