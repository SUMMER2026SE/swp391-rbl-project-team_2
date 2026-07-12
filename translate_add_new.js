const fs = require('fs');

let file = './client/src/features/landlord/pages/AddNewPropertyPage.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('useTranslation')) {
    content = content.replace("import React", "import { useTranslation } from 'react-i18next';\nimport React");
}

if (!content.includes('const { t } = useTranslation();')) {
    content = content.replace("const AddNewPropertyPage = () => {", "const AddNewPropertyPage = () => {\n  const { t } = useTranslation();");
}

const replacements = [
  ['>Add New Listing<', `>{t('addNewProperty.mainTitle', 'Add New Listing')}<`],
  ['>Provide detailed information to attract the right tenants.<', `>{t('addNewProperty.mainSubtitle', 'Provide detailed information to attract the right tenants.')}<`],
  ['>1. Basic Info<', `>{t('addNewProperty.step1', '1. Basic Info')}<`],
  ['>2. Location &amp; Price<', `>{t('addNewProperty.step2', '2. Location & Price')}<`],
  ['>3. Amenities &amp; Photos<', `>{t('addNewProperty.step3', '3. Amenities & Photos')}<`],
  ['>Basic Information<', `>{t('addNewProperty.step1Title', 'Basic Information')}<`],
  ['>Start with the essential details of the property.<', `>{t('addNewProperty.step1Subtitle', 'Start with the essential details of the property.')}<`],
  ['>Listing Title <', `>{t('addNewProperty.listingTitle', 'Listing Title')} <`],
  ['placeholder="e.g. Spacious Studio in Downtown"', `placeholder={t('addNewProperty.listingTitlePlaceholder', 'e.g. Spacious Studio in Downtown')}`],
  ['>Room Number<', `>{t('addNewProperty.roomNumber', 'Room Number')}<`],
  ['placeholder="e.g. 101, A2"', `placeholder={t('addNewProperty.roomNumberPlaceholder', 'e.g. 101, A2')}`],
  ['>Property Description <', `>{t('addNewProperty.propertyDescription', 'Property Description')} <`],
  ['placeholder="Describe the property\'s key features, atmosphere, and neighborhood..."', `placeholder={t('addNewProperty.propertyDescriptionPlaceholder', "Describe the property's key features, atmosphere, and neighborhood...")}`],
  ['>Size (m<sup>2</sup>)<', `>{t('addNewProperty.size', 'Size')} (m<sup>2</sup>)<`],
  ['placeholder="e.g. 25"', `placeholder={t('addNewProperty.sizePlaceholder', 'e.g. 25')}`],
  ['>Max Occupants <', `>{t('addNewProperty.maxOccupants', 'Max Occupants')} <`],
  ['>Select Max Occupants<', `>{t('addNewProperty.selectMaxOccupants', 'Select Max Occupants')}<`],
  ['>Location &amp; Price<', `>{t('addNewProperty.step2Title', 'Location & Price')}<`],
  ['>Specify where your rental is situated and set your pricing.<', `>{t('addNewProperty.step2Subtitle', 'Specify where your rental is situated and set your pricing.')}<`],
  ['>The address is automatically inherited from the parent property.<', `>{t('addNewProperty.inheritedAddress', 'The address is automatically inherited from the parent property.')}<`],
  ['>Street Address <', `>{t('addNewProperty.streetAddress', 'Street Address')} <`],
  ['placeholder="e.g., 123 Nguyen Van Linh St"', `placeholder={t('addNewProperty.streetAddressPlaceholder', 'e.g., 123 Nguyen Van Linh St')}`],
  ['>City/ Province <', `>{t('addNewProperty.cityProvince', 'City/ Province')} <`],
  ['>Select City / Province<', `>{t('addNewProperty.selectCityProvince', 'Select City / Province')}<`],
  ['>District / Ward <', `>{t('addNewProperty.districtWard', 'District / Ward')} <`],
  ['>Select District / Ward<', `>{t('addNewProperty.selectDistrictWard', 'Select District / Ward')}<`],
  ['>Monthly Rent (VNĐ) <', `>{t('addNewProperty.monthlyRent', 'Monthly Rent (VNĐ)')} <`],
  ['>Amenities &amp; Photos<', `>{t('addNewProperty.step3Title', 'Amenities & Photos')}<`],
  ['>Select features and upload high-quality images of your property.<', `>{t('addNewProperty.step3Subtitle', 'Select features and upload high-quality images of your property.')}<`],
  ['>Room Amenities<', `>{t('addNewProperty.roomAmenities', 'Room Amenities')}<`],
  ['>Nearby Amenities<', `>{t('addNewProperty.nearbyAmenities', 'Nearby Amenities')}<`],
  ['>Property Photos<', `>{t('addNewProperty.propertyPhotos', 'Property Photos')}<`],
  ['>Click to upload<', `>{t('addNewProperty.clickToUpload', 'Click to upload')}<`],
  ['> or drag and drop<', `> {t('addNewProperty.orDragAndDrop', 'or drag and drop')}<`],
  ['>PNG, JPG, JPEG up to 10MB<', `>{t('addNewProperty.uploadLimitInfo', 'PNG, JPG, JPEG up to 10MB')}<`],
  ['>Uploaded Images ({formData.images.length})<', `>{t('addNewProperty.uploadedImages', 'Uploaded Images')} ({formData.images.length})<`],
  ['>Cover<', `>{t('addNewProperty.cover', 'Cover')}<`],
  ['>Save Draft<', `>{t('addNewProperty.saveDraft', 'Save Draft')}<`],
  ['>Back<', `>{t('addNewProperty.back', 'Back')}<`],
  ['>Next Step<', `>{t('addNewProperty.nextStep', 'Next Step')}<`],
  ['>Publish Listing<', `>{t('addNewProperty.publishListing', 'Publish Listing')}<`],
  ['>Listing Published!<', `>{t('addNewProperty.successTitle', 'Listing Published!')}<`],
  ['>Your new room listing has been successfully published and is now visible to potential tenants.<', `>{t('addNewProperty.successMessage', 'Your new room listing has been successfully published and is now visible to potential tenants.')}<`],
  ['>Go to Listings<', `>{t('addNewProperty.goToListings', 'Go to Listings')}<`]
];

for (const [find, replace] of replacements) {
    content = content.replace(find, replace);
}

content = content.replace(/{ id: 'wifi', label: 'WiFi'/g, "{ id: 'wifi', label: t('amenity.wifi', 'WiFi')");
content = content.replace(/{ id: 'airConditioner', label: 'Air Conditioner'/g, "{ id: 'airConditioner', label: t('amenity.airConditioner', 'Air Conditioner')");
content = content.replace(/{ id: 'parking', label: 'Parking'/g, "{ id: 'parking', label: t('amenity.parking', 'Parking')");
content = content.replace(/{ id: 'privateBathroom', label: 'Private Bathroom'/g, "{ id: 'privateBathroom', label: t('amenity.privateBathroom', 'Private Bathroom')");
content = content.replace(/{ id: 'balcony', label: 'Balcony'/g, "{ id: 'balcony', label: t('amenity.balcony', 'Balcony')");
content = content.replace(/{ id: 'bed', label: 'Bed'/g, "{ id: 'bed', label: t('amenity.bed', 'Bed')");
content = content.replace(/{ id: 'wardrobe', label: 'Wardrobe'/g, "{ id: 'wardrobe', label: t('amenity.wardrobe', 'Wardrobe')");
content = content.replace(/{ id: 'kitchen', label: 'Kitchen'/g, "{ id: 'kitchen', label: t('amenity.kitchen', 'Kitchen')");
content = content.replace(/{ id: 'securityCamera', label: 'Security Camera'/g, "{ id: 'securityCamera', label: t('amenity.securityCamera', 'Security Camera')");
content = content.replace(/{ id: 'nearUniversity', label: 'Near University'/g, "{ id: 'nearUniversity', label: t('amenity.nearUniversity', 'Near University')");
content = content.replace(/{ id: 'nearHospital', label: 'Near Hospital'/g, "{ id: 'nearHospital', label: t('amenity.nearHospital', 'Near Hospital')");
content = content.replace(/{ id: 'nearSupermarket', label: 'Near Supermarket'/g, "{ id: 'nearSupermarket', label: t('amenity.nearSupermarket', 'Near Supermarket')");
content = content.replace(/{ id: 'nearBusStation', label: 'Near Bus Station'/g, "{ id: 'nearBusStation', label: t('amenity.nearBusStation', 'Near Bus Station')");
content = content.replace(/{ id: 'nearMarket', label: 'Near Market'/g, "{ id: 'nearMarket', label: t('amenity.nearMarket', 'Near Market')");
content = content.replace(/{ id: 'nearPark', label: 'Near Park'/g, "{ id: 'nearPark', label: t('amenity.nearPark', 'Near Park')");
content = content.replace(/{ id: 'nearConvenienceStore', label: 'Near Convenience Store'/g, "{ id: 'nearConvenienceStore', label: t('amenity.nearConvenienceStore', 'Near Convenience Store')");

fs.writeFileSync(file, content);
console.log('JSX updated');

const viPath = './client/src/locales/vi.json';
const vi = JSON.parse(fs.readFileSync(viPath, 'utf8'));

vi.addNewProperty = {
  mainTitle: 'Thêm phòng/chỗ ở mới',
  mainSubtitle: 'Cung cấp thông tin chi tiết để thu hút người thuê phù hợp.',
  step1: '1. Thông tin cơ bản',
  step2: '2. Vị trí & Giá',
  step3: '3. Tiện ích & Ảnh',
  step1Title: 'Thông tin cơ bản',
  step1Subtitle: 'Bắt đầu với các chi tiết cần thiết của chỗ ở.',
  listingTitle: 'Tiêu đề phòng',
  listingTitlePlaceholder: 'VD: Phòng khép kín rộng rãi ở trung tâm',
  roomNumber: 'Số phòng (không bắt buộc)',
  roomNumberPlaceholder: 'VD: 101, A2',
  propertyDescription: 'Mô tả chi tiết',
  propertyDescriptionPlaceholder: 'Mô tả các tính năng chính, không không gian và môi trường xung quanh...',
  size: 'Diện tích',
  sizePlaceholder: 'VD: 25',
  maxOccupants: 'Số người tối đa',
  selectMaxOccupants: 'Chọn số người tối đa',
  step2Title: 'Vị trí & Giá',
  step2Subtitle: 'Xác định vị trí phòng thuê của bạn và thiết lập giá.',
  inheritedAddress: 'Địa chỉ được tự động kế thừa từ thông tin khu trọ chính.',
  streetAddress: 'Địa chỉ chi tiết (Số nhà, đường)',
  streetAddressPlaceholder: 'VD: 123 Nguyễn Văn Linh',
  cityProvince: 'Tỉnh / Thành phố',
  selectCityProvince: 'Chọn Tỉnh / Thành phố',
  districtWard: 'Quận / Huyện',
  selectDistrictWard: 'Chọn Quận / Huyện',
  monthlyRent: 'Giá thuê hàng tháng (VNĐ)',
  step3Title: 'Tiện ích & Ảnh',
  step3Subtitle: 'Chọn các tiện nghi và tải lên hình ảnh chất lượng cao cho phòng.',
  roomAmenities: 'Tiện nghi trong phòng',
  nearbyAmenities: 'Tiện ích xung quanh',
  propertyPhotos: 'Hình ảnh phòng',
  clickToUpload: 'Nhấn để tải lên',
  orDragAndDrop: 'hoặc kéo thả vào đây',
  uploadLimitInfo: 'PNG, JPG, JPEG (tối đa 10MB)',
  uploadedImages: 'Ảnh đã tải lên',
  cover: 'Ảnh bìa',
  saveDraft: 'Lưu nháp',
  back: 'Quay lại',
  nextStep: 'Bước tiếp theo',
  publishListing: 'Đăng phòng',
  successTitle: 'Đã đăng phòng thành công!',
  successMessage: 'Phòng mới của bạn đã được đăng thành công và hiện có thể được nhìn thấy bởi những người thuê tiềm năng.',
  goToListings: 'Đi đến Danh sách phòng'
};

vi.amenity = vi.amenity || {};
Object.assign(vi.amenity, {
  wifi: 'WiFi',
  airConditioner: 'Điều hòa',
  parking: 'Chỗ để xe',
  privateBathroom: 'Phòng tắm riêng',
  balcony: 'Ban công',
  bed: 'Giường',
  wardrobe: 'Tủ quần áo',
  kitchen: 'Khu vực bếp',
  securityCamera: 'Camera an ninh',
  nearUniversity: 'Gần trường đại học',
  nearHospital: 'Gần bệnh viện',
  nearSupermarket: 'Gần siêu thị',
  nearBusStation: 'Gần trạm xe buýt',
  nearMarket: 'Gần chợ',
  nearPark: 'Gần công viên',
  nearConvenienceStore: 'Gần cửa hàng tiện lợi'
});

fs.writeFileSync(viPath, JSON.stringify(vi, null, 2));

const enPath = './client/src/locales/en.json';
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

en.addNewProperty = {
  mainTitle: 'Add New Listing',
  mainSubtitle: 'Provide detailed information to attract the right tenants.',
  step1: '1. Basic Info',
  step2: '2. Location & Price',
  step3: '3. Amenities & Photos',
  step1Title: 'Basic Information',
  step1Subtitle: 'Start with the essential details of the property.',
  listingTitle: 'Listing Title',
  listingTitlePlaceholder: 'e.g. Spacious Studio in Downtown',
  roomNumber: 'Room Number',
  roomNumberPlaceholder: 'e.g. 101, A2',
  propertyDescription: 'Property Description',
  propertyDescriptionPlaceholder: "Describe the property's key features, atmosphere, and neighborhood...",
  size: 'Size',
  sizePlaceholder: 'e.g. 25',
  maxOccupants: 'Max Occupants',
  selectMaxOccupants: 'Select Max Occupants',
  step2Title: 'Location & Price',
  step2Subtitle: 'Specify where your rental is situated and set your pricing.',
  inheritedAddress: 'The address is automatically inherited from the parent property.',
  streetAddress: 'Street Address',
  streetAddressPlaceholder: 'e.g., 123 Nguyen Van Linh St',
  cityProvince: 'City/ Province',
  selectCityProvince: 'Select City / Province',
  districtWard: 'District / Ward',
  selectDistrictWard: 'Select District / Ward',
  monthlyRent: 'Monthly Rent (VNĐ)',
  step3Title: 'Amenities & Photos',
  step3Subtitle: 'Select features and upload high-quality images of your property.',
  roomAmenities: 'Room Amenities',
  nearbyAmenities: 'Nearby Amenities',
  propertyPhotos: 'Property Photos',
  clickToUpload: 'Click to upload',
  orDragAndDrop: 'or drag and drop',
  uploadLimitInfo: 'PNG, JPG, JPEG up to 10MB',
  uploadedImages: 'Uploaded Images',
  cover: 'Cover',
  saveDraft: 'Save Draft',
  back: 'Back',
  nextStep: 'Next Step',
  publishListing: 'Publish Listing',
  successTitle: 'Listing Published!',
  successMessage: 'Your new room listing has been successfully published and is now visible to potential tenants.',
  goToListings: 'Go to Listings'
};

en.amenity = en.amenity || {};
Object.assign(en.amenity, {
  wifi: 'WiFi',
  airConditioner: 'Air Conditioner',
  parking: 'Parking',
  privateBathroom: 'Private Bathroom',
  balcony: 'Balcony',
  bed: 'Bed',
  wardrobe: 'Wardrobe',
  kitchen: 'Kitchen',
  securityCamera: 'Security Camera',
  nearUniversity: 'Near University',
  nearHospital: 'Near Hospital',
  nearSupermarket: 'Near Supermarket',
  nearBusStation: 'Near Bus Station',
  nearMarket: 'Near Market',
  nearPark: 'Near Park',
  nearConvenienceStore: 'Near Convenience Store'
});

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));

console.log('Locales updated');
