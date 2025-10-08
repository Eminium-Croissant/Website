const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// A function to walk through all directories and files
const walkDir = (dir, callback) => {
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
};

// Start the conversion process
const convertPngToAvif = async (directory) => {
  console.log(`Starting conversion in: ${directory}`);

  walkDir(directory, async (filePath) => {
    if (filePath.toLowerCase().endsWith(".png") || filePath.toLowerCase().endsWith(".jpg") || filePath.toLowerCase().endsWith(".jpeg") || filePath.toLowerCase().endsWith(".webp")) {
      const avifPath = path.join(path.dirname(filePath), `${path.parse(filePath).name}.avif`);

      try {
        // Convert the PNG to AVIF and save the new file
        await sharp(filePath)
          .avif({ quality: 80 }) // Set the quality (0-100)
          .toFile(avifPath);

        // Delete the original PNG file
        fs.unlinkSync(filePath);
        console.log(`Converted and replaced: ${filePath} -> ${avifPath}`);
      } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
      }
    }
  });
};

// Specify the directory to start from
const startingDirectory = "./uploads";
convertPngToAvif(startingDirectory);
