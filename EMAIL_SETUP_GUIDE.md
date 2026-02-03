# Email Setup Guide for Salary Assignment Notifications

## Overview
This guide explains how to set up email notifications for salary assignments in the FireLink Lanka system.

## Prerequisites
- Node.js and npm installed
- Gmail account (or other email service)
- Access to the backend server

## Step 1: Install Dependencies
The nodemailer package has already been installed. If you need to reinstall:
```bash
cd backend
npm install nodemailer
```

## Step 2: Configure Email Settings

### Option A: Using Environment Variables (Recommended)
Create a `.env` file in the `backend` directory with the following content:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Database Configuration (if not already set)
MONGODB_URI=mongodb+srv://admin:dmmlAOhj0Bl70FYR@cluster0.oxpvxep.mongodb.net/test?retryWrites=true&w=majority
```

### Option B: Direct Configuration
If you prefer not to use environment variables, you can modify `backend/services/emailService.js` and replace the environment variables with your actual credentials.

## Step 3: Gmail Setup (if using Gmail)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `EMAIL_PASS` in your .env file

## Step 4: Test the Email Functionality

### Method 1: Using the Test Script
```bash
cd backend
node test-email.js
```

### Method 2: Test Through API
1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Create a salary payment through the frontend or API
3. Check the console logs for email sending status
4. Verify the email is received

## Step 5: Verify Implementation

The email functionality is automatically triggered when:
- A payment with `paymentType: 'salary'` is created
- Any other payment type is created (general notification)

## Email Templates

### Salary Assignment Email
- Professional FireLink Lanka branding
- Detailed payment information
- Pay period information
- Status indicators
- Contact information

### General Payment Email
- Simplified template for non-salary payments
- Basic payment details
- Professional formatting

## Troubleshooting

### Common Issues

1. **"Invalid login" error**
   - Check your email credentials
   - Ensure you're using an App Password, not your regular password
   - Verify 2FA is enabled

2. **"Connection timeout" error**
   - Check your internet connection
   - Verify firewall settings
   - Try a different email service

3. **Emails not being sent**
   - Check console logs for error messages
   - Verify staff email addresses are valid
   - Ensure .env file is properly configured

### Debug Mode
To enable detailed logging, set `NODE_ENV=development` in your .env file.

## Security Considerations

1. **Never commit .env files** to version control
2. **Use App Passwords** instead of regular passwords
3. **Consider using OAuth2** for production environments
4. **Implement rate limiting** for email sending

## Production Recommendations

1. **Use a dedicated email service** like SendGrid, Mailgun, or AWS SES
2. **Implement email queuing** for high-volume scenarios
3. **Add email delivery status tracking**
4. **Set up proper error monitoring**

## Files Modified

1. `backend/services/emailService.js` - Email service configuration
2. `backend/Controllers/PaymentController.js` - Added email sending logic
3. `backend/test-email.js` - Test script for email functionality
4. `backend/package.json` - Added nodemailer dependency

## API Endpoints

The email functionality is integrated into existing payment endpoints:
- `POST /api/payments` - Creates payment and sends email
- All other payment endpoints remain unchanged

## Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify your email configuration
3. Test with a simple email first
4. Check the staff member's email address is valid

---

**Note**: This implementation sends emails asynchronously and won't block payment creation if email sending fails.
