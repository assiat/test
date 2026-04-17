# Authentication Page

A complete, responsive authentication system built with vanilla JavaScript, HTML, and CSS.

## Features

### 🔐 Security Features
- Password hashing with salt
- Real-time password strength indicator
- Strong password validation requirements
- Email validation
- Duplicate email prevention
- Remember me functionality
- Session management with localStorage

### ✨ User Experience
- Toggle between Login and Signup forms
- Password visibility toggle
- Real-time form validation
- Email format validation
- Password strength indicator with color coding
- Remember me checkbox
- Forgot password link
- Social authentication buttons (Google, GitHub)
- Success message with auto-redirect
- Responsive design for mobile and desktop
- Dark mode support

### 📋 Form Validation
**Login Form:**
- Email validation
- Password required

**Signup Form:**
- Full name (2+ characters, letters only)
- Email validation
- Password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - Optional special characters
- Password confirmation matching
- Terms & Conditions acceptance

## Demo Account

For testing purposes, a demo account is automatically created:
- **Email:** demo@example.com
- **Password:** Demo1234

## File Structure

```
/test
├── index.html      # Main authentication page
├── style.css       # Styling and responsive design
├── auth.js         # Authentication logic and state management
└── README.md       # Documentation
```

## How to Use

1. **Open the page:** Open `index.html` in a web browser
2. **Login:** Use the demo account or create a new account
3. **Create Account:** Fill in all fields with valid data
4. **Password Strength:** Watch the strength indicator update as you type
5. **Visibility Toggle:** Click the eye icon to show/hide password

## Validation Rules

### Email
- Must be in valid email format (user@domain.com)
- Must be unique (not already registered)

### Password
- Minimum 8 characters
- Must contain at least one uppercase letter (A-Z)
- Must contain at least one lowercase letter (a-z)
- Must contain at least one number (0-9)

### Name
- Minimum 2 characters
- Can contain letters, spaces, hyphens, and apostrophes only

## Password Strength Indicator

- 🔴 **Weak** (0-25%): Less than 8 characters or missing requirements
- 🟠 **Fair** (26-50%): Meets basic requirements
- 🟢 **Good** (51-75%): Meets most requirements
- 🔵 **Strong** (76-100%): Meets all requirements including special characters

## Data Storage

All user data is stored in the browser's **localStorage**:
- `users`: Array of registered users
- `currentUser`: Currently logged-in user session

**Note:** This is for demo purposes only. In production, use a secure backend with proper encryption and database.

## Features Breakdown

### Login
- Email and password validation
- Remember me option
- Forgot password link (demo)
- Social authentication buttons (demo)
- Switch to signup form

### Signup
- Full name validation
- Email availability check
- Password strength indicator
- Password confirmation
- Terms acceptance required
- Auto-login after signup
- Switch to login form

### Additional Features
- Toggle password visibility on input fields
- Real-time validation on blur
- Error messages displayed inline
- Success message with auto-redirect (3 seconds)
- Session management with localStorage
- Automatic logout if "Remember me" is unchecked

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Considerations

⚠️ **Important:** This is a demo implementation. For production use:

1. **Backend Validation:** Never trust client-side validation alone
2. **Password Hashing:** Use bcrypt, Argon2, or similar (not btoa)
3. **HTTPS:** Always use HTTPS for authentication
4. **Secure Storage:** Store data in a secure database, not localStorage
5. **CSRF Protection:** Implement CSRF tokens
6. **Rate Limiting:** Prevent brute force attacks
7. **Password Reset:** Implement secure password reset via email verification
8. **Social Auth:** Use official OAuth libraries

## Customization

### Change Colors
Edit the gradient colors in `style.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Change Password Requirements
Modify the regex patterns in `auth.js`:
- `validatePassword()` method

### Add More Fields
1. Add input to HTML form
2. Add validation in JavaScript
3. Add styling to CSS

### Social Authentication
Replace demo alerts in `handleSocialAuth()` with actual OAuth implementation using:
- Firebase Authentication
- Auth0
- OAuth providers' official libraries

## Troubleshooting

**Q: Data not persisting?**
- Check if localStorage is enabled in your browser
- Clear browser cache and try again

**Q: Password validation too strict?**
- Modify the regex patterns in `auth.js`

**Q: Want to test different passwords?**
- Create a new account with your custom credentials

## Future Enhancements

- Two-factor authentication (2FA)
- Email verification
- Password reset via email
- Social authentication integration
- User profile management
- Session timeout
- Login history
- OAuth/OpenID Connect support
- API integration
- Database backend

## License

This authentication page is provided as-is for educational and demonstration purposes.

## Support

For questions or issues, refer to the code comments in `auth.js` for detailed explanations of each function.
