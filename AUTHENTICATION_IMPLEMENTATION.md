# Session-Based Authentication Implementation

This implementation provides session-based cookie authentication for your frontend application. Here's what has been implemented:

## Features

- **Session Cookie Authentication**: Automatic cookie handling with `credentials: 'include'`
- **Authentication Context**: Global authentication state management
- **Protected Routes**: Automatic redirects for unauthenticated users
- **Role-based Access**: Different access levels for different user roles
- **Automatic Session Validation**: Checks authentication status on app startup
- **Logout Functionality**: Proper session cleanup

## Files Changed/Created

### New Files
- `src/contexts/AuthContext.ts` - Authentication context definition
- `src/contexts/AuthContext.tsx` - Authentication provider component
- `src/hooks/useAuth.ts` - Authentication hook
- `src/components/ProtectedRoute.tsx` - Protected route wrapper
- `.env.example` - Environment variables example

### Modified Files
- `src/api/requests.ts` - Enhanced with authentication handling
- `src/components/login-form.tsx` - Updated to use auth context
- `src/components/nav-user.tsx` - Updated logout functionality
- `src/components/app-sidebar.tsx` - Prepared for real user data
- `src/App.tsx` - Wrapped with AuthProvider and protected routes

## How It Works

### 1. Authentication Flow
```typescript
// Login
await authApi.login({ email, password })
// Session cookie is automatically stored by browser

// Subsequent requests automatically include cookies
const data = await studentApi.getTopics()
```

### 2. Making Authenticated Requests
All API requests now automatically include session cookies:

```typescript
// Before: Manual cookie handling required
// After: Automatic with makeRequest function
const response = await makeRequest('/student/profile', 'GET')
```

### 3. Using Authentication in Components
```typescript
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth()
  
  if (!isAuthenticated) {
    return <div>Please login</div>
  }
  
  return <div>Welcome {user.firstName}!</div>
}
```

### 4. Protected Routes
```typescript
// Automatically redirects to login if not authenticated
<Route 
  path="/user" 
  element={
    <ProtectedRoute>
      <UserPage />
    </ProtectedRoute>
  } 
/>

// Role-based protection
<Route 
  path="/overseer" 
  element={
    <ProtectedRoute requiredRole="SUPERVISOR">
      <OverseerPage />
    </ProtectedRoute>
  } 
/>
```

## Backend Requirements

Your backend needs to:

1. **Set HTTP-only cookies** for session management
2. **Configure CORS** to allow credentials:
   ```kotlin
   // Example for Ktor
   install(CORS) {
       allowCredentials = true
       allowOrigin("http://localhost:5173") // Your frontend URL
   }
   ```

3. **Handle session validation** on protected endpoints
4. **Return 401 status** when session is invalid (triggers automatic redirect)

## Environment Setup

1. Copy `.env.example` to `.env`
2. Update `VITE_API_BASE_URL` to match your backend URL

## API Endpoints Expected

The frontend expects these backend endpoints:

- `POST /login` - Login with email/password
- `POST /logout` - Clear session
- `POST /register` - Register new user  
- `GET /auth/profile` - Get current user profile
- `GET /auth/verify` - Verify session validity

## Security Features

- **HTTP-only cookies**: Prevents XSS attacks
- **Automatic session validation**: Checks auth status on app start
- **401 handling**: Automatic logout on session expiry
- **CSRF protection**: Can be added with additional headers

## Error Handling

- **401 Unauthorized**: Automatically redirects to login
- **Network errors**: Proper error messages shown to user
- **Session expiry**: Graceful handling with user notification

## Testing

To test the implementation:

1. Start your backend server
2. Start the frontend: `npm run dev`
3. Try logging in - cookies should be set automatically
4. Navigate to protected pages - should work without additional setup
5. Try accessing protected pages without login - should redirect to home

## Next Steps

1. Update your backend to return proper user data structure
2. Test with real authentication endpoints
3. Add role-based UI differences
4. Implement proper error handling for specific scenarios
5. Add loading states for better UX

The implementation is now ready to work with your session-based backend authentication!
