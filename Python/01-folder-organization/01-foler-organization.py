import os
import shutil
import sys

def organize_files(dir):
    # get this script to avoid try to move it
    myself = os.path.basename(sys.argv[0])

    #define the folders and extensions
    file_categories = {
        'images': (
            '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', 
            '.svg', '.webp', '.raw', '.ico'
        ),
        'videos': (
            '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv',
            '.webm', '.mpeg', '.mpg', '.3gp', '.m4v'
        ),
        'audio': (
            '.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma',
            '.m4a', '.mid', '.amr'
        ),
        'documents': (
            '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt',
            '.pptx', '.txt', '.rtf', '.odt', '.ods', '.csv'
        ),
        'code': (
            '.py', '.js', '.java', '.cpp', '.c', '.h',
            '.html', '.css', '.php', '.sh', '.bat', '.json',
            '.xml', '.sql'
        ),
        'archives': (
            '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'
        ),
        'executables': (
            '.exe', '.msi', '.dmg', '.apk', '.app', '.deb'
        ),
        'system': (
            '.dll', '.sys', '.ini', '.cfg', '.log'
        ),
        'fonts': (
            '.ttf', '.otf', '.woff', '.woff2', '.eot'
        ),
        'design': (
            '.ai', '.eps', '.indd', '.xd', '.sketch', '.fig', 'psd'
        ),
        'others': (
            '.torrent', '.tmp', '.bak'
        )
    }

    # create the folders if they don't exist
    for folder in file_categories.keys():
        folder_path = os.path.join(dir, folder)
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)

    # iterate over the files in the directory
    for file in os.listdir(dir):
        # skip this script
        if file == myself:
            continue

        file_path = os.path.join(dir, file)

        # check if it's a file
        if os.path.isfile(file_path):
            moved = False
            for folder, extensions in file_categories.items():
                if file.lower().endswith(extensions):
                    full_path = os.path.join(dir, folder, file)
                    # check if the file already exists in the destination
                    if os.path.exists(full_path):
                        #rename the file
                        base, ext = os.path.splitext(file)
                        counter = 1
                        while os.path.exists(full_path):
                            full_path = os.path.join(dir, folder, f"{base}_{counter}{ext}")
                            counter += 1
                    # move the file
                    shutil.move(file_path, full_path)
                    #print(f"Moved {file} to {folder}")
                    moved = True
                    break
            if not moved:
                #move to others
                full_path = os.path.join(dir, 'others', file)
                # check if the file already exists in the destination
                if os.path.exists(full_path):
                    #rename the file
                    base, ext = os.path.splitext(file)
                    counter = 1
                    while os.path.exists(full_path):
                        full_path = os.path.join(dir, 'others', f"{base}_{counter}{ext}")
                        counter += 1
                # move the file
                shutil.move(file_path, full_path)
                #print(f"Moved {file} to others")
    
    # remove empty folders
    for folder in file_categories.keys():
        folder_path = os.path.join(dir, folder)
        if os.path.exists(folder_path) and not os.listdir(folder_path):
            os.rmdir(folder_path)
            #print(f"Removed empty folder: {folder}")

if __name__ == "__main__":
    dir = os.getcwd()
    print(f"Organizing files in {dir}...")
    print(f"The actual script {os.path.basename(sys.argv[0])} will be ignored")
    
    organize_files(dir)

    print("Files organized successfully!")
    print("You can run this script in any folder to organize the files")
    print("""
    ╔══════════════════════════════════╗
    ║                                  ║
    ║       Created by: ASTRA          ║
    ║                                  ║
    ╚══════════════════════════════════╝
    """)