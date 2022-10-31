const template = `
<div class="u-ta-right">
  <button 
    class="btn-svg u-cursor-pointer"
    @click="openMenu"
    ref="actionButton"
    >
    <garden-icon 
      icon="zd-overflow-vertical-fill" 
      name="More Actions"
      class="u-fg-grey-600"
    ></garden-icon>
  </button>

  <div :class="['action-item__wrapper', classes]" v-if="!isMenuHidden">
    <ul 
      class="c-menu c-menu--down is-open"
      aria-hidden="false">
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
    top: {
      type: Boolean,
      default: false,
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

  computed: {
    classes() {
      return [{ 'vs-action-item--top': this.top }];
    },
  },

  mounted() {
    window.addEventListener('click', e => {
      if (!this.$el.contains(e.target)) {
        this.isMenuHidden = true;
      }
    });
  },

  methods: {
    openMenu() {
      this.isMenuHidden = !this.isMenuHidden;
    },

    change(option) {
      this.isMenuHidden = true;
      this.$emit('change', option, this.item);
    },
  },
};

export default ActionItem;
