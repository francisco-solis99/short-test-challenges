import os
import qrcode
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

#configuration
SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
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
                #Generate QR code
                #name_link =
                qr_filename = f"{QR_FOLDER}/qr_{i}.png"
                generate_qr(link, qr_filename)
                
            except Exception as e:
                print(f"  Error procesando fila {i}: {str(e)}")
        
        print("\n¡Proceso completado!")
        print(f"Los QR se guardaron localmente en: {os.path.abspath(QR_FOLDER)}")
        
    except HttpError as error:
        print(f"Error de Google API: {error}")

if __name__ == "__main__":    
    procesar_links()


