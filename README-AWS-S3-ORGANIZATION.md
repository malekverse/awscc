# AWS S3 File Organization System

This document outlines the organized file storage system implemented for the AWS Cloud Club ISIMS platform. The system ensures clean, scalable, and maintainable file management across all platform features.

## 📁 Folder Structure Overview

The S3 bucket is organized into the following main categories:

```
aws-s3-bucket/
├── resources/
│   ├── documents/          # Learning materials (PDFs, Word docs, etc.)
│   ├── presentations/      # PowerPoint presentations and slides
│   ├── videos/            # Video content and tutorials
│   ├── archives/          # ZIP files and compressed resources
│   └── templates/         # Document templates and forms
├── events/
│   ├── banners/           # Event banner images and promotional materials
│   ├── materials/         # Event-specific documents and handouts
│   ├── recordings/        # Event recordings and video content
│   └── certificates/      # Event completion certificates
├── members/
│   ├── profiles/          # Member profile pictures and avatars
│   ├── documents/         # Member-uploaded documents
│   └── certificates/      # Member achievement certificates
├── certifications/
│   ├── templates/         # Certificate templates and designs
│   ├── issued/           # Generated and issued certificates
│   └── badges/           # Digital badges and achievement icons
└── admin/
    ├── reports/          # Administrative reports and analytics
    ├── backups/          # System backups and exports
    └── logs/             # System logs and audit trails
```

## 🔧 File Configuration System

The system uses a comprehensive file configuration that maps file types to appropriate folders:

### Resource Files
- **Documents**: PDFs, Word docs, Excel files, PowerPoint presentations, text files
- **Presentations**: PowerPoint files, PDF presentations
- **Videos**: MP4, AVI, MOV, WMV, WebM files
- **Archives**: ZIP, RAR, 7Z compressed files
- **Templates**: Document templates and forms

### Event Files
- **Event Banners**: JPEG, PNG, GIF, WebP, SVG images
- **Event Materials**: Documents, presentations for events
- **Event Recordings**: Video recordings of events

### Member Files
- **Profile Images**: JPEG, PNG, GIF, WebP images
- **Member Documents**: PDFs, images for member submissions

### Certification Files
- **Certificate Templates**: PDF, image, SVG templates
- **Issued Certificates**: Generated certificates for members
- **Certification Badges**: Digital badges and achievement icons

### Administrative Files
- **Reports**: PDF, Excel, CSV reports and analytics
- **Backups**: System backups and data exports
- **Logs**: System logs and audit trails

## 🚀 Usage Examples

### Uploading a Resource Document
```typescript
import { generateOrganizedFileKey, FILE_CONFIGS } from '../lib/aws-s3';

// For a PDF learning material
const fileKey = generateOrganizedFileKey(
  'documents',           // Resource type
  'aws-basics-guide.pdf', // Original filename
  'admin-user-id',       // User ID (optional)
  'cloud-computing'      // Sub-category (optional)
);
// Result: resources/documents/cloud-computing/admin-user-id/1234567890_abc123_aws-basics-guide.pdf
```

### Uploading an Event Banner
```typescript
// For an event banner image
const fileKey = generateOrganizedFileKey(
  'eventBanners',        // Resource type
  'workshop-banner.jpg', // Original filename
  'admin-user-id'        // User ID (optional)
);
// Result: events/banners/admin-user-id/1234567890_abc123_workshop-banner.jpg
```

### Auto-detecting File Type
```typescript
import { getFileConfigByType } from '../lib/aws-s3';

// Automatically determine the best config for a file
const fileConfigKey = getFileConfigByType(
  'application/pdf',     // File MIME type
  'resource'            // Intended use: 'resource' | 'event' | 'member' | 'certification' | 'admin'
);
// Returns: 'documents' (for resource PDFs)
```

## 🛠️ API Integration

The organized structure is automatically used in all API endpoints:

- **Resources API** (`/api/admin/resources`): Uses appropriate resource folders
- **Events API** (`/api/admin/events`): Uses event-specific folders
- **Members API** (`/api/admin/members`): Uses member-specific folders
- **Certifications API** (`/api/admin/certifications`): Uses certification folders

## 🔄 Migration and Cleanup

The system includes automatic cleanup functions:

```typescript
import { cleanupOldFile } from '../lib/aws-s3';

// Automatically clean up old files when updating
await cleanupOldFile(oldFileUrl);
```

## 📋 File Naming Convention

All files follow a consistent naming pattern:
```
{folder}/{userId?}/{timestamp}_{randomString}_{sanitizedFileName}
```

Example:
```
resources/documents/aws-fundamentals/admin123/1703123456789_abc123def456_AWS_Cloud_Fundamentals.pdf
```

## 🔒 Security and Access Control

- All files are stored in private S3 buckets
- Access is controlled through presigned URLs
- File validation ensures only allowed file types are uploaded
- Automatic cleanup prevents orphaned files

## 🎯 Benefits

1. **Organization**: Clear folder hierarchy for easy navigation
2. **Scalability**: Structure supports growth and new features
3. **Maintainability**: Consistent patterns across all file operations
4. **Security**: Proper access control and validation
5. **Performance**: Efficient file retrieval and management
6. **Cleanup**: Automatic removal of unused files

## 🔧 Configuration

The system is configured through environment variables:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=your_bucket_name
```

## 📝 Notes

- The system maintains backward compatibility with existing files
- Legacy folder structures are supported during transition
- File validation ensures data integrity
- Automatic cleanup prevents storage bloat
- Organized structure improves backup and disaster recovery

For technical implementation details, refer to `/lib/aws-s3.ts`.