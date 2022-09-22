import dictionary from './dictionary.js';

export default {
  install(Vue, options) {
    const RTL_LOCALES = ['ar', 'he'];
    Vue.prototype.$t = (key, replaceObject) => {
      const t = Vue.prototype.$locale
        ? dictionary[Vue.prototype.$locale] || dictionary[Vue.prototype.$locale.split('-')[0]] || dictionary['en']
        : dictionary['en'];
      let result = key.split('.').reduce((p, c) => (p && p[c]) || null, t) || '';
      if (replaceObject) {
        result = this.curlyFormat(result, replaceObject);
      }
      return result;
    };
    Vue.prototype.$rtl = () => {
      return RTL_LOCALES.indexOf(options.locale.toLowerCase()) > -1 ? 'rtl' : 'ltr';
    };
  },
  curlyFormat(str, context) {
    const regex = /{{\s?(.*?)\s?}}/g;
    const matches = [];
    let match;

    do {
      match = regex.exec(str);
      if (match) {
        matches.push(match);
      }
    } while (match);

    return matches.reduce((str, match) => {
      const newRegex = new RegExp(match[0], 'g');
      str = str.replace(newRegex, context[match[1]]);
      return str;
    }, str);
  },
};
