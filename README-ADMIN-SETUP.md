# Admin Setup Guide

This guide explains how to create an admin account for the AWSCC admin panel.

## Prerequisites

1. Make sure MongoDB is running and accessible
2. Ensure your `.env.local` file has the correct `MONGODB_URI`
3. Install dependencies: `pnpm install`

## Creating an Admin Account

### Method 1: Using the Simple Admin Creation Script (Recommended)

1. **Run the simple admin creation script with command line arguments:**
   ```bash
   pnpm create-admin-simple <email> <fullName> <password> [role]
   ```

2. **Example:**
   ```bash
   pnpm create-admin-simple admin@awscc.com "Admin User" password123 admin
   ```

3. **Parameters:**
   - `email`: Admin email address
   - `fullName`: Full name (use quotes if it contains spaces)
   - `password`: Password (minimum 6 characters)
   - `role`: Optional, either `admin` (default) or `super_admin`

### Method 2: Using the Interactive Admin Creation Script

1. **Run the interactive admin creation script:**
   ```bash
   pnpm create-admin
   ```

2. **Follow the prompts:**
   - Enter admin email
   - Enter admin full name
   - Enter password (minimum 6 characters)
   - Confirm password
   - Select admin role:
     - `1` for Admin (regular admin)
     - `2` for Super Admin (can delete members)

3. **Note:** If you experience input issues with the interactive script, use Method 1 instead.

### Verification for Both Methods:
- The script will check if MongoDB is connected
- It will verify the email doesn't already exist
- Upon success, you'll see admin details and login URL

### Method 2: Using MongoDB Directly

If you prefer to create an admin directly in MongoDB:

1. Connect to your MongoDB database
2. Use the following template (replace values as needed):

```javascript
use awscc; // or your database name

// Hash the password first (use bcrypt with 12 rounds)
// Example: bcrypt.hash('your-password', 12)

db.admins.insertOne({
  email: "admin@example.com",
  password: "$2a$12$hashedPasswordHere", // Use bcrypt to hash
  fullName: "Admin Name",
  role: "super_admin", // or "admin"
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

## Admin Roles

- **Admin**: Can view and manage members, toggle payment status, send welcome emails
- **Super Admin**: All admin permissions plus ability to delete members

## Accessing the Admin Panel

1. Start the development server: `pnpm dev`
2. Navigate to: `http://localhost:3000/admin/login`
3. Login with your admin credentials

## Troubleshooting

### "No admin exists" Error
- Run `pnpm create-admin` to create your first admin account

### MongoDB Connection Issues
- Check your `MONGODB_URI` in `.env.local`
- Ensure MongoDB is running
- Verify database name and connection string

### Script Errors
- Make sure you have Node.js installed
- Run `pnpm install` to install dependencies
- Check that the `scripts/create-admin.js` file exists

### Password Requirements
- Minimum 6 characters
- No special character requirements (but recommended for security)

## Security Notes

- Passwords are hashed using bcrypt with 12 salt rounds
- Admin sessions use JWT tokens stored in HTTP-only cookies
- All admin actions are logged in the `adminlogs` collection
- Use strong passwords for admin accounts
- Regularly review admin access and remove unused accounts

## Environment Variables

Make sure these are set in your `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/awscc
JWT_SECRET=your-jwt-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Next Steps

After creating an admin:

1. Login to the admin panel
2. Review the member management interface
3. Test member operations (view, search, filter)
4. Configure email settings for welcome emails
5. Set up any additional admin accounts as needed