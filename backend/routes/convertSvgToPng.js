const { storage } = require('./firebaseConfig.js');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { createCanvas, loadImage } = require('canvas');
const { DOMParser } = require('xmldom');


const convertSvgToPngAndUpload = async (svgString, fileName) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Parse the SVG to extract width and height
      const svgDoc = new DOMParser().parseFromString(svgString, 'image/svg+xml');
      let width = parseFloat(svgDoc.documentElement.getAttribute('width'));
      let height = parseFloat(svgDoc.documentElement.getAttribute('height'));

      if (isNaN(width) || isNaN(height)) {
        const viewBox = svgDoc.documentElement.getAttribute('viewBox');
        if (viewBox) {
          const [, , viewWidth, viewHeight] = viewBox.split(' ').map(Number);
          width = viewWidth || 500;
          height = viewHeight || 500;
        } else {
          width = 500;
          height = 500;
        }
      }

      // Load SVG as image
      const image = await loadImage('data:image/svg+xml;base64,' + Buffer.from(svgString).toString('base64'));

      // Create Canvas and Draw Image
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, width, height);

      const buffer = canvas.toBuffer('image/png');

      // Upload to Firebase Storage
      const storageRef = ref(storage, `draw/${fileName}`);
      const metadata = { contentType: 'image/png' };

      await uploadBytes(storageRef, buffer, metadata);
      const downloadURL = await getDownloadURL(storageRef);
      resolve(downloadURL);
    } catch (error) {
      reject(`Error uploading file: ${error}`);
    }
  });
};


module.exports = { convertSvgToPngAndUpload };
