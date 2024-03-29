let CLIENT = {};
let APP_SETTINGS = {};
let SUB_DOMAIN;

const ZDClient = {
  events: {
    ON_APP_REGISTERED(cb) {
      if (!CLIENT) {
        window.location.href = '/zendesk-custom-object-manager/';
      }
      return CLIENT.on('app.registered', async data => {
        SUB_DOMAIN = data.context.account.subdomain;
        APP_SETTINGS = data.metadata.settings;
        return cb(data);
      });
    },
  },

  init() {
    CLIENT = ZAFClient.init();
  },

  /**
   * Set getters for private objects
   */
  app: {
    get settings() {
      return APP_SETTINGS;
    },

    get domain() {
      return SUB_DOMAIN;
    },

    /**
     * It returns true if the app is installed in the instance, false if
     * it's running locally
     */
    get isProduction() {
      return !!this.settings.IS_PRODUCTION;
    },
  },

  /**
   * Calls ZAF Client.request()
   * @returns {Promise}
   */
  async request(url, data, options = {}) {
    return await CLIENT.request({
      url,
      data,
      cache: false,
      secure: APP_SETTINGS.IS_PRODUCTION,
      contentType: 'application/json',
      ...options,
    });
  },

  /**
   * Invoke Notification
   * @param {String} type
   * @param {String} message
   * @param {Number} durationInMs
   */
  notify(type = 'notice', message, durationInMs = 5000) {
    CLIENT.invoke('notify', message, type, durationInMs);
  },

  /**
   * Custom Object Operations
   * @returns {Object} Instance
   */
  customObject() {
    const instance = {};

    instance.objects = () => {
      return this.request(
        `/api/sunshine/objects/types`,
        {},
        {
          method: 'GET',
        },
      );
    };

    /**
     * API call to create record
     * @param {Object} payload
     */
    instance.create = payload => {
      return this.request('/api/sunshine/objects/records', JSON.stringify(payload), {
        method: 'POST',
      });
    };

    /**
     * API call to read "asset" records
     * Cursor pagination
     * @param {String} objectName
     * @param {Number} cursorUrl
     */
    instance.read = (objectName, cursorUrl = null, count = null) => {
      return this.request(
        cursorUrl
          ? cursorUrl
          : `/api/sunshine/objects/records?type=${objectName}&per_page=${
              count || this.app.settings.noOfRecords
            }&order=desc`,
        null,
        {
          method: 'GET',
        },
      );
    };

    /**
     * API call to update record
     * @param {Object} payload
     */
    instance.update = (id, payload) => {
      return this.request(`/api/sunshine/objects/records/${id}`, JSON.stringify(payload), {
        method: 'PATCH',
        contentType: 'application/merge-patch+json',
      });
    };

    /**
     * API call to delete record
     * @param {Object} payload
     */
    instance.delete = id => {
      return this.request(
        `/api/sunshine/objects/records/${id}`,
        {},
        {
          method: 'DELETE',
        },
      );
    };

    /**
     * API call to search records
     * @param {Object} payload
     */
    instance.search = (cursorUrl, payload) => {
      return this.request(
        cursorUrl ? cursorUrl : `/api/sunshine/objects/query?per_page=${this.app.settings.noOfRecords}&order=desc`,
        JSON.stringify(payload),
        {
          method: 'POST',
        },
      );
    };

    /**
     * API call to get relationship types
     * @param {Object} payload
     */
    instance.relationTypes = payload => {
      return this.request('/api/sunshine/relationships/types', JSON.stringify(payload), {
        method: 'GET',
      });
    };

    /**
     * API call to get relationship types
     * @param {Object} payload
     */
    instance.relationRecords = (relationshipName, cursorUrl = null, count = null) => {
      return this.request(
        cursorUrl
          ? cursorUrl
          : `/api/sunshine/relationships/records?type=${relationshipName}&per_page=${
              count || this.app.settings.noOfRecords
            }&order=desc`,
        {},
        {
          method: 'GET',
        },
      );
    };

    /**
     * API call to create record
     * @param {Object} payload
     */
    instance.createRelationshipRecord = payload => {
      return this.request('/api/sunshine/relationships/records', JSON.stringify(payload), {
        method: 'POST',
      });
    };

    /**
     * API call to delete record
     * @param {Object} payload
     */
    instance.deleteRelationshipRecord = id => {
      return this.request(
        `/api/sunshine/relationships/records/${id}`,
        {},
        {
          method: 'DELETE',
        },
      );
    };

    instance.createJob = (records, type, action) => {
      const requestData = {
        type: type,
        action: action,
        data: records,
      };
      return this.request('/api/sunshine/jobs', JSON.stringify(requestData), {
        method: 'POST',
      });
    };

    instance.getJobStatus = id => {
      return this.request(
        `/api/sunshine/jobs/${id}`,
        {},
        {
          method: 'GET',
        },
      );
    };

    return instance;
  },
};

export default ZDClient;
