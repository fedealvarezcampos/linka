const sharp = require('sharp');
const fs = require('fs').promises;
const UUID = require('uuid');
const path = require('path');
const AWS = require('aws-sdk');

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET } = process.env;

const uploadDir = path.join(__dirname, process.env.UPLOADPATH);

const uploadImages = async ({ file, dir, userAvatar }) => {
    AWS.config.update({
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccesskey: AWS_SECRET_ACCESS_KEY,
        region: AWS_REGION,
    });

    const imageName = `AV${UUID.v4()}.jpg`;

    const targetDir = path.join(uploadDir, dir);

    userAvatar && fs.unlink(targetDir + '/' + userAvatar);

    await fs.mkdir(targetDir, { recursive: true });

    const image = sharp(file.data);
    const imageInfo = await image.metadata();

    if (imageInfo.width > 500) {
        image.resize(500);
    }

    const finalImage = await image.toFormat('jpeg').toBuffer();
    await image.toFile(path.join(targetDir, imageName));

    const s3 = new AWS.S3();

    const params = {
        Bucket: S3_BUCKET,
        Key: `images/avatars/${imageName}`,
        Body: finalImage,
        Expires: 60,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
    };

    s3.upload(params, function (err) {
        if (err) {
            throw err;
        }
    });

    return imageName;
};

module.exports = {
    uploadImages,
};
