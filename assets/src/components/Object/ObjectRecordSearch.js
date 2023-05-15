const template = `
<div>
  <div class="row u-mv">
    <!--Search-->
    <form class="col-3" @submit.prevent="searchRecord">
      <div class="search__form-element">
        <input type="text" placeholder="Search..." v-model="search" class="c-txt__input c-txt__input--sm">
        <vs-button fill size="small" type="submit" data-name="ZD: Search">
          <garden-icon icon="zd-search" name="search" class="search-btn"></garden-icon>
        </vs-button>
      </div>
      <a @click.prevent="resetSearch" class="clear-link" v-if="searchText" data-name="ZD: Clear Search">Clear</a>
    </form>

    
    <div class="col u-ta-right position-button-top">
      <object-download></object-download>
      <object-delete></object-delete>
      <!--Create Record-->
      <vs-button fill size="small" @click="openForm" data-name="ZD: Create Record">Create Record</vs-button>
    </div>
  </div>
</div>
`;

import ObjectDownload from './ObjectDownload.js';
import ObjectDelete from './ObjectDelete.js';
import GardenIcon from '../Common/GardenIcon.js';
import Dropdown from '../Common/Dropdown.js';

const ObjectRecordSearch = {
  template,

  components: {
    ObjectDownload,
    ObjectDelete,
    GardenIcon,
    Dropdown,
  },

  data() {
    return {
      search: this.searchText || '',
    };
  },

  computed: {
    ...Vuex.mapGetters(['searchText']),
  },

  methods: {
    ...Vuex.mapActions(['setState', 'searchCO', 'getObjectRecords']),

    /**
     * Search CO records
     */
    searchRecord() {
      if (!this.search) return;
      this.setState({ key: 'searchText', value: this.search });
      this.setState({
        key: 'objectCursor',
        value: {
          previous: null,
          next: null,
          current: null,
        },
      });
      this.searchCO();
    },

    /**
     * Reset search form
     */
    async resetSearch() {
      this.search = '';
      this.setState({ key: 'searchText', value: this.search });
      this.setState({
        key: 'objectCursor',
        value: {
          previous: null,
          next: null,
          current: null,
        },
      });
      this.getObjectRecords();
    },

    /**
     * Open sidebar form
     */
    openForm() {
      this.setState({ key: 'isObjectRecordForm', value: true });
      this.setState({ key: 'recordAction', value: 'new' });
      this.setState({ key: 'currentRecord', value: {} });
    },
  },
};

export default ObjectRecordSearch;
