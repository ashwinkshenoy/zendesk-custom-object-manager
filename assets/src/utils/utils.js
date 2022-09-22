/**
 * Get date
 * @param {String} date - ISO format
 * @returns {String} Formatted Date
 */
const formatDate = date => {
  if (!date) return date;
  const today = new Date(date);
  let dd = today.getDate();
  const mm = today.getMonth() + 1;
  const yyyy = today.getFullYear();
  dd = dd < 10 ? `0${dd}` : dd;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[mm - 1]} ${dd}, ${yyyy}`;
};

/**
 * Format file Type
 * @param {String} value
 * @returns {String} File Name
 */
const fileType = value => {
  if (value.indexOf('image') >= 0) {
    return 'Image';
  }
  if (value.indexOf('text') >= 0) {
    return 'Text';
  }
  if (value.indexOf('pdf') >= 0) {
    return 'PDF';
  }
  return 'File';
};

/**
 * Format file size
 * @param {String} value
 * @returns {String} File Name
 */
const fileSize = num => {
  if (typeof num !== 'number' || isNaN(num)) {
    throw new TypeError('Expected a number');
  }
  let exponent;
  let unit;
  const neg = num < 0;
  const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  if (neg) {
    num = -num;
  }
  if (num < 1) {
    return (neg ? '-' : '') + num + ' B';
  }
  exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1);
  num = (num / Math.pow(1000, exponent)).toFixed(1) * 1;
  unit = units[exponent];
  return (neg ? '-' : '') + num + ' ' + unit;
};

export default {
  filters: {
    fileType,
    fileSize,
  },

  methods: {
    formatDate,
  },
};
