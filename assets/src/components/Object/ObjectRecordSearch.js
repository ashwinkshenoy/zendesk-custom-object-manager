const template = `
<div>
  <div class="row u-mv">
    <!--Search-->
    <form class="col-3" @submit.prevent="searchRecord">
      <div class="search__form-element">
        <input type="text" placeholder="Search..." v-model="search" class="c-txt__input c-txt__input--sm">
        <vs-button fill size="small" type="submit">
          <garden-icon icon="zd-search" name="search" class="search-btn"></garden-icon>
        </vs-button>
      </div>
      <a @click.prevent="resetSearch" class="clear-link" v-if="searchText">Clear</a>
    </form>
  </div>
</div>
`;

import GardenIcon from '../Common/GardenIcon.js';
import Dropdown from '../Common/Dropdown.js';

const ObjectRecordSearch = {
  template,

  components: {
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
  },
};

export default ObjectRecordSearch;
