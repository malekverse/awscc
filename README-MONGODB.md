# MongoDB Integration for AWS Cloud Club

This document explains how to set up MongoDB integration for storing AWS Cloud Club membership data.

## Prerequisites

1. A MongoDB Atlas account or a local MongoDB installation
2. Basic knowledge of MongoDB and database management

## Setup Instructions

### 1. Create a MongoDB Database

#### Using MongoDB Atlas (Recommended for Production)

1. Sign up or log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new project
3. Build a new cluster (the free tier is sufficient for starting)
4. Once your cluster is created, click on "Connect"
5. Choose "Connect your application"
6. Copy the connection string

#### Using Local MongoDB (Development Only)

1. Install MongoDB on your local machine
2. Start the MongoDB service
3. The connection string will be `mongodb://localhost:27017/awscc`

### 2. Configure Environment Variables

1. Create or edit the `.env.local` file in the root of your project
2. Add the MongoDB connection string:

```
MONGODB_URI=your_mongodb_connection_string
```

Replace `your_mongodb_connection_string` with the connection string from MongoDB Atlas or your local MongoDB installation.

### 3. Testing the Integration

1. Start your application with `pnpm dev`
2. Submit a membership form
3. Check your MongoDB database to verify that the data was saved correctly

## Data Structure

Member data is stored in the `members` collection with the following schema:

- `fullName`: String (required)
- `email`: String (required, unique)
- `phone`: String
- `dob`: String (required)
- `role`: String (required)
- `organization`: String
- `linkedin`: String
- `experience`: String (enum: 'beginner', 'intermediate', 'advanced')
- `certifications`: String
- `otherPlatforms`: String
- `whyJoin`: String (required)
- `interests`: Array of Strings (required)
- `otherInterest`: String
- `contribution`: String (required)
- `meetingPreference`: String (enum: 'weekday', 'weekend', 'flexible')
- `heardFrom`: String (enum: 'wordOfMouth', 'socialMedia', 'emailNewsletter', 'website', 'other')
- `otherSourceText`: String
- `agreement`: Boolean (required)
- `paid`: Boolean (default: false)
- `submissionDate`: Date
- `createdAt`: Date (automatically added)
- `updatedAt`: Date (automatically added)

## Troubleshooting

If you encounter issues with the MongoDB connection:

1. Verify that your connection string is correct
2. Check that your IP address is whitelisted in MongoDB Atlas
3. Ensure that the MongoDB service is running (if using local MongoDB)
4. Check the application logs for specific error messages