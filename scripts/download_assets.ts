import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const SOUNDS_DIR = path.join(process.cwd(), 'public', 'sounds');

// Ensure public/sounds folder exists
if (!fs.existsSync(SOUNDS_DIR)) {
  fs.mkdirSync(SOUNDS_DIR, { recursive: true });
}

interface AssetToDownload {
  filename: string;
  urls: string[];
}

const assets: AssetToDownload[] = [
  {
    filename: 'campfire.mp3',
    urls: [
      'https://raw.githubusercontent.com/stu442/pomodoro-web/main/public/sounds/fireplace.mp3',
      'https://www.soundjay.com/nature/sounds/fire-1.mp3',
      'https://www.soundjay.com/nature/sounds/campfire-1.mp3'
    ]
  },
  {
    filename: 'rain.mp3',
    urls: [
      'https://raw.githubusercontent.com/stu442/pomodoro-web/main/public/sounds/rain.mp3',
      'https://www.soundjay.com/nature/sounds/rain-03.mp3',
      'https://www.soundjay.com/nature/sounds/rain-07.mp3'
    ]
  },
  {
    filename: 'lofi_classic.mp3',
    urls: [
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    ]
  }
];

function downloadFile(urls: string[], destPath: string, index = 0) {
  if (index >= urls.length) {
    console.error(`Failed to download asset to ${destPath} after trying all URLs.`);
    return;
  }

  const url = urls[index];
  console.log(`Trying to download ${url} -> ${destPath}`);

  https.get(url, (res) => {
    if (res.statusCode === 200) {
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Successfully downloaded ${destPath}`);
      });
    } else {
      console.warn(`URL ${url} returned status ${res.statusCode}. Trying next...`);
      downloadFile(urls, destPath, index + 1);
    }
  }).on('error', (err) => {
    console.warn(`Error downloading from ${url}: ${err.message}. Trying next...`);
    downloadFile(urls, destPath, index + 1);
  });
}

// Start download
assets.forEach(asset => {
  const dest = path.join(SOUNDS_DIR, asset.filename);
  downloadFile(asset.urls, dest);
});
