const template = `
<div>
  
<!--Object Type Selector-->
  <div class="row u-mt">
    <div class="col-3">
      <vs-select
        label="Select Object"
        :options="filteredObjects"
        v-model="objectType"
        @change="setObjectType"
        is-compact
        is-search>
      </vs-select>
    </div>
    <div class="col-3">
      <vs-select
        label="Select Relationhip"
        :options="filteredRelations"
        v-model="relationType"
        @change="setRelationType"
        is-compact
        is-search>
      </vs-select>
    </div>
  </div>
</div>
`;

import GardenIcon from './Common/GardenIcon.js';

const TypeSelection = {
  template,

  components: {
    GardenIcon,
  },

  data() {
    return {
      objectType: '',
      relationType: '',
    };
  },

  computed: {
    ...Vuex.mapGetters(['searchText', 'objectTypes', 'selectedObjectType', 'relationTypes', 'selectedRelationType']),

    /**
     * Create Array from objectTypes with label/value
     * @returns {Array}
     */
    filteredObjects() {
      return this.objectTypes.map(item => {
        return {
          label: item.key,
          value: item.key,
        };
      });
    },

    /**
     * Create Array from relations with label/value
     * @returns {Array}
     */
    filteredRelations() {
      return this.relationTypes.map(item => {
        return {
          label: item.key,
          value: item.key,
        };
      });
    },
  },

  created() {
    this.init();
  },

  methods: {
    ...Vuex.mapActions([
      'setState',
      'getObjectTypes',
      'searchCO',
      'getObjectRecords',
      'getRelationshipTypes',
      'getRelationshipRecords',
    ]),

    init() {
      this.objectType = this.selectedObjectType;
      this.relationType = this.selectedRelationType;
      // this.getObjectRecords();
      // this.getRelationshipRecords();
    },

    /**
     * Set Selected object type and reset search and cursor
     * @param {String} value
     */
    setObjectType(value) {
      this.search = '';
      this.setState({ key: 'searchText', value: '' });
      this.setState({
        key: 'objectCursor',
        value: {
          previous: null,
          next: null,
          current: null,
        },
      });
      this.setState({ key: 'selectedObjectType', value });
      this.setState({ key: 'selectedColumns', value: [] });
      this.getObjectRecords();
    },

    /**
     * Set Relation type and reset search and cursor
     * @param {String} value
     */
    setRelationType(value) {
      this.setState({ key: 'relationSearchText', value: '' });
      this.setState({
        key: 'relationCursor',
        value: {
          previous: null,
          next: null,
          current: null,
        },
      });
      this.setState({ key: 'selectedRelationType', value });
      this.getRelationshipRecords();
    },
  },
};

export default TypeSelection;
