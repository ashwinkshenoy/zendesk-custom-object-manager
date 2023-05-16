const template = `
<span v-if="objectTableState==='DataFound'">
  <!--Download CSV-->
  <vs-button size="small" @click="processCsv" class="u-mr-sm" data-name="ZD: Download CSV">
    <garden-icon icon="zd-download" class="download-icon">
    </garden-icon>
    Download as CSV
  </vs-button>

   <!--Delete Record Modal-->
   <vs-modal
    ref="downloadModal"
    size="m"
    dismiss-on="close-button esc"
    remove-header
    remove-close-button
    align-top>
    <div class="u-ta-center modal-content">
      <img src="./images/IconDelete.svg" alt="Trash" class="modal-img">
      <h1>Please wait while we process your download.</h1>
      <p class="u-mb">Don't close this window.</p>
    </div>
  </vs-modal>
</span>
`;

import GardenIcon from '../Common/GardenIcon.js';
import ZDClient from '../../services/ZDClient.js';

const ObjectRecordSearch = {
  template,

  components: {
    GardenIcon,
  },

  computed: {
    ...Vuex.mapGetters(['selectedObjectType', 'schema', 'objectTableState']),

    filteredColumns() {
      return Object.entries(this.schema).map(([key, value], item) => {
        return key;
      });
    },
  },

  methods: {
    async processCsv() {
      this.$refs['downloadModal'].open();
      const records = await this.paginatedFetch(this.selectedObjectType);
      const csvContent = await this.generateCSV(records);
      this.download(csvContent, `custom_object_${this.selectedObjectType}.csv`, 'text/csv;encoding:utf-8');
      this.$refs['downloadModal'].close();
    },

    /**
     * Recursive do API fetch based on 'next_page' cursor key
     * @param {String} selectedObjectType
     * @param {String} cursor
     * @param {Array} previousResponse
     * @returns {Array}
     */
    async paginatedFetch(selectedObjectType, cursor = null, previousResponse = []) {
      try {
        const response = await ZDClient.customObject().read(this.selectedObjectType, cursor, 1000);
        const data = [...previousResponse, ...response.data];
        if (!!response.links.next) {
          return await this.paginatedFetch(selectedObjectType, response.links.next, data);
        }
        return data;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Generate CSV
     * @param {String} records
     * @returns {String} CSV
     */
    generateCSV(records) {
      const columnHeaders = [...this.filteredColumns, 'created_at', 'id'].sort();
      let allRecords = records.map(item => {
        return { id: item.id, created_at: item.created_at, ...item.attributes };
      });
      let propsToArray = function (keys) {
        return function (obj) {
          return keys.map(key => {
            if (typeof obj[key] === 'string') {
              return `"${obj[key]}"`;
            } else if (typeof obj[key] === 'object') {
              return `'"${obj[key]}"'`;
            } else {
              return obj[key];
            }
          });
        };
      };
      let orderToArray = propsToArray(columnHeaders);
      const csvString = [columnHeaders, ...allRecords.map(orderToArray)].map(e => e.join(',')).join('\n');
      return csvString;
    },

    /**
     * Download CSV File
     * @param {String} csvContent
     * @param {String} fileName
     * @param {String} mimeType
     */
    download(content, fileName, mimeType) {
      var a = document.createElement('a');
      mimeType = mimeType || 'application/octet-stream';

      if (navigator.msSaveBlob) {
        // IE10
        navigator.msSaveBlob(
          new Blob([content], {
            type: mimeType,
          }),
          fileName,
        );
      } else if (URL && 'download' in a) {
        //html5 A[download]
        a.href = URL.createObjectURL(
          new Blob([content], {
            type: mimeType,
          }),
        );
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
      }
    },
  },
};

export default ObjectRecordSearch;
