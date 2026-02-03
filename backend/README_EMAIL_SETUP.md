# Simple Email Setup for FireLink Lanka

## ✅ What's Been Done

1. **Removed complex email system** - No more complicated email services
2. **Added simple email textarea** - Just enter an email address in the payment form
3. **Simple email sending** - Basic text email with payment details

## 📧 How It Works Now

1. **In Payment Form:**
   - Fill in payment details as usual
   - In the "Send Email To" textarea, enter any email address
   - Submit the payment
   - Email will be sent to that address with payment details

2. **Email Content:**
   - Simple text format
   - Payment details (staff, type, amount, date, description, status)
   - FireLink Lanka branding

## 🔧 Email Configuration

The system uses these credentials (already set in .env):
- **Email:** firelinklanka@gmail.com
- **Password:** firelinklanka123

## ⚠️ Important Note

Gmail requires App Passwords for security. You need to:

1. **Create the Gmail account** firelinklanka@gmail.com with password firelinklanka123
2. **Enable 2-Factor Authentication**
3. **Generate an App Password** for "Mail"
4. **Replace the password in .env** with the 16-character App Password

## 🧪 Testing

Run this to test:
```bash
node test-simple-email.js
```

## 📝 Usage

1. Start your backend: `npm start`
2. Start your frontend
3. Go to Payment Management
4. Create a payment
5. Enter an email in the "Send Email To" field
6. Submit payment
7. Check the email!

## 🎯 What You Get

- Simple email textarea in payment form
- Basic email with payment details
- No complex setup required
- Works with any email address you enter
