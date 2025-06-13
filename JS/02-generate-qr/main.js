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

async function getUserPreferences() {
  const preferences = await clack.group(
    {
      folderName: () => clack.text({
        message: 'What will be the name of the folder to save the QR code images?',
        placeholder: 'my-qr-codes...',
        validate: (value) => {
          const folderNameRegex = /^[a-zA-Z0-9_-]+$/;
          const isValidName = folderNameRegex.test(value)
          if (!isValidName) {
            return 'Please enter a valid name';
          }
        }
      }),
      numQrs: () => clack.text({
        message: 'How many QR codes do you want to generate?',
        initialValue: '1',
        validate: (value) => {
          const num = parseInt(value, 10);
          if (isNaN(num) || num < 1 || num > 10) {
            return 'Please enter a number between 1 and 10.';
          }
        },
      }),
      mode: () => clack.select({
        message: 'Choose a way to enter the URL(s)',
        options: [
          { value: 'one-by-one', label: 'One by one', hint: 'Perfect with less number of urls' },
          { value: 'all-in-one', label: 'All in one step' },
        ],
      })
    },
    {
      // On Cancel callback that wraps the group
      // So if the user cancels one of the prompts in the group this function will be called
      onCancel: ({ results }) => {
        clack.cancel('Operation cancelled.');
        process.exit(0);
      },
    }
  );

  // console.log(group.name, group.age, group.color);
  return preferences;
}

async function createQrCode({ dirPath, qrCodeContent, nameFile, isNeedFolder = false }) {
  try {
    if (isNeedFolder) {
      await fs.mkdir(dirPath)
    }
    const filePath = path.join(dirPath, `${nameFile}.png`);
    await fs.writeFile(filePath, qrCodeContent);
  } catch (error) {
    clack.log.error('Error creating the Qr code, check the name and try again')
  }
}

async function createCodesOneByOne({ numQrs = 1, folderName }) {

  for (let index = 0; index < numQrs; index += 1) {
    clack.log.step(`Please enter a valid URL to generate the QR code ${index + 1}.`);

    try {
      // Step 1 - Request the url
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
      const spinnerGen = clack.spinner();
      spinnerGen.start(`Generating QR code for ${url}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const qrCode = await generateQrCode(url);
      spinnerGen.stop(`QR code generated successfully! ✅`);

      // Step 3 - generate QR code successfully
      const shouldContinue = await clack.confirm({
        message: 'Do you want to save the QR code as image?',
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
      const folderPath = path.join(process.cwd(), folderName)
      const nameFileUrl = new URL(url)
      await createQrCode({
        dirPath: folderPath,
        qrCodeContent: qrCode,
        isNeedFolder: index === 0,
        nameFile: nameFileUrl.hostname
      })
      spinnerSave.stop(`QR code saved to ${folderPath}`);
      clack.log.success(`QR code saved successfully! ✅`);
      clack.log.message(`You can find your QR code image at: ${folderPath}`);
    } catch (error) {
      clack.cancel(`Error generating QR code: ${error.message}`);
      return;
    }
  }
}

async function createCodesInOneStep({ numQrs = 1, folderName }) {

  clack.log.step(`Please enter a list of URLS separated by comma to generate their QR codes`);
  try {
    // Step 1 - Request the url
    const urls = await clack.text({
      message: 'Enter a list of URLs separated by comma',
      placeholder: 'https://google.com, https://x.com',
      validate: (value) => {
        for (const url of value.split(',')) {
          if (!isValidUrl(url)) {
            return 'Please enter a valid URL list.';
          }
        }
      },
      onCancel: () => {
        clack.cancel('Operation cancelled by user.');
        process.exit(0);
      },
    });

    const urlList = urls.split(',')

    for (let index = 0; index < urlList.length; index += 1) {
      const url = urlList[index]
      // Step 2 - Pass the url to generate a qr and handle possible errors
      const spinnerGen = clack.spinner();
      spinnerGen.start(`Generating QR code for ${url}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const qrCode = await generateQrCode(url);
      spinnerGen.stop(`QR code for ${url} generated successfully! ✅`);

      //  Step 3 - Save the QR code image to a file
      const spinnerSave = clack.spinner();
      spinnerSave.start(`Saving QR code...`);

      // Add  a timeout to simulate a delay to save the file
      await new Promise(resolve => setTimeout(resolve, 2000));
      const folderPath = path.join(process.cwd(), folderName)
      const nameFileUrl = new URL(url)
      await createQrCode({
        dirPath: folderPath,
        qrCodeContent: qrCode,
        isNeedFolder: index === 0,
        nameFile: nameFileUrl.hostname
      })
      spinnerSave.stop(`QR code saved ✅`);
    }
    clack.log.success(`QR codes list created successfully in ${folderPath}! ✅`);
  } catch (error) {
    clack.cancel(`Error generating QR code: ${error.message}`);
    return;
  }
}

async function cliQrGen() {
  // Select preferences
  clack.log.step(`Select your preferences to generate QR codes of your Urls 👀`);
  const preferences = await getUserPreferences()

  // One by one process
  if (preferences.mode === 'one-by-one') {
    await createCodesOneByOne({
      folderName: preferences.folderName,
      numQrs: preferences.numQrs
    })
  } else {
    // One step process
    await createCodesInOneStep({
      folderName: preferences.folderName,
      numQrs: preferences.numQrs
    })
  }
}

async function main() {
  clack.intro(`Generate QR codes 🔨`);
  clack.log.message(`This tool will help you generate a QR code image from a URL.`);
  await cliQrGen()
  clack.outro(`Bye 👋!`);
}

main()