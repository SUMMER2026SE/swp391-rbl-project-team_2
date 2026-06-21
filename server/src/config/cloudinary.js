const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'rental_rooms',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

module.exports = {
  cloudinary,
  storage,
};
