# Fresh Mart - Production-Ready Authentication Workflow

## Overview
This document explains the complete authentication system implemented for Fresh Mart, which uses JWT tokens, OTP verification, and bcrypt password hashing.

---

## Authentication Flow

### 1. **Customer Registration Workflow**

#### Step 1: Enter Registration Details
- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }
  ```
- **Validation Rules**:
  - Full Name: Required, trimmed
  - Email: Valid email format, normalized
  - Password: Min 8 characters, at least 1 number

#### Step 2: System Checks Account Exists
- If email already exists in database:
  - **Status**: 409 Conflict
  - **Response**:
    ```json
    {
      "message": "Account already exists. Please login.",
      "code": "ACCOUNT_EXISTS"
    }
    ```
  - Frontend redirects to login page

#### Step 3: Send OTP via Email
- OTP (4-digit) is generated and stored in `Otp` collection
- Email sent with OTP via Brevo SMTP
- **Success Response**:
  ```json
  {
    "message": "OTP sent to your email. Please verify to complete registration.",
    "email": "john@example.com"
  }
  ```
- OTP expires in 5 minutes
- Password is hashed and stored temporarily with OTP

---

### 2. **OTP Verification Workflow**

#### Step 1: User Enters OTP
- **Endpoint**: `POST /api/auth/verify-otp`
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "otp": "1234"
  }
  ```

#### Step 2: System Validates OTP
- ✅ OTP exists
- ✅ OTP not expired (< 5 minutes)
- ✅ OTP matches
- ✅ Attempt count < 5

#### Step 3: Create User Account
- Account created in MongoDB `User` collection
- Email and hashed password permanently saved
- Stored OTP record deleted

#### Step 4: Generate JWT Tokens
- **Access Token**: 15 minutes validity (short-lived)
- **Refresh Token**: 7 days validity (stored in httpOnly cookie)
- **CSRF Token**: Added to response

#### Step 5: Success Response
- **Status**: 201 Created
- **Response**:
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
    "accessToken": "eyJhbGc..."
  }
  ```
- Tokens set in response headers and cookies

---

### 3. **Login Workflow (Direct, No OTP)**

#### Step 1: Enter Login Credentials
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "SecurePass123"
  }
  ```

#### Step 2: System Verifies Credentials
- Find user by email
- Compare password using bcrypt
- If invalid: Return 401 Unauthorized

#### Step 3: Generate Tokens & Login
- Same as registration (generate Access Token + Refresh Token)
- **Status**: 200 OK
- **Response**:
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
    "accessToken": "eyJhbGc..."
  }
  ```

---

## Error Handling

### Registration Errors

| Error | Status | Message | Code |
|-------|--------|---------|------|
| Account exists | 409 | "Account already exists. Please login." | `ACCOUNT_EXISTS` |
| Email invalid | 400 | "Valid email is required" | - |
| Weak password | 400 | "Password must be at least 8 characters and include a number" | - |
| Send OTP failed | 500 | "Unable to send OTP. Please try again later." | `SEND_OTP_FAILED` |

### OTP Verification Errors

| Error | Status | Message | Code |
|-------|--------|---------|------|
| OTP not found | 400 | "OTP not found. Please request a new OTP." | `OTP_NOT_FOUND` |
| OTP expired | 400 | "OTP expired. Please request a new OTP." | `OTP_EXPIRED` |
| Invalid OTP | 400 | "Invalid OTP. 4 attempts remaining." | `INVALID_OTP` |
| Too many attempts | 429 | "Too many OTP attempts. Please request a new OTP." | `OTP_ATTEMPTS_EXCEEDED` |
| Account exists (race) | 409 | "Account already exists. Please login." | `ACCOUNT_EXISTS` |

### Resend OTP Errors

| Error | Status | Message | Code |
|-------|--------|---------|------|
| Cooldown active | 429 | "Please wait 25 seconds before requesting a new OTP" | `RESEND_COOLDOWN` |
| No pending OTP | 400 | "No pending registration found. Please start new registration." | `NO_PENDING_OTP` |
| Account exists | 409 | "Account already exists. Please login." | `ACCOUNT_EXISTS` |

### Login Errors

| Error | Status | Message | Code |
|-------|--------|---------|------|
| Invalid credentials | 401 | "Invalid email or password" | `INVALID_CREDENTIALS` |
| Login failed | 500 | "Login failed. Please try again later." | `LOGIN_FAILED` |

---

## Rate Limiting

### Applied Rate Limits

```javascript
// Global rate limiter
- 300 requests per 15 minutes (all endpoints)

// Authentication endpoints
- Registration: 10 requests per 15 minutes
- OTP Verify/Resend: 15 requests per 15 minutes  
- Login: 10 requests per 15 minutes

// OTP Resend Cooldown
- Minimum 30 seconds between OTP requests
```

### 429 Too Many Requests Response
```json
{
  "message": "Please wait 25 seconds before requesting a new OTP",
  "retryAfter": 25,
  "code": "RESEND_COOLDOWN"
}
```

---

## Security Features

### 1. **Password Hashing**
- Algorithm: bcrypt with salt rounds: 12
- Passwords hashed before storing
- Never stored in plain text
- Compared using bcrypt.compare()

### 2. **JWT Tokens**
- **Access Token**: Short-lived (15 minutes)
- **Refresh Token**: Long-lived (7 days), httpOnly cookie
- Refresh token automatically renewed on expiry
- Signed with JWT_SECRET

### 3. **CSRF Protection**
- CSRF token generated for each session
- Included in responses
- Validated for state-changing requests

### 4. **OTP Security**
- 4-digit numeric OTP
- Expires after 5 minutes
- Limited to 5 attempts
- Resend cooldown: 30 seconds
- Attempts reset on resend

### 5. **Input Validation**
- Email validation and normalization
- Password strength requirements
- OTP length validation
- Request body sanitization

### 6. **Cookies Security**
- httpOnly: true (prevents XSS attacks)
- secure: true (production only, HTTPS)
- sameSite: 'lax' (CSRF protection)
- maxAge: 7 days (refresh token)

---

## Database Models

### User Model
```javascript
{
  fullName: String (required, trimmed),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  phone: String (optional),
  address: String (optional),
  role: String (enum: 'customer', 'admin'),
  cart: [{
    product: ObjectId,
    quantity: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### OTP Model
```javascript
{
  fullName: String,
  email: String (indexed),
  passwordHash: String,
  otp: String,
  expiresAt: Date (TTL index),
  attempts: Number,
  lastSentAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/fresh-mart

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Email (Brevo)
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-email@gmail.com
BREVO_SMTP_PASSWORD=your-brevo-key

# Server
PORT=5000
NODE_ENV=production
CLIENT_URL=http://localhost:5173
```

---

## Frontend Implementation

### Register Component
- Input validation with helpful messages
- OTP modal with 4-digit input boxes
- Auto-focus between input fields
- Countdown timer for OTP resend (30 seconds)
- Error handling with specific messages

### Login Component
- Email and password fields
- Error messages guide unregistered users to register
- Automatic redirect based on role (admin/customer)

### AuthContext
- Manages authentication state
- Handles token refresh automatically
- Persists user in localStorage
- Automatic logout on token expiry

---

## Testing the Workflow

### 1. New User Registration
```bash
POST /api/auth/register
{
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "TestPass123"
}
```

### 2. Verify OTP
```bash
POST /api/auth/verify-otp
{
  "email": "test@example.com",
  "otp": "1234"
}
```

### 3. Login with Credentials
```bash
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "TestPass123"
}
```

### 4. Check Protected Routes
```bash
GET /api/auth/profile
Authorization: Bearer <accessToken>
```

---

## API Endpoints Summary

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/auth/csrf-token` | Get CSRF token | ❌ |
| POST | `/api/auth/register` | Send OTP | ❌ |
| POST | `/api/auth/verify-otp` | Verify OTP & Create account | ❌ |
| POST | `/api/auth/resend-otp` | Request new OTP | ❌ |
| POST | `/api/auth/login` | Login with credentials | ❌ |
| POST | `/api/auth/refresh-token` | Refresh access token | ✅ |
| GET | `/api/auth/profile` | Get current user | ✅ |
| POST | `/api/auth/logout` | Logout user | ✅ |

---

## Production Checklist

- ✅ Password hashing with bcrypt
- ✅ JWT token generation and validation
- ✅ OTP email verification
- ✅ Rate limiting on sensitive endpoints
- ✅ Input validation and sanitization
- ✅ Error handling with appropriate status codes
- ✅ CSRF protection
- ✅ httpOnly cookies for tokens
- ✅ Token refresh mechanism
- ✅ Account existence checks
- ✅ Race condition handling
- ✅ Comprehensive error messages

---

## Common Issues & Solutions

### Issue: "Account already exists. Please login."
**Solution**: This is the expected behavior. If the email is already registered, the user should login instead of register again.

### Issue: OTP keeps expiring
**Solution**: OTP expires after 5 minutes. User should request a new OTP if not verified within this time.

### Issue: Too many requests (429)
**Solution**: Wait for the cooldown period (30 seconds for resend, rate limits for other endpoints) before trying again.

### Issue: Password validation fails
**Solution**: Password must be:
- At least 8 characters
- Contain at least 1 number
- Match the confirmation password

---

## Customization

### Change OTP Expiry
Edit `authController.js`, `sendRegistrationOtp` function:
```javascript
const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
```

### Change OTP Length
Edit `otpSchema.js`:
```javascript
body('otp').isLength({ min: 6, max: 6 }) // 6-digit OTP
```

### Adjust Rate Limits
Edit `.env` or `authRoutes.js`:
```javascript
const otpLimiter = rateLimit({
  max: 20, // Increase from 15
  windowMs: 20 * 60 * 1000, // 20 minutes
});
```

---

## Support & Troubleshooting

For issues or questions about the authentication workflow, check:
1. Server logs for detailed error information
2. Network tab in browser DevTools
3. MongoDB collections (User, Otp) for data validation
4. Email service status (Brevo)
5. JWT token expiry time

