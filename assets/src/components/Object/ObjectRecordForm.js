const template = `
<div class="sidebar">
  <div class="sidebar__title-wrapper u-p">
    <h3 class="type-title u-mb-xxs">
      <span v-if="recordAction === 'new'">Create Record</span>
      <span v-if="recordAction === 'edit'">Update Record</span>
    </h3>
    <div @click="closeForm">
      <garden-icon icon="zd-close" name="Close" class="close-icon"></garden-icon>
    </div>
  </div>

  <form @submit.prevent="setRecord" class="u-ph">
    <!--Type: String/Number/Integer-->
    <div class="row">
      <template v-for="(column, index) in getDefaultKeys">
        <div class="col-6 form-element" :key="'column_'+index">
          <label :for="column.key" class="c-txt__label u-capitalize">
            {{ column.key | filterName }}
            <span class="u-fg-crimson-600" v-if="isRequired(column.key)">*</span>
          </label>
          <template v-if="column.type === 'number' || column.type === 'integer'">
            <input
              type="number"
              class="c-txt__input c-txt__input--sm"
              autocomplete="off"
              :id="column.key"
              v-model.number="form[column.key]">
          </template>
          <template v-else>
            <textarea
              type="text"
              class="c-txt__input c-txt__input--sm"
              rows="1"
              v-model="form[column.key]"
              :id="column.key"
              :required="isRequired(column.key)"></textarea>
          </template>
        </div>
      </template>
    </div>

    <!--Type: Boolean-->
    <div class="row u-mt-sm" v-if="getBooleanKeys.length > 0">
      <template v-for="(column, index) in getBooleanKeys">
        <div class="col-4 form-element u-mb-xl" :key="'column_'+index">
          <div class="form-element">
            <label class="c-txt__label u-capitalize">
              {{ column.key | filterName }}
            </label>
            <input
              class="c-chk__input"
              type="checkbox"
              v-model="form[column.key]"
              :id="column.key">
            <label class="c-chk__label c-chk__label--toggle" :for="column.key"></label>
          </div>
        </div>
      </template>
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

const ObjectRecordForm = {
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
    ...Vuex.mapGetters([
      'schema',
      'selectedObjectType',
      'requiredFields',
      'objectUniqueKey',
      'recordAction',
      'currentRecord',
    ]),

    /**
     * Get all strings from schema
     * @returns {Array}
     */
    getDefaultKeys() {
      return Object.entries(this.schema).reduce(function (result, [key, value]) {
        if (value.type !== 'boolean') {
          result.push(...[{ key, type: value.type }]);
        }
        return result;
      }, []);
    },

    /**
     * Get all booleans from schema
     * @returns {Array}
     */
    getBooleanKeys() {
      return Object.entries(this.schema).reduce(function (result, [key, value]) {
        if (value.type === 'boolean') {
          result.push(...[{ key, type: value.type }]);
        }
        return result;
      }, []);
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

  filters: {
    /**
     * Converts string with '_' or '-' into space
     * @param {String} value
     * @returns {String}
     */
    filterName(value) {
      return value.replace(/[\-_]/g, ' ');
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
      this.setState({ key: 'isObjectRecordForm', value: false });
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
        data: {
          type: this.selectedObjectType,
          attributes: { ...this.form },
        },
      };
      try {
        let response;
        if (this.recordAction === 'edit') {
          delete payload.data.type;
          response = await ZDClient.customObject().update(this.currentRecord.id, payload);
        } else {
          response = await ZDClient.customObject().create(payload);
        }
        if (response?.errors?.length) {
          ZDClient.notify('error', response.responseJSON.errors?.[0].detail);
          return;
        }
        ZDClient.notify('notice', `Record ${this.recordAction === 'edit' ? 'Updated' : 'Created'}`);
        this.setState({
          key: 'objectCursor',
          value: {
            previous: null,
            next: null,
            current: null,
          },
        });
        this.setState({ key: 'objectUniqueKey', value: this.objectUniqueKey + 1 });
        this.closeForm();
      } catch (error) {
        ZDClient.notify('error', error?.responseJSON?.errors?.[0]?.detail || 'Error Occurred!');
      } finally {
        this.isLoading = false;
      }
    },
  },
};

export default ObjectRecordForm;
