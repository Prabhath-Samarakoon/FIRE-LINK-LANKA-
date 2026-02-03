# Fire Brigade Login System Setup

## Overview
This document explains how to set up and use the new login system for the Fire Brigade Management System.

## Features
- Secure password encryption using bcryptjs
- JWT token-based authentication
- Role-based access control
- Protected routes for each subsystem
- Beautiful login interface

## User Credentials

The system includes 4 pre-configured admin users:

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| Vehicle Officer | shanuka | shanuka12345 | Vehicle management, maintenance, emergency response |
| Call Operator | umesh | umesh12345 | Call console, emergency mode, incident management |
| Staff Manager | rashmika | rashmika12345 | Staff management, training, schedules, team overview |
| Station Officer | malindu | malindu12345 | Inventory, reports, inspections, donations |

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Seed Admin Data
Run the seed script to populate the admin table with encrypted passwords:
```bash
npm run seed:admin
```

### 3. Start the Backend Server
```bash
npm start
```

### 4. Start the Frontend
```bash
cd frontend
npm start
```

## How to Use

### 1. Access the System
- Navigate to `http://localhost:3000`
- Click "Access System" to go to the login page

### 2. Login Process
- Enter your username and password
- The system will authenticate and redirect you to the appropriate subsystem based on your role

### 3. Role-Based Navigation
- **Staff Manager (rashmika)**: Redirected to `/staff-manager`
- **Call Operator (umesh)**: Redirected to `/call-operator`
- **Vehicle Officer (shanuka)**: Redirected to `/vehicle-officer`
- **Station Officer (malindu)**: Redirected to `/station-officer`

## Security Features

### Password Encryption
- All passwords are encrypted using bcryptjs with salt rounds of 10
- Passwords are hashed before being stored in the database
- Original passwords are never stored in plain text

### JWT Authentication
- JWT tokens are used for session management
- Tokens expire after 24 hours
- Tokens are stored in localStorage for persistence

### Protected Routes
- All subsystem routes are protected and require authentication
- Users can only access routes appropriate to their role
- Unauthorized access attempts redirect to login page

## API Endpoints

### Authentication
- `POST /api/admin/login` - User login
- `GET /api/admin/admins` - Get all admins (protected)

### Request Format
```json
{
  "username": "rashmika",
  "password": "rashmika12345"
}
```

### Response Format
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "username": "rashmika",
      "role": "staff-manager"
    }
  }
}
```

## Database Schema

### Admin Collection
```javascript
{
  username: String (required, unique),
  password: String (required, encrypted),
  role: String (required, enum: ['staff-manager', 'call-operator', 'vehicle-officer', 'station-officer']),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

### Common Issues

1. **Login fails with "Invalid credentials"**
   - Verify username and password are correct
   - Check if admin data has been seeded properly
   - Run `npm run seed:admin` to re-seed data

2. **Token expired errors**
   - Tokens expire after 24 hours
   - User needs to log in again

3. **Access denied to routes**
   - Ensure user has the correct role for the subsystem
   - Check if user is properly authenticated

### Reset Admin Data
To reset all admin data:
```bash
npm run seed:admin
```

## Development Notes

- The login system is fully integrated with the existing Fire Brigade Management System
- All existing functionality remains unchanged
- The system maintains backward compatibility
- Authentication state is managed through React Context API

## Security Considerations

- Change default passwords in production
- Use environment variables for JWT secrets
- Implement rate limiting for login attempts
- Consider implementing 2FA for enhanced security
- Regularly rotate JWT secrets
- Monitor login attempts and implement account lockout policies
