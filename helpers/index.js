const sharp = require('sharp');
const fs = require('fs').promises;
const UUID = require('uuid');
const path = require('path');
const AWS = require('aws-sdk');

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET } = process.env;

const uploadDir = path.join(__dirname, process.env.UPLOADPATH);

// const uploadImages = async ({ file, dir, userAvatar }) => {
//     const targetDir = path.join(uploadDir, dir);

//     userAvatar && fs.unlink(targetDir + '/' + userAvatar);

//     await fs.mkdir(targetDir, { recursive: true });

//     const image = sharp(file.data);
//     const imageInfo = await image.metadata();

//     if (imageInfo.width > 500) {
//         image.resize(500);
//     }

//     const imageName = `AV${UUID.v4()}.jpg`;

//     await image.toFile(path.join(targetDir, imageName));

//     return imageName;
// };

async function uploadToS3(req, res, next) {
    try {
        AWS.config.update({
            accessKeyId: AWS_ACCESS_KEY_ID, // Access key ID
            secretAccesskey: AWS_SECRET_ACCESS_KEY, // Secret access key
            region: AWS_REGION, //Region
        });

        const s3 = new AWS.S3();

        console.log(s3);

        const fileContent = Buffer.from(req.files.avatar.data);
        console.log(fileContent);

        const params = {
            Bucket: S3_BUCKET,
            Key: `AV${UUID.v4()}.jpg`, // File name you want to save as in S3
            Body: fileContent,
            Expires: 60,
            ContentType: 'image/jpeg',
            ACL: 'public-read',
        };

        // Uploading files to the bucket
        s3.upload(params, function (err) {
            if (err) {
                throw err;
            }
        });

        next();
    } catch (err) {
        next(err);
    }
}

module.exports = {
    uploadImages,
    uploadToS3,
};
