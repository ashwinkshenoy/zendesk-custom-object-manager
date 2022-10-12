const template = `
<div class="sidebar">
  <div class="sidebar__title-wrapper u-p">
    <h3 class="type-title u-mb-xxs">
      <span v-if="recordAction === 'new'">Create Relationship Record</span>
      <span v-if="recordAction === 'edit'">Update Relationship Record</span>
    </h3>
    <div @click="closeForm">
      <garden-icon icon="zd-close" name="Close" class="close-icon"></garden-icon>
    </div>
  </div>

  <form @submit.prevent="setRecord" class="u-ph">
    <!--Type: String/Number/Integer-->
    <div class="row">
      <div class="col-12 form-element">
        <label for="relationship_type" class="c-txt__label u-capitalize">
          Relationship Type
        </label>
        <input
          readonly
          type="text"
          class="c-txt__input c-txt__input--sm"
          autocomplete="off"
          id="relationship_type"
          :value="selectedRelationType">
      </div>
      <div class="col-12 form-element">
        <label for="source" class="c-txt__label u-capitalize">
          Source: 
          <span class="form-highlight">{{ filterRelationshipType?.source }}</span>
        </label>
        <input
          type="text"
          class="c-txt__input c-txt__input--sm"
          autocomplete="off"
          id="source"
          v-model="form.source">
      </div>
      <div class="col-12 form-element">
        <label for="target" class="c-txt__label u-capitalize">
          Target: 
          <span class="form-highlight">{{ filterRelationshipType?.target }}</span>
        </label>
        <input
          type="text"
          class="c-txt__input c-txt__input--sm"
          autocomplete="off"
          id="target"
          v-model="form.target">
      </div>
    </div>

    <div class="u-mv">
      <vs-button class="u-mr-sm" size="small" @click="closeForm">Cancel</vs-button>
      <vs-button size="small" fill type="submit" :disabled="isLoading">Save</vs-button>
    </div>
  </form>
</div>
`;

import GardenIcon from '../Common/GardenIcon.js';
import ZDClient from '../../services/ZDClient.js';

const RelationshipRecordForm = {
  template,

  components: {
    GardenIcon,
  },

  data() {
    return {
      form: {},
      isLoading: false,
    };
  },

  computed: {
    ...Vuex.mapGetters(['relationUniqueKey', 'recordAction', 'currentRecord', 'selectedRelationType', 'relationTypes']),

    /**
     * Get Selected Relationship type
     * @returns {Object}
     */
    filterRelationshipType() {
      return this.relationTypes.filter(item => item.key === this.selectedRelationType)?.[0] || {};
    },
  },

  mounted() {
    this.init();
  },

  watch: {
    currentRecord() {
      this.init();
    },
  },

  methods: {
    ...Vuex.mapActions(['setState']),

    init() {
      if (this.recordAction === 'edit') {
        console.log('---Record Action---\n', this.recordAction);
        console.log('---Current Record---\n', { ...this.currentRecord });
        this.form = { ...this.currentRecord.attributes };
      }
      if (this.recordAction === 'new') {
        this.form = { ...{} };
      }
    },

    /**
     * Close sidebar form
     */
    closeForm() {
      this.setState({ key: 'isRelationshipRecordForm', value: false });
      this.setState({ key: 'currentRecord', value: {} });
      this.setState({ key: 'recordAction', value: 'new' });
    },

    /**
     * Is required form fields
     * @param {String} fieldName
     */
    isRequired(fieldName) {
      return this.requiredFields?.includes(fieldName) || false;
    },

    /**
     * Create/Edit record
     */
    async setRecord() {
      console.table({ ...this.form });
      this.isLoading = true;
      const payload = {
        data: { ...this.form, relationship_type: this.selectedRelationType },
      };
      try {
        let response;
        if (this.recordAction === 'edit') {
          delete payload.data.type;
          response = await ZDClient.customObject().update(this.currentRecord.id, payload);
        } else {
          response = await ZDClient.customObject().createRelationshipRecord(payload);
        }
        if (response?.errors?.length) {
          ZDClient.notify('error', response.responseJSON.errors?.[0].detail);
          return;
        }
        ZDClient.notify('notice', `Record ${this.recordAction === 'edit' ? 'Updated' : 'Created'}`);
        this.setState({
          key: 'relationCursor',
          value: {
            previous: null,
            next: null,
            current: null,
          },
        });
        this.setState({ key: 'relationUniqueKey', value: this.relationUniqueKey + 1 });
        this.closeForm();
      } catch (error) {
        ZDClient.notify('error', error?.responseJSON?.errors?.[0]?.detail);
      } finally {
        this.isLoading = false;
      }
    },
  },
};

export default RelationshipRecordForm;
