import os
import qrcode
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError

#configuration
SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
]
CREDENTIALS_FILE = 'credentials.json'
SPREADSHEET_ID = '13LqMKxO9_NHWupWPQa1g2qRtsE_l5pygLg-dJE5Jc_c'
HOJA = 'qrgen'
QR_FOLDER = 'qr_codes'

#create the folder if it doesn't exist
os.makedirs(QR_FOLDER, exist_ok=True)

#Auth
creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=SCOPES)
service = build('sheets', 'v4', credentials=creds)
drive_service = build('drive', 'v3', credentials=creds)
sheet = service.spreadsheets()

def generate_qr(link, filename):
    #generate a QR code and save it to a local file
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(link)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(filename)
    return filename


def upload_drive(file_path):
    # upload a file to Google Drive and return the public URL
    file_metadata = {
        'name': os.path.basename(file_path),
        'parents': ['root']
    }
    
    media = MediaFileUpload(file_path, mimetype='image/png')
    file = drive_service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id'
    ).execute()
    
    drive_service.permissions().create(
        fileId=file['id'],
        body={'type': 'anyone', 'role': 'reader'}
    ).execute()
    
    return f"https://drive.google.com/uc?export=view&id={file['id']}"

def insert_qr_sheet(fila, url_qr):
    #insert the QR code image into the Google Sheet
    formula = f'=IMAGE("{url_qr}")'
    
    service.spreadsheets().values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=f"{HOJA}!B{fila}",  # Colummn B, the same row as the link
        valueInputOption='USER_ENTERED',
        body={'values': [[formula]]}
    ).execute()

def procesar_links():
    try:
        # get all links from the Google Sheet
        result = service.spreadsheets().values().get(
            spreadsheetId=SPREADSHEET_ID,
            range=f"{HOJA}!A2:A"  # From row 2 in column A (assuming row 1 is header)
        ).execute()
        
        links = result.get('values', [])
        
        if not links:
            print("No se encontraron links para procesar")
            return
        
        print(f"Procesando {len(links)} links...")
        
        for i, row in enumerate(links, start=2):
            if not row or not row[0].strip():
                continue
                
            link = row[0].strip()
            print(f"Procesando fila {i}: {link[:50]}...")
            
            try:
                # 1. Generate QR code
                qr_filename = f"{QR_FOLDER}/qr_{i}.png"
                generate_qr(link, qr_filename)
                
                # 2. Upload to Google Drive
                public_url = upload_drive(qr_filename)
                
                # 3. Insert QR code into Google Sheet
                insert_qr_sheet(i, public_url)
                print(f"  QR insertado en columna B{i}")
                
            except Exception as e:
                print(f"  Error procesando fila {i}: {str(e)}")
        
        print("\n¡Proceso completado!")
        print(f"Los QR se guardaron localmente en: {os.path.abspath(QR_FOLDER)}")
        
    except HttpError as error:
        print(f"Error de Google API: {error}")

if __name__ == "__main__":    
    procesar_links()


