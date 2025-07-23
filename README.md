# Link Saver with Auto-Summary

A full-stack application that allows users to save bookmarks with automatic AI-powered summaries using the free Jina AI API.

## Features

- **Authentication**: Email/password signup and login with JWT tokens
- **Bookmark Management**: Save, view, and delete bookmarks
- **Auto-Summary**: Automatic AI-powered summaries using Jina AI (free, no API key required)
- **Metadata Extraction**: Automatic title and favicon extraction
- **Tag System**: Organize bookmarks with tags and filter functionality
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Tech Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: SQLite
- **Authentication**: JWT with bcrypt password hashing
- **AI Summary**: Jina AI free API (r.jina.ai)

## Setup Instructions

### 1. Install Dependencies

```bash
# Install root dependencies
npm run install
```

### 2. Start Development Servers

```bash
# Start both client and server concurrently
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- React client on http://localhost:3000

### 3. Usage

1. Open http://localhost:3000 in your browser
2. Sign up for a new account or login
3. Add bookmarks by pasting URLs
4. The app will automatically:
   - Extract page title and favicon
   - Generate AI summary using Jina AI
   - Save everything to your personal collection
5. Filter bookmarks by tags
6. Delete bookmarks as needed

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login user

### Bookmarks
- `GET /api/bookmarks` - Get user's bookmarks (with optional tag filter)
- `POST /api/bookmarks` - Create new bookmark with auto-summary
- `DELETE /api/bookmarks/:id` - Delete bookmark

## Environment Variables

Create a `.env` file in the root directory (optional):

```
JWT_SECRET=your-secret-key-here
PORT=5000
NODE_ENV=development
```

## Features in Detail

### Auto-Summary with Jina AI
- Uses the free Jina AI API at `https://r.jina.ai/`
- No API key or registration required
- Handles rate limiting gracefully (≈60 calls/hour per IP)
- Falls back to "Summary temporarily unavailable" on errors

### Security Features
- Password hashing with bcrypt
- JWT token authentication
- CORS protection
- Rate limiting
- Input validation

### Database Schema
- Users table: id, email, password, created_at
- Bookmarks table: id, user_id, url, title, favicon, summary, tags, created_at

## Development

### Available Scripts

- `npm run dev` - Start both client and server
- `npm run server` - Start only the backend server
- `npm run client` - Start only the React client
- `npm run build` - Build React app for production

### Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Auth context
│   │   └── App.js         # Main app component
│   └── public/            # Static files
├── server/                # Node.js backend
│   ├── routes/            # API routes
│   ├── database.js        # SQLite setup
│   └── index.js          # Express server
└── package.json          # Root dependencies
```
