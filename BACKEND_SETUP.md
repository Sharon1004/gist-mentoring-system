# Backend Setup Guide

## Overview

The GIST Mentoring System now has a fully functional backend that:
- Serves the frontend HTML/CSS/JS files
- Provides REST API endpoints for authentication and data
- Uses JWT tokens for secure authentication
- Stores data in JSON files (easily replaceable with a database)

## Quick Start

### Option 1: Python Backend (Recommended - No Dependencies)

```bash
python backend/server.py
```

The server will start on `http://localhost:3000`

### Option 2: Node.js Backend (If you have npm installed)

```bash
npm install
npm start
```

## API Endpoints

### Authentication

#### POST `/api/auth/login`
Login and get a JWT token.

**Request:**
```json
{
  "username": "22JG1A05A1",
  "password": "student123",
  "userType": "student"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "rollNo": "22JG1A05A1",
    "name": "K. Sai Teja",
    "cgpa": 8.34,
    "userType": "student"
  }
}
```

#### GET `/api/auth/me`
Get current user info (requires Bearer token).

**Headers:**
```
Authorization: Bearer <token>
```

### Student Endpoints

#### GET `/api/students/me/progress`
Get student's academic progress (requires student token).

**Response:**
```json
{
  "cgpa": 8.34,
  "academicRecords": [
    {
      "semester": 1,
      "sgpa": 8.1,
      "subjects": [...]
    }
  ]
}
```

#### GET `/api/students/me/feedback`
Get feedback for the logged-in student.

#### PUT `/api/students/me/profile`
Update student profile (careerGoal, interests).

**Request:**
```json
{
  "careerGoal": "Software Developer",
  "interests": ["Web Development", "ML"]
}
```

### Mentor Endpoints

#### POST `/api/students/:rollNo/feedback`
Add feedback for a student (requires mentor token).

**Request:**
```json
{
  "category": "academic",
  "title": "Focus on Data Structures",
  "message": "Your performance is good but...",
  "priority": "high",
  "actionItems": "Task 1\nTask 2",
  "resources": "LeetCode, GeeksforGeeks"
}
```

## Data Storage

Data is stored in `backend/data.json`. The structure includes:
- `students`: Array of student objects with academic records
- `mentors`: Array of mentor objects
- `admins`: Array of admin objects
- `mentorFeedback`: Object mapping rollNo to feedback arrays
- `studentGoals`: Array of goals
- `careerSuggestions`: Object mapping rollNo to suggestions

## Frontend Integration

The frontend (`app.js`) has been updated to:
- Use async/await for API calls
- Fall back to demo data if backend is unavailable
- Store JWT tokens in sessionStorage
- Automatically include tokens in API requests

## Testing

Test the backend with:

```bash
# Test login
python -c "import json, urllib.request; req=urllib.request.Request('http://localhost:3000/api/auth/login', data=json.dumps({'username':'22JG1A05A1','password':'student123','userType':'student'}).encode(), headers={'Content-Type':'application/json'}, method='POST'); resp=urllib.request.urlopen(req); print(json.loads(resp.read()))"
```

## Configuration

- **Port**: Set `PORT` environment variable (default: 3000)
- **Token Secret**: Set `TOKEN_SECRET` environment variable (default: "dev-secret-change-me")
- **Data File**: Edit `backend/data.json` to modify users/data

## Security Notes

- Change `TOKEN_SECRET` in production
- Use HTTPS in production
- Implement rate limiting
- Add input validation
- Consider using a real database (MongoDB, PostgreSQL, etc.)

## Next Steps

1. Replace JSON file storage with a database
2. Add password hashing (bcrypt)
3. Implement email verification
4. Add file upload for documents
5. Add real-time notifications (WebSockets)
6. Deploy to cloud (AWS, Azure, Heroku)
