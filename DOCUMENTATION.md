# Project Documentation

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user
- Required fields: name, email, password
- Returns: JWT token

#### POST /api/auth/login
Login existing user
- Required fields: email, password
- Returns: JWT token

### Records Endpoints

#### GET /api/records
Get all records
- Headers: Authorization Bearer token
- Query params: page, limit, search

#### POST /api/records
Create new record
- Headers: Authorization Bearer token
- Required fields: title, description, category

#### GET /api/records/:id
Get single record
- Headers: Authorization Bearer token
- Params: record id

### Requests Endpoints

#### POST /api/requests
Create new request
- Headers: Authorization Bearer token
- Required fields: recordId, reason

#### GET /api/requests
Get all requests
- Headers: Authorization Bearer token
- Query params: status, page, limit

## Database Schema

### User Model
- id: UUID
- name: String
- email: String (unique)
- password: String (hashed)
- role: Enum ['user', 'admin']

### Record Model
- id: UUID
- title: String
- description: Text
- category: String
- createdAt: DateTime
- updatedAt: DateTime

### Request Model
- id: UUID
- userId: UUID (ref: User)
- recordId: UUID (ref: Record)
- status: Enum ['pending', 'approved', 'rejected']
- reason: Text

## Security Measures

- Password Hashing: bcrypt
- Authentication: JWT
- Input Validation: Express-validator
- Rate Limiting: Express-rate-limit
