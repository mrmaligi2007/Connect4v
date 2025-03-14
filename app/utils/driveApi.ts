import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
}

export async function listFiles(accessToken: string): Promise<DriveFile[]> {
  try {
    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?fields=files(id,name,modifiedTime,size)',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

export async function downloadFile(accessToken: string, fileId: string): Promise<any> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

export async function createOrUpdateFile(
  accessToken: string, 
  data: any, 
  filename: string,
  existingFileId?: string
): Promise<string> {
  try {
    const boundary = 'connect4v_boundary';
    const delimiter = `--${boundary}`;
    const closeDelimiter = `--${boundary}--`;
    
    const metadata = {
      name: filename,
      mimeType: 'application/json',
    };
    
    const jsonData = JSON.stringify(data);
    
    const multipartRequestBody =
      `${delimiter}\r\n` +
      'Content-Type: application/json\r\n\r\n' +
      `${JSON.stringify(metadata)}\r\n` +
      `${delimiter}\r\n` +
      'Content-Type: application/json\r\n\r\n' +
      `${jsonData}\r\n` +
      closeDelimiter;
    
    let method = 'POST';
    let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    
    if (existingFileId) {
      method = 'PATCH';
      url = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`;
    }
    
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData.id;
  } catch (error) {
    console.error('Error creating/updating file:', error);
    throw error;
  }
}

export async function deleteFile(accessToken: string, fileId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}
