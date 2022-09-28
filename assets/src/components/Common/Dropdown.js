const template = `
<div :class="['vs-dropdown__wrapper', classes]" ref="vs-dropdown">
  <div @click="openDropdown" class="vs-dropdown__trigger">
    <slot name="dropdown-trigger">
      <button>Dropdown</button>
    </slot>
  </div>

  <div
    class="vs-dropdown__container"
    :style="offsetStyle"
    ref="vs-dropdown-container"
    v-if="toggleDropdown">
    <slot name="dropdown-content"></slot>
  </div>
</div>
`;

import GardenIcon from './GardenIcon.js';

const Dropdown = {
  template,

  props: {
    top: {
      type: Boolean,
      default: false,
    },
    right: {
      type: Boolean,
      default: false,
    },
    left: {
      type: Boolean,
      default: false,
    },
    offset: {
      type: [Number, String],
      default: 0,
    },
    noCaret: {
      type: Boolean,
      default: false,
    },
  },

  components: {
    GardenIcon,
  },

  data() {
    return {
      toggleDropdown: false,
      isDropdownTop: false,
    };
  },

  computed: {
    classes() {
      return [
        { 'vs-dropdown--top': this.top || this.isDropdownTop },
        { 'vs-dropdown--right': this.right },
        { 'vs-dropdown--left': this.left },
        { 'vs-dropdown--no-caret': this.noCaret },
      ];
    },

    offsetStyle() {
      if (this.offset) {
        const offset = this.offset.split(',');
        return { transform: `translate3d(${offset[0] || 0}px, ${offset[1] || 0}px, ${offset[2] || 0}px)` };
      }
      return null;
    },
  },

  mounted() {
    if (window) {
      window.addEventListener('click', e => {
        if (!this.$el.contains(e.target)) {
          this.toggleDropdown = false;
        }
      });
      this.handleScroll();
      window.addEventListener('scroll', this.handleScroll);
    }
  },

  destroyed() {
    if (window) {
      window.removeEventListener('scroll', this.handleScroll);
    }
  },

  methods: {
    openDropdown() {
      this.handleScroll();
      this.toggleDropdown = !this.toggleDropdown;
      this.$emit('open', this.toggleDropdown);
    },

    handleScroll() {
      const dropdownBox = this.$refs['vs-dropdown'];
      const dropdownContainer = this.$refs['vs-dropdown-container'];
      if (
        dropdownBox.offsetTop + ((dropdownContainer && dropdownContainer.offsetHeight) || 0) + 200 >
        window.innerHeight + window.pageYOffset
      ) {
        this.isDropdownTop = true;
      } else {
        this.isDropdownTop = false;
      }
    },
  },
};

export default Dropdown;
