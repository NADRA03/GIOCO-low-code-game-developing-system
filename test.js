// test.js

const { convertSvgToPngAndUpload } = require('./backend/routes/convertSvgToPng.js');

// Sample SVG string (replace this with your actual SVG content)
const svgString = `
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
</svg>
`;

const fileName = 'test-image.png'; // You can specify the name you want to save in Firebase

// Call the function to convert SVG and upload it to Firebase
convertSvgToPngAndUpload(svgString, fileName)
  .then(url => {
    // On success, print the download URL of the uploaded PNG image
    console.log('File uploaded successfully. Download URL:', url);
  })
  .catch(err => {
    // On error, print the error message
    console.error('Error uploading file:', err);
  });