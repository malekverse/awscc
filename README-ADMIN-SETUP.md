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

## Admin Dashboard Features

The admin dashboard includes comprehensive management tools:

### 1. Overview Dashboard
- Real-time statistics and analytics
- Member registration trends
- Revenue tracking
- Quick action buttons

### 2. Member Management
- View, search, and filter members
- Toggle payment status
- Send bulk emails
- Export member data
- Delete members (Super Admin only)

### 3. Resources Management
- Upload and manage training materials
- Categorize resources by type and category
- Track download statistics
- File management with AWS S3 integration
- Search and filter resources

### 4. Certifications Management
- Create and manage certification programs
- Set validity periods and requirements
- Track certification providers
- Assign certifications to members
- Monitor certification status

### 5. Events Management
- Schedule and manage events
- Set capacity limits and registration fees
- Track event registrations
- Manage event locations and types
- View event analytics

### 6. Member Certifications
- Issue certifications to members
- Track certification validity
- Renew expired certifications
- Revoke certifications when needed
- Download certification documents

### 7. Analytics & Reporting
- Member growth charts
- Revenue analytics
- Event participation metrics
- Certification completion rates
- Export reports

## Navigation

The admin dashboard uses a tab-based navigation system:

- **Overview**: Dashboard statistics and quick actions
- **Members**: Member management and operations
- **Resources**: Training materials and document management
- **Certifications**: Certification program management
- **Events**: Event scheduling and management
- **Member Certifications**: Individual certification tracking
- **Analytics**: Reports and data visualization

## API Endpoints

The admin panel uses these API endpoints:

### Authentication
- `POST /api/admin/login` - Admin login
- `GET /api/admin/auth/check` - Verify admin session
- `POST /api/admin/logout` - Admin logout

### Members
- `GET /api/admin/members` - Get members list
- `PUT /api/admin/members/[id]` - Update member
- `DELETE /api/admin/members/[id]` - Delete member
- `POST /api/admin/members/bulk` - Bulk operations

### Resources
- `GET /api/admin/resources` - Get resources list
- `POST /api/admin/resources` - Create resource
- `PUT /api/admin/resources/[id]` - Update resource
- `DELETE /api/admin/resources/[id]` - Delete resource

### Certifications
- `GET /api/admin/certifications` - Get certifications list
- `POST /api/admin/certifications` - Create certification
- `PUT /api/admin/certifications/[id]` - Update certification
- `DELETE /api/admin/certifications/[id]` - Delete certification

### Events
- `GET /api/admin/events` - Get events list
- `POST /api/admin/events` - Create event
- `PUT /api/admin/events/[id]` - Update event
- `DELETE /api/admin/events/[id]` - Delete event

### Member Certifications
- `GET /api/admin/member-certifications` - Get member certifications
- `POST /api/admin/member-certifications` - Issue certification
- `PUT /api/admin/member-certifications/[id]` - Update certification status

### Analytics & Export
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/export` - Export data
- `POST /api/admin/send-emails` - Send bulk emails

## Database Collections

The admin system uses these MongoDB collections:

- `admins` - Admin user accounts
- `members` - Club members
- `resources` - Training materials and documents
- `certifications` - Certification programs
- `events` - Events and workshops
- `memberCertifications` - Individual member certifications
- `adminlogs` - Admin action logs

## File Upload Configuration

For resources management, configure AWS S3:

```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
AWS_S3_BUCKET=your-bucket-name
```

## Email Configuration

For email functionality, configure SMTP:

```env
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
FROM_EMAIL=noreply@awscc.com
```

## Next Steps

After creating an admin:

1. **Login to the admin panel** at `http://localhost:3000/admin/login`
2. **Explore the dashboard** - Review overview statistics
3. **Set up resources** - Upload training materials and documents
4. **Create certifications** - Define certification programs
5. **Schedule events** - Add upcoming events and workshops
6. **Manage members** - Review and organize member data
7. **Configure email settings** - Set up SMTP for notifications
8. **Test all features** - Ensure all functionality works correctly
9. **Set up additional admins** - Create accounts for other administrators
10. **Review security settings** - Ensure proper access controls

## Troubleshooting Common Issues

### Dashboard Access Issues
- Ensure the auth endpoint is `/api/admin/auth/check`
- Check JWT token configuration
- Verify admin session cookies

### File Upload Issues
- Verify AWS S3 credentials
- Check bucket permissions
- Ensure proper CORS configuration

### Email Sending Issues
- Verify SMTP configuration
- Check email template formatting
- Test with a small recipient list first

### Database Connection Issues
- Verify MongoDB connection string
- Check database permissions
- Ensure all required collections exist