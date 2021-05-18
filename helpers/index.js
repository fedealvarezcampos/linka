const sharp = require('sharp');
const fs = require('fs').promises;
const UUID = require('uuid');
const path = require('path');

const uploadDir = path.join(__dirname, process.env.UPLOADPATH);

const uploadImages = async ({ file, dir }) => {
    const targetDir = path.join(uploadDir, dir);

    await fs.mkdir(targetDir, { recursive: true });

    const image = sharp(file.data);
    const imageInfo = await image.metadata();

    if (imageInfo.width > 500) {
        image.resize(500);
    }

    const imageName = `${UUID.v4()}.jpg`;

    await image.toFile(path.join(targetDir, imageName));

    return imageName;
};

module.exports = {
    uploadImages,
};
