const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'C:\\Users\\03165\\.gemini\\antigravity\\brain\\907c9ea0-2299-45b8-965f-2d10af8a6c66\\media__1779355839707.png';

fs.createReadStream(imgPath)
  .pipe(new PNG())
  .on('parsed', function() {
    const width = this.width;
    const height = this.height;
    const xCoord = Math.floor(width / 2);
    
    const uniqueColors = new Set();
    const colorsList = [];
    
    for (let y = 0; y < height; y++) {
      const idx = (width * y + xCoord) << 2;
      const r = this.data[idx];
      const g = this.data[idx+1];
      const b = this.data[idx+2];
      const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
      if (!uniqueColors.has(hex)) {
        uniqueColors.add(hex);
        colorsList.push({ y, hex });
      }
    }
    
    console.log("Unique colors found:");
    colorsList.forEach(c => {
      console.log(`At y=${c.y}: ${c.hex}`);
    });
  });
