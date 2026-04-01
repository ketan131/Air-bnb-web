const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


cloudinary.config({
  cloud_name: process.env.Cloud_NAME,
  api_key: process.env.Cloud_API_KEY,
  api_secret: process.env.Cloud_API_SECRET
});

const storage =  new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'WanderLust_DEV',
        allowedFormats: [ "png","jpg", "jpeg"],
    },
});

module.exports = {
    cloudinary,
    storage,
};