# Fresh Mart - Complete API Testing Guide

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.freshmart.com/api
```

---

## 1. CSRF Token Endpoint

### Get CSRF Token
**Endpoint**: `GET /auth/csrf-token`

**Purpose**: Retrieve CSRF token for secure requests

**cURL**:
```bash
curl -X GET http://localhost:5000/api/auth/csrf-token \
  -H "Content-Type: application/json"
```

**Response** (200 OK):
```json
{
  "csrfToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
}
```

---

## 2. Registration API (Send OTP)

### Register New Customer
**Endpoint**: `POST /auth/register`

**Purpose**: Initiate registration by sending OTP to email

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Validation Rules**:
- fullName: Required, not empty
- email: Valid email format
- password: Minimum 8 characters, at least 1 number

**cURL**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Success Response (200 OK)
```json
{
  "message": "OTP sent to your email. Please verify to complete registration.",
  "email": "john@example.com"
}
```

### Error Responses

**Account Already Exists** (409 Conflict):
```json
{
  "message": "Account already exists. Please login.",
  "code": "ACCOUNT_EXISTS"
}
```

**Invalid Email** (400 Bad Request):
```json
{
  "message": "Valid email is required"
}
```

**Weak Password** (400 Bad Request):
```json
{
  "message": "Password must be at least 8 characters and include a number"
}
```

**Send OTP Failed** (500 Internal Server Error):
```json
{
  "message": "Unable to send OTP. Please try again later.",
  "code": "SEND_OTP_FAILED"
}
```

---

## 3. OTP Verification API

### Verify OTP and Create Account
**Endpoint**: `POST /auth/verify-otp`

**Purpose**: Verify OTP and complete registration

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "john@example.com",
  "otp": "1234"
}
```

**cURL**:
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "1234"
  }'
```

### Success Response (201 Created)
```json
{
  "message": "Registration successful! Welcome to Fresh Mart.",
  "code": "REGISTRATION_SUCCESS",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTcxNjI5MzAyMiwiZXhwIjoxNzE2Mjk0MzIyfQ.Lx8nXZ9K..."
}
```

### Error Responses

**OTP Not Found** (400 Bad Request):
```json
{
  "message": "OTP not found. Please request a new OTP.",
  "code": "OTP_NOT_FOUND"
}
```

**OTP Expired** (400 Bad Request):
```json
{
  "message": "OTP expired. Please request a new OTP.",
  "code": "OTP_EXPIRED"
}
```

**Invalid OTP** (400 Bad Request):
```json
{
  "message": "Invalid OTP. 4 attempts remaining.",
  "code": "INVALID_OTP",
  "remainingAttempts": 4
}
```

**Too Many Attempts** (429 Too Many Requests):
```json
{
  "message": "Too many OTP attempts. Please request a new OTP.",
  "code": "OTP_ATTEMPTS_EXCEEDED"
}
```

**Account Already Exists** (409 Conflict - race condition):
```json
{
  "message": "Account already exists. Please login.",
  "code": "ACCOUNT_EXISTS"
}
```

---

## 4. Resend OTP API

### Request New OTP
**Endpoint**: `POST /auth/resend-otp`

**Purpose**: Request a new OTP (with 30-second cooldown)

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**cURL**:
```bash
curl -X POST http://localhost:5000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

### Success Response (200 OK)
```json
{
  "message": "New OTP sent to your email",
  "code": "OTP_RESENT"
}
```

### Error Responses

**Resend Cooldown** (429 Too Many Requests):
```json
{
  "message": "Please wait 25 seconds before requesting a new OTP",
  "retryAfter": 25,
  "code": "RESEND_COOLDOWN"
}
```

**No Pending OTP** (400 Bad Request):
```json
{
  "message": "No pending registration found. Please start new registration.",
  "code": "NO_PENDING_OTP"
}
```

**Account Already Exists** (409 Conflict):
```json
{
  "message": "Account already exists. Please login.",
  "code": "ACCOUNT_EXISTS"
}
```

---

## 5. Login API

### Login with Email and Password
**Endpoint**: `POST /auth/login`

**Purpose**: Direct login (NO OTP required for existing accounts)

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**cURL**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Success Response (200 OK)
```json
{
  "message": "Login successful",
  "code": "LOGIN_SUCCESS",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTcxNjI5MzAyMiwiZXhwIjoxNzE2Mjk0MzIyfQ.Lx8nXZ9K..."
}
```

### Error Responses

**Invalid Credentials** (401 Unauthorized):
```json
{
  "message": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}
```

**Login Failed** (500 Internal Server Error):
```json
{
  "message": "Login failed. Please try again later.",
  "code": "LOGIN_FAILED"
}
```

---

## 6. Get User Profile

### Fetch Current User Profile
**Endpoint**: `GET /auth/profile`

**Purpose**: Get logged-in user details

**Headers**:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**cURL**:
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Success Response (200 OK)
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

### Error Response

**Unauthorized** (401 Unauthorized):
```json
{
  "message": "Unauthorized"
}
```

---

## 7. Refresh Token

### Get New Access Token
**Endpoint**: `POST /auth/refresh-token`

**Purpose**: Refresh expired access token using refresh token from cookie

**Headers**:
```
Content-Type: application/json
Cookie: refreshToken=<refreshToken>
```

**cURL**:
```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -b "refreshToken=<refreshToken>"
```

### Success Response (200 OK)
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Response

**Invalid Refresh Token** (401 Unauthorized):
```json
{
  "message": "Invalid refresh token"
}
```

---

## 8. Logout

### Logout User
**Endpoint**: `POST /auth/logout`

**Purpose**: Logout and clear session

**Headers**:
```
Content-Type: application/json
```

**cURL**:
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json"
```

### Success Response (200 OK)
```json
{
  "message": "Logged out successfully"
}
```

---

## Testing Workflow

### Complete Registration & Login Flow

#### 1. Get CSRF Token
```bash
curl -X GET http://localhost:5000/api/auth/csrf-token
```

#### 2. Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

#### 3. Check Email for OTP (in test environment, check logs/email service)
- OTP is sent to email
- In development, you might log it to console or check email

#### 4. Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "1234"
  }'
```

#### 5. Get Access Token from Response
- Save the `accessToken` from the response
- Use it for authenticated requests

#### 6. Access Protected Route
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <accessToken>"
```

#### 7. Login with Credentials
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

#### 8. Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout
```

---

## Rate Limiting Response

If you exceed rate limits:

```
HTTP/1.1 429 Too Many Requests

{
  "message": "Too many requests from this IP, please try again later."
}
```

**Rate Limits**:
- Global: 300 requests per 15 minutes
- Register: 10 requests per 15 minutes
- OTP Verify/Resend: 15 requests per 15 minutes
- Login: 10 requests per 15 minutes

---

## Postman Collection JSON

Save this as `Fresh_Mart_Auth.postman_collection.json`:

```json
{
  "info": {
    "name": "Fresh Mart Authentication",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "CSRF Token",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/auth/csrf-token"
      }
    },
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"fullName\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"password\": \"SecurePass123\"\n}"
        },
        "url": "{{baseUrl}}/auth/register"
      }
    },
    {
      "name": "Verify OTP",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"john@example.com\",\n  \"otp\": \"1234\"\n}"
        },
        "url": "{{baseUrl}}/auth/verify-otp"
      }
    },
    {
      "name": "Resend OTP",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"john@example.com\"\n}"
        },
        "url": "{{baseUrl}}/auth/resend-otp"
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"john@example.com\",\n  \"password\": \"SecurePass123\"\n}"
        },
        "url": "{{baseUrl}}/auth/login"
      }
    },
    {
      "name": "Get Profile",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{accessToken}}"
          }
        ],
        "url": "{{baseUrl}}/auth/profile"
      }
    },
    {
      "name": "Refresh Token",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": "{{baseUrl}}/auth/refresh-token"
      }
    },
    {
      "name": "Logout",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": "{{baseUrl}}/auth/logout"
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "accessToken",
      "value": ""
    }
  ]
}
```

---

## Troubleshooting

### OTP Not Received
1. Check email service (Brevo) configuration
2. Check spam folder
3. Verify email address is correct
4. Check server logs for errors

### Access Token Expired
1. Get new token using refresh token endpoint
2. Or login again

### Rate Limit Hit
1. Wait for the specified cooldown period
2. Try again after the cooldown

### Password Validation Failed
1. Ensure password is at least 8 characters
2. Ensure password contains at least 1 number
3. Example: `MyPass123` ✅ vs `MyPassword` ❌

