export const slugify = (val) => {
  if (!val) return ''
  const accentsMap = {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a', 'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 'ô': 'o', 'ồ': 'o',
    'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u', 'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd', 'Đ': 'd'
  }

  // Thay thế tất cả các ký tự có dấu
  return String(val)
    .normalize('NFKD') // Chuyển đổi các ký tự có dấu thành dạng phân tách
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
    .replace(/[àáạảãâầấậẩẫèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/g, match => accentsMap[match] || match)
    .trim() // Loại bỏ khoảng trắng đầu và cuối
    .toLowerCase() // Chuyển thành chữ thường
    .replace(/[^a-z0-9 -]/g, '') // Loại bỏ các ký tự không phải chữ cái hoặc số
    .replace(/\s+/g, '-') // Thay thế khoảng trắng bằng dấu gạch nối
    .replace(/-+/g, '-') // Loại bỏ các dấu gạch nối liên tiếp
}
