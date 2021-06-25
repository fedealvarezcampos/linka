const sharp = require('sharp');
const fs = require('fs').promises;
const UUID = require('uuid');
const path = require('path');
const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: 'AWSAccessKeyId', // Access key ID
    secretAccesskey: 'AWSSecretKey', // Secret access key
    region: 'eu-west-3', //Region
});

const uploadDir = path.join(__dirname, process.env.UPLOADPATH);

const uploadImages = async ({ file, dir, userAvatar }) => {
    const targetDir = path.join(uploadDir, dir);

    userAvatar && fs.unlink(targetDir + '/' + userAvatar);

    await fs.mkdir(targetDir, { recursive: true });

    const image = sharp(file.data);
    const imageInfo = await image.metadata();

    if (imageInfo.width > 500) {
        image.resize(500);
    }

    const imageName = `AV${UUID.v4()}.jpg`;

    await image.toFile(path.join(targetDir, imageName));
    console.log(file);

    const s3 = new AWS.S3();

    const awsParams = {
        Bucket: 'AWSBUCKETNAME',
        Key: imageName, // File name you want to save as in S3
        Body: file,
    };

    s3.upload(awsParams);

    return imageName;
};

module.exports = {
    uploadImages,
};
