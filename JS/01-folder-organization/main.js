/*
  Organize the files in the project folder into subfolders based on their file types.

  Steps:
  1. Create a function `organizeFiles` that takes a folder path as an argument.
  2. Use the `fs` module to read the contents of the folder. ✅
  3. For each file, determine its file type (e.g., images, documents, etc.). ✅
  4. Create a subfolder for each file type if it doesn't already exist.
  5. Move the file into the corresponding subfolder.
  6. Log the organized structure to the console.
  7. Handle any errors that may occur during file operations.
  8. Test the function with a sample folder containing various file types.
  9. Ensure the function is reusable for any folder path.
  10. Add comments to explain the code and its functionality.
  11. Use `async/await` for asynchronous operations.
  12. Use `try/catch` blocks to handle errors.
  13. Use `path` module to handle file paths.

  Node fns to use:
  - fs.readdir
  - fs.mkdir
  - fs.rename
  - path
*/

import fs from 'node:fs/promises';
import { getSubfoldersFiles, createNeededSubFolders, colors } from './utils.js';

async function organizeFolderFiles(pathFolder) {
  try {
    const files = await fs.readdir(pathFolder);
    const subfoldersByCategory = getSubfoldersFiles(files)
    createNeededSubFolders(subfoldersByCategory, pathFolder)
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  console.log('\x1b[32m%s\x1b[0m', 'Init reorganization...😎')
  const pathFolder = process.argv
    .slice(2)
    .find((arg) => arg.startsWith('--path='))
    ?.split('=')[1];

  if (!pathFolder) {
    console.error(colors.red, '\nPlease provide a folder path using --path= argument');
    process.exit(1);
  }
  console.log(`\nOrganizing files in folder: ${pathFolder}`);
  await organizeFolderFiles(pathFolder).then(() => console.log(colors.green, '\nFolder organized successfully'))
}

main()


