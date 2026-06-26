require('dotenv').config();
const { cloudinary } = require('./src/config/cloudinary');

console.log(cloudinary ? 'Cloudinary loaded' : 'Cloudinary failed');
if (cloudinary && cloudinary.uploader) {
  console.log('uploader present');
} else {
  console.log('uploader missing');
}
