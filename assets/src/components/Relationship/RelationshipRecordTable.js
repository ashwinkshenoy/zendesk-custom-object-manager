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

  <table class="c-table u-mb-sm">
    <thead>
      <tr class="c-table__row c-table__row--header">
        <td class="c-table__row__cell">Created</td>
        <td class="c-table__row__cell">ID</td>
        <td class="c-table__row__cell">Relationship Type</td>
        <td class="c-table__row__cell">Source</td>
        <td class="c-table__row__cell">Target</td>
      </tr>
    </thead>
    <tbody>
      <tr v-if="relationTableState==='Loading'">
        <td colspan="6" class="u-ta-center">
          <vs-loader class="u-p" center></vs-loader>
        </td>
      </tr>

      <tr v-if="relationTableState==='NoData'">
        <td colspan="6" class="u-ta-center u-p">
          <div>No Records Found</div>
        </td>
      </tr>

      <tr v-if="relationTableState==='ApiError'">
        <td colspan="6" class="u-ta-center u-p">
          API Error Occured
        </td>
      </tr>

      <template v-if="relationTableState==='DataFound'">
        <tr
          :class="[
            'c-table__row',
            {'is-active': currentRecord.id === record.id},
            {'is-disabled': record.attributes?.is_disabled}
          ]"
          v-for="record in relationRecords" 
          :key="record.id">
          <td class="c-table__row__cell">{{ record.created_at | formatDate }}</td>
          <td class="c-table__row__cell">{{ record.id }}</td>
          <td class="c-table__row__cell">{{ record.relationship_type }}</td>
          <td class="c-table__row__cell">{{ record.source }}</td>
          <td class="c-table__row__cell">{{ record.target }}</td>
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
  <template v-if="relationTableState === 'DataFound'">
    <div class="u-ta-center" v-if="relationCursor.previous || relationCursor.next">
      <vs-button
        size="small"
        class="u-mv u-mr-sm width-100"
        :disabled="!relationCursor.previous"
        @click="changePage('previous')">
        {{ $t('button.previous') }}
      </vs-button>
      <vs-button
        size="small"
        class="u-mv width-100"
        :disabled="!relationCursor.next"
        @click="changePage('next')">
        {{ $t('button.next') }}
      </vs-button>
    </div>
  </template>
</div>
`;

import ActionItem from '../Common/ActionItem.js';
import ZDClient from '../../services/ZDClient.js';

const RelationshipRecordTable = {
  template,

  components: {
    ActionItem,
  },

  data() {
    return {
      modalButtonDisabled: false,
      actionItemOptions: [
        {
          label: 'Delete',
          value: 'delete',
        },
      ],
    };
  },

  computed: {
    ...Vuex.mapGetters([
      'relationTableState',
      'relationRecords',
      'relationCursor',
      'currentRecord',
      'recordAction',
      'relationSearchText',
      'selectedRelationType',
    ]),
  },

  mounted() {
    this.initTable();
  },

  filters: {
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

  methods: {
    ...Vuex.mapActions(['setState', 'getRelationshipRecords', 'searchCO']),

    /**
     * Initialze Table
     */
    initTable() {
      if (!this.relationSearchText) {
        this.getRelationshipRecords();
        console.log('init relation get');
      } else {
        this.searchCO();
        console.log('init relation search');
      }
    },

    /**
     * Pagination: Change page
     * @param {String} value (previous/next key)
     */
    changePage(value) {
      if (!this.relationSearchText) {
        this.getRelationshipRecords(this.relationCursor[value]);
        return;
      }
      this.searchCO(this.relationCursor[value]);
    },

    /**
     * Perform Action on action item selection
     * @param {Object} actionItem
     * @param {Object} item
     */
    handleActionItemChange(actionItem = {}, item = {}) {
      console.log('---Record Action---\n', actionItem.value);
      console.log('---Current Record---\n', item, '\n\n\n');
      this.setState({ key: 'recordAction', value: actionItem.value });
      this.setState({ key: 'currentRecord', value: { ...item } });
      if (this.recordAction === 'delete') {
        this.openModal('deleteModal');
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
        await ZDClient.customObject().deleteRelationshipRecord(currentItem.id);
        ZDClient.notify('notice', 'Deleted Record');
      } catch (error) {
        ZDClient.notify('error', error);
      } finally {
        this.closeModal('deleteModal');
        this.setState({
          key: 'relationCursor',
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

export default RelationshipRecordTable;
