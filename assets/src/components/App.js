const template = `
<div class="u-ph">
  <div>
    <div>
      <!--Loading Objects / Relationships-->
      <div class="page-center" v-if="objectState === 'Loading' || relationState === 'Loading'">
        <vs-loader class="u-p" center></vs-loader>
      </div>

      <div
        class="page-center"
        v-else-if="objectState === 'NoObjects' && relationState === 'NoRelationTypes'">
        <img src="./images/IconNotFound.svg" alt="No Records" class="empty-image">
        <div class="u-bold">No Custom Object Created</div>
        <p class="u-mt-xs">When you create an Object/Relationship, you'll see it here.</p>
        <a href="https://www.buymeacoffee.com/ashwinshenoy?utm_source=zd_custom_object" target="_blank" class="u-mt-xxl">
          <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="width: 140px">
        </a>
      </div>

      <template v-else>
        <type-selection></type-selection>

        <!-- ----- Objects ----- -->
        <div class="white-box">
          <div class="row u-mt-xs">
            <div class="col">
              <h2 class="type-title">Object Records</h2>
            </div>
          </div>

          <!--No Objects-->
          <div class="u-ta-center" v-if="objectState === 'NoObjects'">
            <img src="./images/IconNotFound.svg" alt="No Records" class="empty-image">
            <div>No Objects Found</div>
          </div>

          <!--Objects Found-->
          <template v-if="objectState ===  'ObjectsFound'">
            <object-record-search></object-record-search>
            <object-record-table :key="objectUniqueKey"></object-record-table>
          </template>
        </div>


        <!-- ----- Relationship ----- -->
        <div class="white-box">
          <div class="row u-mt-xs">
            <div class="col">
              <h2 class="type-title">Relationship Records</h2>
            </div>
          </div>

          <!--No Relationships-->
          <div class="u-ta-center" v-if="relationState === 'NoRelationTypes'">
            <img src="./images/IconNotFound.svg" alt="No Records" class="empty-image">
            <div>No Relationships Found</div>
          </div>
          
          <!--Relationship Records Found-->
          <template v-if="relationState ===  'RelationTypesFound'">
          <relationship-record-search></relationship-record-search>
            <relationship-record-table :key="'relation_'+relationUniqueKey"></relationship-record-table>
          </template>
        </div>

        <!--Buy Coffee-->
        <div class="u-mv-xxl u-ta-center">
          <a href="https://www.buymeacoffee.com/ashwinshenoy?utm_source=zd_custom_object" target="_blank">
            <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="width: 140px">
          </a>
        </div>
      </template>
    </div>

    <transition name="sidebar" mode="out-in">
      <object-record-form v-if="isObjectRecordForm" :key="1"></object-record-form>
      <relationship-record-form v-if="isRelationshipRecordForm" :key="2"></relationship-record-form>
    </transition>
    <transition name="sidebarOverly" mode="out-in">
      <div
        class="sidebar__overlay"
        v-show="isObjectRecordForm || isRelationshipRecordForm"
        @click="closeForm">
      </div>
    </transition>
  </div>
</div>`;

import TypeSelection from './TypeSelection.js';
import ObjectRecordSearch from './Object/ObjectRecordSearch.js';
import ObjectRecordTable from './Object/ObjectRecordTable.js';
import ObjectRecordForm from './Object/ObjectRecordForm.js';
import RelationshipRecordSearch from './Relationship/RelationshipRecordSearch.js';
import RelationshipRecordTable from './Relationship/RelationshipRecordTable.js';
import RelationshipRecordForm from './Relationship/RelationshipRecordForm.js';

const App = {
  template,

  components: {
    TypeSelection,
    ObjectRecordSearch,
    ObjectRecordTable,
    ObjectRecordForm,
    RelationshipRecordSearch,
    RelationshipRecordTable,
    RelationshipRecordForm,
  },

  computed: {
    ...Vuex.mapGetters([
      'objectState',
      'isObjectRecordForm',
      'objectUniqueKey',
      'relationUniqueKey',
      'relationState',
      'isRelationshipRecordForm',
    ]),
  },

  mounted() {
    this.init();
  },

  methods: {
    ...Vuex.mapActions(['setState', 'getObjectTypes', 'getRelationshipTypes']),

    async init() {
      await this.getObjectTypes();
      await this.getRelationshipTypes();
    },

    /**
     * Close sidebar form
     */
    closeForm() {
      this.setState({ key: 'isObjectRecordForm', value: false });
      this.setState({ key: 'isRelationshipRecordForm', value: false });
      this.setState({ key: 'currentRecord', value: {} });
      this.setState({ key: 'recordAction', value: 'new' });
    },
  },
};

export default App;
