const template = `
<div>  
  <!--Delete Record Modal-->
  <vs-modal
    ref="deleteModal"
    size="s"
    dismiss-on="close-button esc"
    remove-header
    remove-close-button
    align-top>
    <div class="u-ta-center modal-content">
      <img src="./images/IconDelete.svg" alt="Trash" class="modal-img">
      <h1>Are you sure you want to delete?</h1>
      <p class="u-mb">You can't undo this action.</p>
      <vs-button class="u-mr-sm" size="small" @click="closeModal('deleteModal')">Cancel</vs-button>
      <vs-button
        fill
        size="small"
        @click="confirmDelete(currentRecord)"
        :disabled="modalButtonDisabled">
        Confirm
      </vs-button>
    </div>
  </vs-modal>
  
  <!--Clone Record Modal-->
  <vs-modal
    ref="cloneModal"
    size="s"
    dismiss-on="close-button esc"
    remove-header
    remove-close-button
    align-top>
    <div class="u-ta-center modal-content">
      <img src="./images/IconCopy.svg" alt="Clone" class="modal-img">
      <h1 class="u-mb">Are you sure you want to clone?</h1>
      <vs-button class="u-mr-sm" size="small" @click="closeModal('cloneModal')">Cancel</vs-button>
      <vs-button 
        fill 
        size="small" 
        @click="confirmClone(currentRecord)" 
        :disabled="modalButtonDisabled">
        Confirm
      </vs-button>
    </div>
  </vs-modal>

  <table class="c-table u-mb-sm">
    <thead>
      <tr class="c-table__row c-table__row--header">
        <td class="c-table__row__cell">Created</td>
        <td
          class="c-table__row__cell"
          v-for="(name, index) in filteredColumns"
          :key="index"
          :data-index="index">
          {{ name | filterName }}
        </td>
        <td class="c-table__row__cell u-ta-right">
          <dropdown right offset="5, -10" class="table-column-selector">
            <template v-slot:dropdown-trigger>
              <garden-icon
                icon="zd-cog"
                name="settings"
                class="u-fg-grey-600">
              </garden-icon>
            </template>
            <template v-slot:dropdown-content>
              <vs-multiselect
                label="Select Columns"
                :preselected="selectedColumns"
                :options="filteredColumnOptions"
                @change="setColumns"
                is-compact
                is-search>
              </vs-multiselect>
              <vs-button @click="resetColumns" size="small" class="u-mt-sm">Reset</vs-button>
            </template>
          </dropdown>
        </td>
      </tr>
    </thead>
    <tbody>
      <tr v-if="objectTableState==='Loading'">
        <td :colspan="filteredColumns.length+2" class="u-ta-center">
          <vs-loader class="u-p" center></vs-loader>
        </td>
      </tr>

      <tr v-if="objectTableState==='NoData'">
        <td :colspan="filteredColumns.length+2" class="u-ta-center u-p">
          <div>No Records Found</div>
        </td>
      </tr>

      <tr v-if="objectTableState==='ApiError'">
        <td :colspan="filteredColumns.length+2" class="u-ta-center u-p">
          API Error Occured
        </td>
      </tr>

      <template v-if="objectTableState==='DataFound'">
        <tr
          :class="[
            'c-table__row',
            {'is-active': currentRecord.id === record.id},
            {'is-disabled': record.attributes?.is_disabled}
          ]"
          v-for="record in objectRecords" 
          :key="record.id">
          <td class="c-table__row__cell">{{ record.created_at | formatDate }}</td>
          <template v-for="(field, index) in filteredColumns">
            <td class="c-table__row__cell" :key="index+'_record'">{{ record.attributes[field] || '---' }}</td>
          </template>
          <td class="c-table__row__cell action-cell">
            <action-item
              class="btn-svg-table"
              :options="actionItemOptions"
              :item="record"
              @change="handleActionItemChange">
            ></action-item>
          </td>
        </tr>
      </template>
    </tbody>
  </table>

  <!--Pagination-->
  <template v-if="objectTableState === 'DataFound'">
    <div class="u-ta-center" v-if="objectCursor.previous || objectCursor.next">
      <vs-button
        size="small"
        class="u-mv u-mr-sm width-100"
        :disabled="!objectCursor.previous"
        @click="changePage('previous')">
        {{ $t('button.previous') }}
      </vs-button>
      <vs-button
        size="small"
        class="u-mv width-100"
        :disabled="!objectCursor.next"
        @click="changePage('next')">
        {{ $t('button.next') }}
      </vs-button>
    </div>
  </template>
</div>
`;

import ActionItem from '../Common/ActionItem.js';
import Dropdown from '../Common/Dropdown.js';
import GardenIcon from '../Common/GardenIcon.js';
import ZDClient from '../../services/ZDClient.js';

const ObjectRecordTable = {
  template,

  components: {
    ActionItem,
    Dropdown,
    GardenIcon,
  },

  data() {
    return {
      modalButtonDisabled: false,
      actionItemOptions: [
        {
          label: 'Edit',
          value: 'edit',
        },
        {
          label: 'Clone',
          value: 'clone',
        },
        {
          label: 'Delete',
          value: 'delete',
        },
      ],
    };
  },

  computed: {
    ...Vuex.mapGetters([
      'objectTableState',
      'schema',
      'objectRecords',
      'objectCursor',
      'currentRecord',
      'recordAction',
      'searchText',
      'selectedObjectType',
      'selectedColumns',
    ]),

    filteredColumns() {
      if (this.selectedColumns.length > 0) {
        // return this.selectedColumns;
        return Object.entries(this.schema)
          .map(([key, value], item) => {
            return this.selectedColumns.filter(item => item === key)?.[0];
          })
          .filter(Boolean);
      }
      return Object.entries(this.schema).map(([key, value], item) => {
        return key;
      });
    },

    filteredColumnOptions() {
      return Object.entries(this.schema).map(([key, value], item) => {
        return key;
      });
    },
  },

  mounted() {
    this.initTable();
    this.initSelectedColumns();
  },

  filters: {
    /**
     * Converts string with '_' or '-' into space.
     * @param {String} value
     * @returns {String}
     */
    filterName(value) {
      return value.replace(/[\-_]/g, ' ');
    },

    /**
     * Formats date
     * @param {Date} date
     */
    formatDate(date) {
      if (!date) return date;
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      });
    },
  },

  watch: {
    schema: {
      immediate: false,
      deep: true,
      handler() {
        this.initSelectedColumns();
      },
    },
  },

  methods: {
    ...Vuex.mapActions(['setState', 'getObjectRecords', 'searchCO']),

    /**
     * Initialze Table
     */
    initTable() {
      if (!this.searchText) {
        this.getObjectRecords();
      } else {
        this.searchCO();
      }
    },

    /**
     * Set columns for table
     * @param {Array} columns
     * @returns
     */
    setColumns(columns) {
      if (columns.length === 0) return;
      if (this.filteredColumns === 1) {
        return;
      }
      this.setState({ key: 'selectedColumns', value: columns });
    },

    /**
     * Init columns selection
     */
    initSelectedColumns() {
      console.log('mounted');
      if (this.selectedColumns.length > 0) return;
      const columns = Object.entries(this.schema).map(([key, value], item) => {
        return key;
      });
      this.setState({ key: 'selectedColumns', value: columns });
    },

    /**
     * Reset columns selections
     */
    resetColumns() {
      const columns = Object.entries(this.schema).map(([key, value], item) => {
        return key;
      });
      this.setState({ key: 'selectedColumns', value: columns });
    },

    /**
     * Pagination: Change page
     * @param {String} value (previous/next key)
     */
    changePage(value) {
      if (!this.searchText) {
        this.getObjectRecords(this.objectCursor[value]);
        return;
      }
      this.searchCO(this.objectCursor[value]);
    },

    /**
     * Perform Action on action item selection
     * @param {Object} actionItem
     * @param {Object} item
     */
    handleActionItemChange(actionItem = {}, item = {}) {
      console.log('---Record Action---\n', actionItem.value);
      console.log('---Current Record---\n', item, '\n\n\n');
      this.setState({ key: 'isObjectRecordForm', value: false });
      this.setState({ key: 'recordAction', value: actionItem.value });
      this.setState({ key: 'currentRecord', value: { ...item } });
      if (this.recordAction === 'edit') {
        this.setState({ key: 'isObjectRecordForm', value: true });
      }
      if (this.recordAction === 'delete') {
        this.openModal('deleteModal');
      }
      if (this.recordAction === 'clone') {
        this.openModal('cloneModal');
      }
      if (this.recordAction === 'disable') {
        this.openModal('disableModal');
      }
    },

    /**
     * Open modal
     * @param {String} ref
     */
    openModal(ref) {
      this.$refs[ref].open();
    },

    /**
     * Close modal & perform action
     * @param {String} ref
     */
    closeModal(ref) {
      this.$refs[ref].close();
      this.modalButtonDisabled = false;
      this.setState({ key: 'recordAction', value: 'new' });
      this.setState({ key: 'currentRecord', value: {} });
    },

    /**
     * Delete Record
     * @param {Object} currentItem
     */
    async confirmDelete(currentItem) {
      this.modalButtonDisabled = true;
      try {
        await ZDClient.customObject().delete(currentItem.id);
        ZDClient.notify('notice', 'Deleted Record');
      } catch (error) {
        ZDClient.notify('error', error?.responseJSON?.errors?.[0]?.detail || 'Error Occurred!');
      } finally {
        this.closeModal('deleteModal');
        this.setState({
          key: 'objectCursor',
          value: {
            previous: null,
            next: null,
            current: null,
          },
        });
        this.initTable();
      }
    },

    /**
     * Clone Record
     * @param {Object} currentItem
     */
    async confirmClone(currentItem) {
      this.modalButtonDisabled = true;
      const payload = {
        data: {
          type: this.selectedObjectType,
          attributes: { ...currentItem.attributes },
        },
      };
      try {
        const response = await ZDClient.customObject().create(payload);
        if (response?.errors?.length) {
          ZDClient.notify('error', response.responseJSON.errors?.[0].detail);
          return;
        }
        ZDClient.notify('notice', 'Record Cloned');
      } catch (error) {
        ZDClient.notify('error', error?.responseJSON?.errors?.[0]?.detail || 'Error Occurred!');
      } finally {
        this.closeModal('cloneModal');
        this.setState({
          key: 'objectCursor',
          value: {
            previous: null,
            next: null,
            current: null,
          },
        });
        this.initTable();
      }
    },
  },
};

export default ObjectRecordTable;
