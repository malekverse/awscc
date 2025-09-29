// Vercel Blob service for uploading files to the cloud
import { put } from '@vercel/blob';

export class VercelBlobService {
  /**
   * Upload a file to Vercel Blob
   * @param file - The file to upload (Buffer)
   * @param fileName - The name for the file
   * @param userEmail - User's email to use as filename
   * @returns Promise with the uploaded file URL
   */
  async uploadFile(file: Buffer, fileName: string, userEmail: string): Promise<string> {
    try {
      // Create a simple filename using only the user's email
      const sanitizedEmail = userEmail.replace(/[^a-zA-Z0-9]/g, '_');
      const fileExtension = fileName.split('.').pop() || 'jpg';
      const finalFileName = `${sanitizedEmail}.${fileExtension}`;

      // Upload to Vercel Blob
      const blob = await put(finalFileName, file, {
        access: 'public',
        contentType: this.getMimeType(fileExtension),
      });

      // Return the public URL
      return blob.url;
      
    } catch (error) {
      console.error('Error uploading to Vercel Blob:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get MIME type based on file extension
   */
  private getMimeType(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Upload CV file
   */
  async uploadCV(file: Buffer, fileName: string, userEmail: string): Promise<string> {
    return this.uploadFile(file, `cv_${fileName}`, userEmail);
  }

  /**
   * Upload photo file
   */
  async uploadPhoto(file: Buffer, fileName: string, userEmail: string): Promise<string> {
    return this.uploadFile(file, `photo_${fileName}`, userEmail);
  }
}

// Export a singleton instance
export const vercelBlobService = new VercelBlobService();