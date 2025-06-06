/**
  Generate a qr image code by url using clack prompt application library

  Steps:
  1. Create a function `generateQrCode` that takes a URL as an argument.
  2. Use the `clack` library to prompt the user for a URL input.
  3. Validate the URL input to ensure it is a valid URL format.
  4. Use the `qrcode` library to generate a QR code image from the URL.
  5. Save the generated QR code image to a file.
  6. Log the success message to the console with the file path of the saved QR code image.
  7. Handle any errors that may occur during the QR code generation or file saving process.
  8. Test the function with various URL inputs to ensure it works correctly.
  9. Ensure the function is reusable for any valid URL input.
  10. Add comments to explain the code and its functionality.

  Node fns to use:
  - clack.prompt
  - qrcode
  - fs.writeFile
  - path

 */


import path from 'node:path';
import fs from 'node:fs/promises';
import * as clack from '@clack/prompts';
import QRCode from 'qrcode'

async function generateQrCode(url) {
  try {
    // Generate QR code as a PNG image
    const qrCodeImage = await QRCode.toBuffer(url, { type: 'png' });
    return qrCodeImage;
  } catch (error) {
    clack.log.error(`Failed to generate QR code: ${error.message}`);
    throw error;
  }

}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}



async function main() {
  clack.intro(`Generate QR codes 🔨`);
  clack.log.message(`This tool will help you generate a QR code image from a URL.`);

  // Step 0 - Request num of qr to generate
  const numOfQr = await clack.text({
    message: 'How many QR codes do you want to generate?',
    initialValue: '1',
    validate: (value) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 1 || num > 10) {
        return 'Please enter a number between 1 and 10.';
      }
    },
    onCancel: () => {
      clack.cancel('Operation cancelled by user ❌');
      process.exit(0);
    },
  });

  for (let index = 0; index < numOfQr; index++) {
    // Step 1 - Request the url
    clack.log.step(`Please enter a valid URL to generate the QR code ${index + 1}.`);
    const url = await clack.text({
      message: 'Enter a valid URL',
      placeholder: 'https://google.com',
      validate: (value) => {
        if (!isValidUrl(value)) {
          return 'Please enter a valid URL.';
        }
      },
      onCancel: () => {
        clack.cancel('Operation cancelled by user.');
        process.exit(0);
      },
    });

    // Step 2 - Pass the url to generate a qr and handle possible errors
    try {
      const spinnerGen = clack.spinner();
      spinnerGen.start(`Generating QR code for ${url}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const qrCode = await generateQrCode(url);
      spinnerGen.stop(`QR code generated successfully!`);

      // Step 3 - generate QR code successfully
      const shouldContinue = await clack.confirm({
        message: 'Do you want to save the QR code?',
      });

      if (!shouldContinue) {
        clack.cancel('QR code generation cancelled by user.');
        return;
      }

      //  Step 4 - Save the QR code image to a file
      const spinnerSave = clack.spinner();
      spinnerSave.start(`Saving QR code...`);

      // Add  a timeout to simulate a delay to save the file
      await new Promise(resolve => setTimeout(resolve, 2000));
      const filePath = path.join(process.cwd(), `qr-code-${index + 1}.png`);
      await fs.writeFile(filePath, qrCode);
      spinnerSave.stop(`QR code saved to ${filePath}`);
      clack.log.success(`QR code saved successfully!`);
      clack.log.message(`You can find your QR code image at: ${filePath}`);
    } catch (error) {
      clack.cancel(`Error generating QR code: ${error.message}`);
      return;
    }
  }

  clack.outro(`Bye 👋!`);
}

main()