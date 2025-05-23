import path from 'node:path';
import fs from 'node:fs/promises';


export const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m"
};

const CATEGORY_FOLDERS = {
  images: ['jpg', 'jpeg', 'png', 'gif'],
  docs: ['pdf', 'docx', 'txt'],
  videos: ['mp4', 'avi', 'mkv'],
  audios: ['mp3', 'wav'],
  code: ['js', 'html', 'css', 'py', 'java'],
  archives: ['zip', 'rar', 'tar']
}

export const createNeededSubFolders = async (subfolders, pathFolder) => {

  for (const [folderName, files] of Object.entries(subfolders)) {
    // Create the folder
    const folderPath = path.join(pathFolder, folderName);
    const folderExists = await fs
      .access(folderPath)
      .then(() => true)
      .catch(() => false);

    // Check if the folder already exists
    if (folderExists) {
      console.log(colors.red, `Folder ${folderName} already exists`);
    }
    else {
      await fs.mkdir(folderPath, { recursive: true });
      console.log(colors.green, `Folder ${folderName} created`);
    }
    // Move all the files to that new folder
    for (const file of files) {
      const filePath = path.join(pathFolder, file);
      const newFilePath = path.join(folderPath, file);
      await fs.rename(filePath, newFilePath)
        .then(() => console.log(colors.green, `Moved ${file} to ${folderName}`))
        .catch((error) => console.error(colors.red, `Error moving file ${file}:`, error));
    }
  }
}

export const getSubfoldersFiles = (files) => {
  const subfolders = {};
  for (const file of files) {
    // get extension
    const ext = path.extname(file).slice(1);
    // categorize each file by the extension
    for (const [folder, extensions] of Object.entries(CATEGORY_FOLDERS)) {
      if (extensions.includes(ext)) {
        if (!subfolders[folder]) {
          subfolders[folder] = [];
        }
        subfolders[folder].push(file);
        break;
      }
    }
  }
  return subfolders
}