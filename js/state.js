// state.js
const state = {
  data: [],
  setData(arr) {
    this.data = arr;
    document.dispatchEvent(new CustomEvent('dataUpdated', { detail: arr }));
  }
};
