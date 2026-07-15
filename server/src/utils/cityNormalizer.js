const CITY_MAPPING = {
  // Abbreviations & aliases
  'hcm': 'Thành phố Hồ Chí Minh',
  'tp hcm': 'Thành phố Hồ Chí Minh',
  'tphcm': 'Thành phố Hồ Chí Minh',
  'sai gon': 'Thành phố Hồ Chí Minh',
  'saigon': 'Thành phố Hồ Chí Minh',
  'sg': 'Thành phố Hồ Chí Minh',
  'hn': 'Thành phố Hà Nội',
  'tphn': 'Thành phố Hà Nội',
  'ha noi': 'Thành phố Hà Nội',
  'dn': 'Thành phố Đà Nẵng',
  'da nang': 'Thành phố Đà Nẵng',
  'hp': 'Thành phố Hải Phòng',
  'hai phong': 'Thành phố Hải Phòng',
  'ct': 'Thành phố Cần Thơ',
  'can tho': 'Thành phố Cần Thơ',
  'vt': 'Tỉnh Bà Rịa - Vũng Tàu',
  'vung tau': 'Tỉnh Bà Rịa - Vũng Tàu',
  'bd': 'Tỉnh Bình Dương',
  'binh duong': 'Tỉnh Bình Dương',
  'dnai': 'Tỉnh Đồng Nai',
  'dong nai': 'Tỉnh Đồng Nai',
  
  // Merged / split historical provinces
  'ha tay': 'Thành phố Hà Nội',
  'song be': 'Tỉnh Bình Dương',
  'ha bac': 'Tỉnh Bắc Giang',
  'hai hung': 'Tỉnh Hải Dương',
  'vinh phu': 'Tỉnh Vĩnh Phúc',
  'ha nam ninh': 'Tỉnh Hà Nam',
  'quang nam da nang': 'Thành phố Đà Nẵng',
  'binh tri thien': 'Tỉnh Thừa Thiên Huế',
  'nghia binh': 'Tỉnh Bình Định',
  'thuan hai': 'Tỉnh Bình Thuận',
  'minh hai': 'Tỉnh Cà Mau',
  'cuu long': 'Tỉnh Vĩnh Long',
  'hau giang cu': 'Thành phố Cần Thơ',
  'hoang lien son': 'Tỉnh Lào Cai',
  'bac thai': 'Tỉnh Thái Nguyên',
  'cao lang': 'Tỉnh Lạng Sơn'
};

const PROVINCE_BASE_NAMES = {
  'ho chi minh': 'Thành phố Hồ Chí Minh',
  'ha noi': 'Thành phố Hà Nội',
  'da nang': 'Thành phố Đà Nẵng',
  'hai phong': 'Thành phố Hải Phòng',
  'can tho': 'Thành phố Cần Thơ',
  'an giang': 'Tỉnh An Giang',
  'ba ria vung tau': 'Tỉnh Bà Rịa - Vũng Tàu',
  'bac giang': 'Tỉnh Bắc Giang',
  'bac kan': 'Tỉnh Bắc Kạn',
  'bac lieu': 'Tỉnh Bạc Liêu',
  'bac ninh': 'Tỉnh Bắc Ninh',
  'ben tre': 'Tỉnh Bến Tre',
  'binh dinh': 'Tỉnh Bình Định',
  'binh duong': 'Tỉnh Bình Dương',
  'binh phuoc': 'Tỉnh Bình Phước',
  'binh thuan': 'Tỉnh Bình Thuận',
  'ca mau': 'Tỉnh Cà Mau',
  'cao bang': 'Tỉnh Cao Bằng',
  'dak lak': 'Tỉnh Đắk Lắk',
  'dak nong': 'Tỉnh Đắk Nông',
  'dien bien': 'Tỉnh Điện Biên',
  'dong nai': 'Tỉnh Đồng Nai',
  'dong thap': 'Tỉnh Đồng Tháp',
  'gia lai': 'Tỉnh Gia Lai',
  'ha giang': 'Tỉnh Hà Giang',
  'ha nam': 'Tỉnh Hà Nam',
  'ha tinh': 'Tỉnh Hà Tĩnh',
  'hai duong': 'Tỉnh Hải Dương',
  'hau giang': 'Tỉnh Hậu Giang',
  'hoa binh': 'Tỉnh Hòa Bình',
  'hung yen': 'Tỉnh Hưng Yên',
  'khanh hoa': 'Tỉnh Khánh Hòa',
  'kien giang': 'Tỉnh Kiên Giang',
  'kon tum': 'Tỉnh Kon Tum',
  'lai chau': 'Tỉnh Lai Châu',
  'lam dong': 'Tỉnh Lâm Đồng',
  'lang son': 'Tỉnh Lạng Sơn',
  'lao cai': 'Tỉnh Lào Cai',
  'long an': 'Tỉnh Long An',
  'nam dinh': 'Tỉnh Nam Định',
  'nghe an': 'Tỉnh Nghệ An',
  'ninh binh': 'Tỉnh Ninh Bình',
  'ninh thuan': 'Tỉnh Ninh Thuận',
  'phu tho': 'Tỉnh Phú Thọ',
  'phu yen': 'Tỉnh Phú Yên',
  'quang binh': 'Tỉnh Quảng Bình',
  'quang nam': 'Tỉnh Quảng Nam',
  'quang ngai': 'Tỉnh Quảng Ngãi',
  'quang ninh': 'Tỉnh Quảng Ninh',
  'quang tri': 'Tỉnh Quảng Trị',
  'soc trang': 'Tỉnh Sóc Trăng',
  'son la': 'Tỉnh Sơn La',
  'tay ninh': 'Tỉnh Tây Ninh',
  'thai binh': 'Tỉnh Thái Bình',
  'thai nguyen': 'Tỉnh Thái Nguyên',
  'thanh hoa': 'Tỉnh Thanh Hóa',
  'thua thien hue': 'Tỉnh Thừa Thiên Huế',
  'tien giang': 'Tỉnh Tiền Giang',
  'tra vinh': 'Tỉnh Trà Vinh',
  'tuyen quang': 'Tỉnh Tuyên Quang',
  'vinh long': 'Tỉnh Vĩnh Long',
  'vinh phuc': 'Tỉnh Vĩnh Phúc',
  'yen bai': 'Tỉnh Yên Bái'
};

function removeDiacritics(str) {
  if (!str) return '';
  return str.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase();
}

function normalizeCity(cityInput) {
  if (!cityInput) return null;
  
  // Clean input
  let cleaned = cityInput.trim().toLowerCase();
  
  // Remove diacritics for mapping search
  const normalizedInput = removeDiacritics(cleaned)
    .replace(/thanh pho/g, '')
    .replace(/tinh/g, '')
    .trim();
  
  // Check exact mapping first
  if (CITY_MAPPING[normalizedInput]) {
    return CITY_MAPPING[normalizedInput];
  }
  
  // Check base province names
  if (PROVINCE_BASE_NAMES[normalizedInput]) {
    return PROVINCE_BASE_NAMES[normalizedInput];
  }

  // Fuzzy check (e.g. contains part of the name)
  for (const [key, val] of Object.entries(PROVINCE_BASE_NAMES)) {
    if (key.includes(normalizedInput) || normalizedInput.includes(key)) {
      return val;
    }
  }

  return cityInput; // Fallback if no match
}

module.exports = {
  normalizeCity,
  removeDiacritics
};
