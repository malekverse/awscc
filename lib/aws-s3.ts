import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface PresignedUrlResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a file to S3
 */
export async function uploadFileToS3(
  file: Buffer,
  key: string,
  contentType: string,
  metadata?: Record<string, string>
): Promise<UploadResult> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      Metadata: metadata,
    });

    await s3Client.send(command);

    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

    return {
      success: true,
      url,
      key,
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete a file from S3
 */
export async function deleteFileFromS3(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    return { success: true };
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generate a presigned URL for downloading a file
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<PresignedUrlResult> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });

    return {
      success: true,
      url,
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generate a unique file key for S3 storage with organized folder structure
 */
export function generateFileKey(
  folder: string,
  originalFileName: string,
  userId?: string
): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = originalFileName.split('.').pop();
  const sanitizedFileName = originalFileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_');

  if (userId) {
    return `${folder}/${userId}/${timestamp}_${randomString}_${sanitizedFileName}`;
  }

  return `${folder}/${timestamp}_${randomString}_${sanitizedFileName}`;
}

/**
 * Generate organized file key based on resource type and category
 */
export function generateOrganizedFileKey(
  resourceType: keyof typeof FILE_CONFIGS,
  originalFileName: string,
  userId?: string,
  subCategory?: string
): string {
  const config = FILE_CONFIGS[resourceType];
  if (!config) {
    throw new Error(`Invalid resource type: ${resourceType}`);
  }

  let folder = config.folder;
  if (subCategory) {
    folder = `${folder}/${subCategory}`;
  }

  return generateFileKey(folder, originalFileName, userId);
}

/**
 * Get the appropriate file config based on file type and intended use
 */
export function getFileConfigByType(
  fileType: string,
  intendedUse: 'resource' | 'event' | 'member' | 'certification' | 'admin' = 'resource'
): keyof typeof FILE_CONFIGS | null {
  // Check each config to find matching file type
  for (const [configKey, config] of Object.entries(FILE_CONFIGS)) {
    if (config.allowedTypes.includes(fileType)) {
      // Prioritize based on intended use
      if (intendedUse === 'event' && configKey.startsWith('event')) {
        return configKey as keyof typeof FILE_CONFIGS;
      }
      if (intendedUse === 'member' && configKey.startsWith('member')) {
        return configKey as keyof typeof FILE_CONFIGS;
      }
      if (intendedUse === 'certification' && configKey.includes('certificate')) {
        return configKey as keyof typeof FILE_CONFIGS;
      }
      if (intendedUse === 'admin' && configKey.startsWith('admin')) {
        return configKey as keyof typeof FILE_CONFIGS;
      }
      if (intendedUse === 'resource' && !configKey.startsWith('event') && !configKey.startsWith('member') && !configKey.includes('certificate') && !configKey.startsWith('admin')) {
        return configKey as keyof typeof FILE_CONFIGS;
      }
    }
  }
  return null;
}

/**
 * Clean up old files when updating resources
 */
export async function cleanupOldFile(oldFileUrl?: string): Promise<void> {
  if (!oldFileUrl) return;
  
  try {
    // Extract key from URL
    const urlParts = oldFileUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part.includes('.s3.'));
    if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
      const key = urlParts.slice(bucketIndex + 1).join('/');
      await deleteFileFromS3(key);
    }
  } catch (error) {
    console.error('Error cleaning up old file:', error);
    // Don't throw error as this is cleanup operation
  }
}

/**
 * Validate file type only (no size limit)
 */
export function validateFile(
  file: File,
  allowedTypes: string[]
): { valid: boolean; error?: string } {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Convert File to Buffer
 */
export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Organized S3 folder structure for clean file management
export const S3_FOLDER_STRUCTURE = {
  // Resources folder - all learning materials and documents
  resources: {
    documents: 'resources/documents',
    presentations: 'resources/presentations', 
    videos: 'resources/videos',
    archives: 'resources/archives',
    templates: 'resources/templates'
  },
  // Events folder - all event-related files
  events: {
    banners: 'events/banners',
    materials: 'events/materials',
    recordings: 'events/recordings',
    certificates: 'events/certificates'
  },
  // Members folder - member-related files
  members: {
    profiles: 'members/profiles',
    documents: 'members/documents',
    certificates: 'members/certificates'
  },
  // Admin folder - administrative files
  admin: {
    reports: 'admin/reports',
    backups: 'admin/backups',
    logs: 'admin/logs'
  },
  // Certifications folder - certification-related files
  certifications: {
    templates: 'certifications/templates',
    issued: 'certifications/issued',
    badges: 'certifications/badges'
  }
};

// File type configurations with organized folder mapping
export const FILE_CONFIGS = {
  // Resource documents (PDFs, Word docs, Excel, etc.)
  documents: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
    ],
    folder: S3_FOLDER_STRUCTURE.resources.documents,
  },
  // Presentation files
  presentations: {
    allowedTypes: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/pdf'
    ],
    folder: S3_FOLDER_STRUCTURE.resources.presentations,
  },
  // Video files
  videos: {
    allowedTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'],
    folder: S3_FOLDER_STRUCTURE.resources.videos,
  },
  // Archive files
  archives: {
    allowedTypes: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
    folder: S3_FOLDER_STRUCTURE.resources.archives,
  },
  // Template files
  templates: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ],
    folder: S3_FOLDER_STRUCTURE.resources.templates,
  },
  // Event banner images
  eventBanners: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    folder: S3_FOLDER_STRUCTURE.events.banners,
  },
  // Event materials
  eventMaterials: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ],
    folder: S3_FOLDER_STRUCTURE.events.materials,
  },
  // Event recordings
  eventRecordings: {
    allowedTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'],
    folder: S3_FOLDER_STRUCTURE.events.recordings,
  },
  // Member profile images
  memberProfiles: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    folder: S3_FOLDER_STRUCTURE.members.profiles,
  },
  // Member documents
  memberDocuments: {
    allowedTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png'
    ],
    folder: S3_FOLDER_STRUCTURE.members.documents,
  },
  // Certificates (both templates and issued)
  certificates: {
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    folder: S3_FOLDER_STRUCTURE.certifications.issued,
  },
  // Certificate templates
  certificateTemplates: {
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/svg+xml'],
    folder: S3_FOLDER_STRUCTURE.certifications.templates,
  },
  // Certification badges
  certificationBadges: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    folder: S3_FOLDER_STRUCTURE.certifications.badges,
  },
  // Admin reports
  adminReports: {
    allowedTypes: [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ],
    folder: S3_FOLDER_STRUCTURE.admin.reports,
  },
  // Legacy support - keeping old structure for backward compatibility
  images: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    folder: 'images',
  },
  events: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    folder: S3_FOLDER_STRUCTURE.events.banners,
  },
};