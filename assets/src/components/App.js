const template = `
<div class="u-ph-lg">
  <div>
    <div>
      <type-selection></type-selection>

      <!--Loading Objects-->
      <div class="u-ta-center" v-if="objectState === 'Loading'">
        <vs-loader class="u-p" center></vs-loader>
      </div>

      <template v-else>
        <h2 class="type-title">Object Records</h2>
        <!--No Objects-->
        <div class="u-ta-center" v-if="objectState === 'NoObjects'">
          <img src="../images/IconNotFound.svg" alt="No Records" class="empty-image">
          <div>No Objects Found</div>
        </div>

        <!--Objects Found-->
        <template v-if="objectState ===  'ObjectsFound'">
          <object-record-search></object-record-search>
          <object-record-table :key="objectUniqueKey"></object-record-table>
        </template>

        <br><br>
        <h2 class="type-title">Relationship Records</h2>
        <!--No Relationships-->
        <div class="u-ta-center" v-if="relationState === 'NoRelationTypes'">
          <img src="../images/IconNotFound.svg" alt="No Records" class="empty-image">
          <div>No Relationships Found</div>
        </div>
        
        <!--Relationship Records Found-->
        <template v-if="relationState ===  'RelationTypesFound'">
          <relationship-record-search></relationship-record-search>
          <relationship-record-table :key="'relation_'+relationUniqueKey"></relationship-record-table>
        </template>
      </template>
    </div>

    <transition name="sidebar" mode="out-in">
      <object-record-form v-if="isObjectRecordForm" :key="1"></object-record-form>
      <relationship-record-form v-if="isRelationshipRecordForm" :key="2"></relationship-record-form>
    </transition>
  </div>
  <br><br><br><br>
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
};

export default App;
