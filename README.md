# Family App

A comprehensive family management application that helps families stay connected and organized. Share calendars, manage todos, and keep notes together in one place.

## Features

- **User Authentication**: Secure registration and login system with JWT tokens
- **Family Groups**: Create or join multiple family groups with invite codes
- **Shared Calendar**: Create and manage family events with color-coding
- **Todo Management**: Assign tasks to family members with priorities and due dates
- **Family Notes**: Share and collaborate on notes with your family
- **Responsive Design**: Beautiful, modern UI built with Tailwind CSS
- **Real-time Updates**: Stay in sync with your family's activities

## Tech Stack

### Backend
- Node.js + Express
- SQLite database with better-sqlite3
- JWT authentication
- bcryptjs for password hashing

### Frontend
- React 18
- Vite (build tool)
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls
- date-fns for date formatting
- React Icons

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Family-App
```

2. Install dependencies for both server and client:
```bash
npm run install-all
```

Or install separately:
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and set your values
# Important: Change JWT_SECRET to a secure random string
```

### Running the Application

#### Development Mode

Run both server and client concurrently:
```bash
npm run dev
```

Or run them separately:

Terminal 1 - Start the backend server:
```bash
npm run server
```

Terminal 2 - Start the frontend:
```bash
npm run client
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

#### Production Mode

Build the frontend:
```bash
npm run build
```

Start the server:
```bash
npm start
```

## Usage Guide

### First-Time Setup

1. **Register an Account**
   - Navigate to http://localhost:5173
   - Click "Sign up" and create your account

2. **Create a Family Group**
   - After logging in, click "Create Family"
   - Give your family a name
   - You'll receive an invite code to share with family members

3. **Invite Family Members**
   - Share the invite code displayed on your dashboard
   - Family members can join by clicking "Join Family" and entering the code

### Using Features

#### Calendar
- Create events with title, description, date/time, and custom colors
- Mark events as all-day or specific times
- View upcoming and past events
- Edit or delete events

#### Todos
- Create tasks with titles, descriptions, and priorities (low/medium/high)
- Assign tasks to specific family members
- Set due dates for tasks
- Mark tasks as complete
- View active and completed todos separately

#### Notes
- Create shared notes with titles and content
- Edit existing notes
- Delete notes when no longer needed
- See who created each note and when it was last updated

## Project Structure

```
Family-App/
├── server/                 # Backend application
│   ├── config/            # Database configuration
│   ├── middleware/        # Auth middleware
│   ├── routes/            # API routes
│   ├── index.js           # Server entry point
│   └── package.json
├── client/                # Frontend application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context providers
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   ├── index.html
│   └── package.json
├── .env.example           # Environment variables template
├── package.json           # Root package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Family
- `GET /api/family` - Get user's families
- `POST /api/family` - Create family
- `POST /api/family/join` - Join family with invite code
- `GET /api/family/:familyId/members` - Get family members

### Calendar
- `GET /api/calendar/:familyId` - Get events
- `POST /api/calendar` - Create event
- `PUT /api/calendar/:id` - Update event
- `DELETE /api/calendar/:id` - Delete event

### Todos
- `GET /api/todos/:familyId` - Get todos
- `POST /api/todos` - Create todo
- `PUT /api/todos/:id` - Update todo
- `PATCH /api/todos/:id/toggle` - Toggle completion
- `DELETE /api/todos/:id` - Delete todo

### Notes
- `GET /api/notes/:familyId` - Get notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

## Database Schema

The application uses SQLite with the following tables:
- `users` - User accounts
- `families` - Family groups
- `family_members` - User-family relationships
- `events` - Calendar events
- `todos` - Todo items
- `notes` - Family notes

## Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Protected API routes with authentication middleware
- SQL injection prevention with parameterized queries
- CORS configuration for frontend-backend communication

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Future Enhancements

Potential features for future releases:
- Photo sharing and albums
- Real-time messaging/chat
- Shopping lists
- Meal planning
- Family budget tracking
- Mobile app (React Native)
- Push notifications
- File attachments
- User profiles with avatars
- Dark mode

---

Built with ❤️ for families everywhere
