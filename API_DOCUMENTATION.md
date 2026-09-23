# API Documentation

**GIST Mentoring System - Backend API Specification**

Version: 1.0  
Base URL: `https://api.mentoring.gist.edu.in/v1`  
Authentication: JWT Bearer Token

---

## Table of Contents

1. [Authentication](#authentication)
2. [Students API](#students-api)
3. [Mentors API](#mentors-api)
4. [Academic Records API](#academic-records-api)
5. [Feedback API](#feedback-api)
6. [Goals API](#goals-api)
7. [Career Guidance API](#career-guidance-api)
8. [Admin API](#admin-api)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)

---

## Authentication

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "userType": "student|mentor|admin",
  "credentials": {
    "username": "22JG1A05A1" or "mentor1" or "admin1",
    "password": "hashed_password"
  }
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "rollNo": "22JG1A05A1",
    "name": "K. Sai Teja",
    "userType": "student",
    "department": "CSE",
    "year": "II B.Tech"
  },
  "expiresIn": 3600
}
```

### Logout

```http
POST /auth/logout
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Refresh Token

```http
POST /auth/refresh
Authorization: Bearer {token}

{
  "refreshToken": "refresh_token_here"
}
```

---

## Students API

### Get Student Profile

```http
GET /students/:rollNo
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rollNo": "22JG1A05A1",
    "name": "K. Sai Teja",
    "email": "saiteja@gist.edu.in",
    "mobile": "+91 9876543210",
    "department": "CSE",
    "year": "II B.Tech",
    "cgpa": 8.34,
    "mentor": {
      "id": "mentor1",
      "name": "Dr. Ramesh Kumar"
    },
    "demographics": {
      "dob": "2004-05-15",
      "gender": "Male",
      "address": "...",
      "family": {...}
    },
    "aspirations": {
      "lifeGoal": "...",
      "careerGoal": "Software Developer",
      "whyEngineering": "..."
    },
    "swot": {
      "strengths": ["..."],
      "weaknesses": ["..."]
    }
  }
}
```

### Update Student Profile

```http
PUT /students/:rollNo
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newemail@gist.edu.in",
  "mobile": "+91 9876543211",
  "careerGoal": "Data Scientist",
  "interests": ["Machine Learning", "AI"]
}
```

### Register New Student

```http
POST /students/register
Content-Type: application/json

{
  "rollNo": "22JG1A05A1",
  "name": "K. Sai Teja",
  "email": "saiteja@gist.edu.in",
  "password": "hashed_password",
  "department": "CSE",
  "year": "II B.Tech",
  // ... all registration fields
}
```

### Get All Students (Admin/Mentor)

```http
GET /students?department=CSE&year=II&page=1&limit=20
Authorization: Bearer {token}
```

**Query Parameters:**
- `department` - Filter by department (optional)
- `year` - Filter by year (optional)
- `cgpa_min` - Minimum CGPA (optional)
- `cgpa_max` - Maximum CGPA (optional)
- `search` - Search by name/roll number (optional)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

---

## Mentors API

### Get Mentor Profile

```http
GET /mentors/:mentorId
Authorization: Bearer {token}
```

### Get Mentor's Students

```http
GET /mentors/:mentorId/students
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mentor": {
      "id": "mentor1",
      "name": "Dr. Ramesh Kumar",
      "department": "CSE"
    },
    "students": [
      {
        "rollNo": "22JG1A05A1",
        "name": "K. Sai Teja",
        "cgpa": 8.34,
        "year": "II B.Tech"
      }
    ],
    "totalStudents": 18,
    "averageCGPA": 8.12
  }
}
```

---

## Academic Records API

### Get Student Academic Records

```http
GET /academic/:rollNo
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rollNo": "22JG1A05A1",
    "cgpa": 8.34,
    "totalCredits": 63,
    "obtainedCredits": 63,
    "semesters": [
      {
        "semester": 1,
        "sgpa": 8.1,
        "totalCredits": 21,
        "obtainedCredits": 21,
        "subjects": [
          {
            "code": "MA101",
            "name": "Engineering Mathematics-I",
            "credits": 3,
            "marks": 85,
            "grade": "A",
            "points": 9
          }
        ]
      }
    ]
  }
}
```

### Add/Update Semester Records

```http
POST /academic/:rollNo/semester
Authorization: Bearer {token}
Content-Type: application/json

{
  "semester": 4,
  "subjects": [
    {
      "code": "CS401",
      "name": "Operating Systems",
      "credits": 3,
      "marks": 88,
      "grade": "A",
      "points": 9
    }
  ]
}
```

### Update Subject Marks

```http
PUT /academic/:rollNo/semester/:semesterNo/subject/:subjectCode
Authorization: Bearer {token}
Content-Type: application/json

{
  "marks": 90,
  "grade": "A+",
  "points": 10
}
```

### Get SGPA/CGPA Calculation

```http
GET /academic/:rollNo/gpa
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cgpa": 8.34,
    "sgpaList": [8.1, 8.3, 8.6],
    "trendAnalysis": "improving",
    "performanceLevel": "good"
  }
}
```

---

## Feedback API

### Get Feedback for Student

```http
GET /feedback/:rollNo?category=academic&limit=10
Authorization: Bearer {token}
```

**Query Parameters:**
- `category` - Filter by category (optional)
- `priority` - Filter by priority (optional)
- `fromDate` - Start date (optional)
- `toDate` - End date (optional)
- `limit` - Number of entries (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "feedback": [
      {
        "id": "fb_123456",
        "mentorId": "mentor1",
        "mentorName": "Dr. Ramesh Kumar",
        "category": "academic",
        "title": "Focus on Data Structures",
        "message": "Detailed feedback...",
        "priority": "high",
        "actionItems": ["Task 1", "Task 2"],
        "resources": "Course links...",
        "date": "2026-01-20T10:00:00Z",
        "followUpDate": "2026-02-20T10:00:00Z"
      }
    ],
    "total": 15,
    "page": 1
  }
}
```

### Add Feedback

```http
POST /feedback/:rollNo
Authorization: Bearer {token}
Content-Type: application/json

{
  "category": "academic",
  "title": "Great Progress in DBMS",
  "message": "Excellent work...",
  "priority": "medium",
  "actionItems": ["Continue practice", "Build projects"],
  "resources": "Course links...",
  "followUpDate": "2026-02-20"
}
```

### Update Feedback

```http
PUT /feedback/:feedbackId
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Updated feedback...",
  "priority": "high"
}
```

### Delete Feedback

```http
DELETE /feedback/:feedbackId
Authorization: Bearer {token}
```

---

## Goals API

### Get Goals for Student

```http
GET /goals/:rollNo?status=pending
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "goals": [
      {
        "id": "goal_123",
        "title": "Complete Python Course",
        "description": "...",
        "assignedDate": "2026-01-10",
        "deadline": "2026-01-25",
        "status": "completed",
        "priority": "high",
        "completionPercentage": 100
      }
    ]
  }
}
```

### Add Goal

```http
POST /goals/:rollNo
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Complete ML Course",
  "description": "Finish Coursera ML course",
  "deadline": "2026-02-28",
  "priority": "high"
}
```

### Update Goal Status

```http
PUT /goals/:goalId
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "completed",
  "completionPercentage": 100,
  "completionDate": "2026-01-25"
}
```

---

## Career Guidance API

### Get Career Recommendations

```http
GET /career/:rollNo/recommendations
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "title": "Software Engineer",
        "description": "...",
        "demand": "Very High",
        "avgSalary": "₹8-20 LPA",
        "skills": ["Java", "Python", "DSA"],
        "resources": [...]
      }
    ],
    "skillsGap": ["Cloud Computing", "Kubernetes"],
    "courseSuggestions": [...]
  }
}
```

### Add Career Suggestion (Mentor)

```http
POST /career/:rollNo/suggestions
Authorization: Bearer {token}
Content-Type: application/json

{
  "careerPath": "Data Scientist",
  "reasoning": "Based on your ML interest...",
  "skills": ["Python", "ML", "Statistics"],
  "resources": "Coursera Data Science Specialization"
}
```

### Get Mentor's Career Suggestions

```http
GET /career/:rollNo/mentor-suggestions
Authorization: Bearer {token}
```

---

## Admin API

### Get College Statistics

```http
GET /admin/statistics
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalStudents": 520,
    "totalMentors": 28,
    "totalDepartments": 5,
    "averageCGPA": 7.84,
    "departmentStats": [
      {
        "name": "CSE",
        "students": 180,
        "avgCGPA": 8.12
      }
    ],
    "yearwiseStats": [...],
    "placementReadiness": 312
  }
}
```

### Get Department Analytics

```http
GET /admin/departments/:department/analytics
Authorization: Bearer {token}
```

### Get Student Performance Report

```http
GET /admin/reports/performance?department=CSE&semester=3
Authorization: Bearer {token}
```

### Export Data

```http
GET /admin/export?type=students&format=pdf|excel
Authorization: Bearer {token}
```

### Get Mentor Performance

```http
GET /admin/mentors/performance
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mentors": [
      {
        "id": "mentor1",
        "name": "Dr. Ramesh Kumar",
        "studentCount": 18,
        "avgStudentCGPA": 8.32,
        "feedbackCount": 45,
        "performanceRating": 4.5
      }
    ]
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Specific error details"
    }
  },
  "timestamp": "2026-01-20T10:00:00Z"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_INVALID_CREDENTIALS` | 401 | Invalid username or password |
| `AUTH_TOKEN_EXPIRED` | 401 | JWT token has expired |
| `AUTH_UNAUTHORIZED` | 403 | Not authorized to access resource |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource not found |
| `DUPLICATE_ENTRY` | 409 | Resource already exists |
| `SERVER_ERROR` | 500 | Internal server error |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

---

## Rate Limiting

### Limits

- **Students/Mentors:** 100 requests per minute
- **Admin:** 200 requests per minute
- **Authentication:** 5 login attempts per 5 minutes

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642684800
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

---

## Pagination

### Request

```http
GET /students?page=2&limit=20&sort=cgpa&order=desc
```

### Response

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 2,
      "totalPages": 10,
      "totalItems": 200,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": true
    }
  }
}
```

---

## WebSocket Events (Future)

### Real-time Notifications

```javascript
// Connect
const socket = io('wss://api.mentoring.gist.edu.in', {
  auth: { token: 'jwt_token' }
});

// Listen for events
socket.on('feedback:new', (data) => {
  console.log('New feedback:', data);
});

socket.on('goal:assigned', (data) => {
  console.log('New goal assigned:', data);
});

socket.on('marks:updated', (data) => {
  console.log('Marks updated:', data);
});
```

---

## API Client Example

### JavaScript/Fetch

```javascript
const API_BASE = 'https://api.mentoring.gist.edu.in/v1';
const TOKEN = localStorage.getItem('authToken');

async function getStudentProfile(rollNo) {
  const response = await fetch(`${API_BASE}/students/${rollNo}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

async function addFeedback(rollNo, feedback) {
  const response = await fetch(`${API_BASE}/feedback/${rollNo}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(feedback)
  });
  
  return await response.json();
}
```

### Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.mentoring.gist.edu.in/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get student profile
const getStudent = async (rollNo) => {
  const { data } = await api.get(`/students/${rollNo}`);
  return data;
};

// Add feedback
const addFeedback = async (rollNo, feedback) => {
  const { data } = await api.post(`/feedback/${rollNo}`, feedback);
  return data;
};
```

---

## Testing

### Postman Collection

Import the Postman collection from:
`postman/GIST-Mentoring-API.postman_collection.json`

### cURL Examples

```bash
# Login
curl -X POST https://api.mentoring.gist.edu.in/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userType":"student","credentials":{"username":"22JG1A05A1","password":"password"}}'

# Get Student Profile
curl -X GET https://api.mentoring.gist.edu.in/v1/students/22JG1A05A1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Add Feedback
curl -X POST https://api.mentoring.gist.edu.in/v1/feedback/22JG1A05A1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category":"academic","title":"Great Work","message":"Keep it up!"}'
```

---

## Support

For API-related queries:
- **Email:** api-support@gist.edu.in
- **Slack:** #api-support channel
- **Documentation:** https://docs.mentoring.gist.edu.in/api

---

**Last Updated:** January 20, 2026  
**API Version:** 1.0  
**Status:** Specification Ready (Implementation Pending)
