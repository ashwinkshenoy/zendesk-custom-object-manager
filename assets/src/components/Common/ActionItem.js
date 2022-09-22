const template = `
<div class="u-ta-right">
  <button 
    class="btn-svg u-cursor-pointer"
    @click="isMenuHidden = !isMenuHidden"
    >
    <garden-icon 
      icon="zd-overflow-vertical-fill" 
      name="More Actions"
      class="u-fg-grey-600"
    ></garden-icon>
  </button>

  <div class="action-item__wrapper">
    <ul 
      class="c-menu c-menu--down is-open"
      :aria-hidden="isMenuHidden">
      <li 
        v-for="(option, index) in options" 
        :key="index" 
        class="c-menu__item" 
        @click="change(option)">
        <span>{{ option.label }}</span>
      </li>
    </ul>
  </div>
</div>
`;

import GardenIcon from '../Common/GardenIcon.js';

const ActionItem = {
  template,

  props: {
    options: {
      type: Array,
      default: [],
    },
    item: {
      type: [Array, Object],
    },
  },

  components: {
    GardenIcon,
  },

  data() {
    return {
      isMenuHidden: true,
    };
  },

  mounted() {
    window.addEventListener('click', e => {
      if (!this.$el.contains(e.target)) {
        this.isMenuHidden = true;
      }
    });
  },

  methods: {
    change(option) {
      this.isMenuHidden = true;
      this.$emit('change', option, this.item);
    },
  },
};

export default ActionItem;
