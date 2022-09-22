import App from './components/App.js';
import Store from './store/store.js';
import ZDClient from './services/ZDClient.js';
import i18n from './i18n/index.js';

Vue.use(i18n);

/**
 * Show Logs conditionally.
 * Errors will be shown by default.
 * @param {Object}
 */
const logger = data => {
  const DEBUG = data.metadata.settings.showLogs;
  if (!DEBUG) {
    if (!window.console) window.console = {};
    const methods = ['log', 'debug', 'warn', 'info'];
    for (let i = 0; i < methods.length; i++) {
      console[methods[i]] = function () {};
    }
  }
};

/**
 * Initialize Vue App
 * @param {Object} data
 */
const initVueApp = data => {
  logger(data);
  new Vue({
    el: '#app',
    store: Store,
    render: h => h(App),
  });
};

Vue.prototype.$emptyState = '----';
ZDClient.init();
ZDClient.events['ON_APP_REGISTERED'](initVueApp);
