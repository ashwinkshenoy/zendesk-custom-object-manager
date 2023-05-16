const template = `
<div>
  <div class="row u-mv">
    <!--Search-->
    <div class="col-12 col-sm-3">
      <!--<form class="col-3" @submit.prevent="searchRecord">
        <div class="search__form-element">
          <input type="text" placeholder="Search..." v-model="search" class="c-txt__input c-txt__input--sm">
          <vs-button fill size="small" type="submit">
            <garden-icon icon="zd-search" name="search" class="search-btn"></garden-icon>
          </vs-button>
        </div>
        <a @click.prevent="resetSearch" class="clear-link" v-if="searchText">Clear</a>
      </form>-->
    </div>

    <!--Create Record-->
    <div class="col u-ta-right">
      <div class="position-button-top">
        <relationship-delete></relationship-delete>
        <vs-button fill size="small" @click="openForm" data-name="ZD: Create Relationship">Create Relationship</vs-button>
      </div>
    </div>
  </div>
</div>
`;

import RelationshipDelete from './RelationshipDelete.js';

const RelationshipRecordSearch = {
  template,

  components: {
    RelationshipDelete,
  },

  methods: {
    ...Vuex.mapActions(['setState', 'searchRelationshipRecords', 'getRelationshipRecords']),

    /**
     * Open sidebar form
     */
    openForm() {
      this.setState({ key: 'isRelationshipRecordForm', value: true });
      this.setState({ key: 'recordAction', value: 'new' });
      this.setState({ key: 'currentRecord', value: {} });
    },
  },
};

export default RelationshipRecordSearch;
