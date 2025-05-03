import type { FileItem } from '../stores/fs';
import { FileType } from '../stores/fs';

// Format file size to human-readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

// Format date to human-readable format
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

// Get file extension
export function getFileExtension(filenameOrName: string): string {
  if (!filenameOrName || typeof filenameOrName !== 'string') return '';
  const lastDot = filenameOrName.lastIndexOf('.');
  if (lastDot <= 0) return '';
  return filenameOrName.slice(lastDot + 1);
}

// Get icon for file type
export function getFileIcon(item: FileItem): string {
  if (item.file_type === FileType.Directory) {
    return 'folder';
  }

  const ext = getFileExtension(item.name).toLowerCase();

  // Image files
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) {
    return 'image';
  }

  // Text files
  if (['txt', 'md', 'log', 'json', 'xml', 'csv', 'yml', 'yaml'].includes(ext)) {
    return 'description';
  }

  // Code files
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'py', 'java', 'c', 'cpp', 'rs', 'go', 'php'].includes(ext)) {
    return 'code';
  }

  // Document files
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp'].includes(ext)) {
    return 'article';
  }

  // Archive files
  if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext)) {
    return 'inventory_2';
  }

  // Audio files
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext)) {
    return 'audio_file';
  }

  // Video files
  if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) {
    return 'video_file';
  }

  // Default
  return 'insert_drive_file';
}

// Sort files based on settings
export function sortFiles(
  files: FileItem[],
  sortBy: 'name' | 'size' | 'type' | 'modified',
  sortDirection: 'asc' | 'desc'
): FileItem[] {
  return [...files].sort((a, b) => {
    // Always put directories first
    if (a.file_type === FileType.Directory && b.file_type !== FileType.Directory) {
      return -1;
    }
    if (a.file_type !== FileType.Directory && b.file_type === FileType.Directory) {
      return 1;
    }

    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'type':
        comparison = getFileExtension(a.name).localeCompare(getFileExtension(b.name));
        break;
      case 'modified':
        const aModified = a.modified || 0;
        const bModified = b.modified || 0;
        comparison = aModified - bModified;
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });
}

// Filter files based on settings
export function filterFiles(files: FileItem[], showHidden: boolean): FileItem[] {
  if (showHidden) {
    return files;
  }

  return files.filter(file => !file.is_hidden);
}

// Get breadcrumb segments from path
export function getBreadcrumbs(path: string): { name: string; path: string }[] {
  if (!path) return [];

  const segments = path.split('/').filter(Boolean);
  const breadcrumbs = [];

  let currentPath = '';

  // Add root
  if (path.startsWith('/')) {
    breadcrumbs.push({ name: '/', path: '/' });
    currentPath = '/';
  }

  // Add each segment
  for (const segment of segments) {
    currentPath = currentPath ? `${currentPath}/${segment}` : segment;
    breadcrumbs.push({ name: segment, path: currentPath });
  }

  return breadcrumbs;
}
