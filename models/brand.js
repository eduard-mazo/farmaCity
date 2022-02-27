const { Schema, model } = require('mongoose');

const brandSchema = new Schema({
  name: {
    type: Number,
  },
  items: {
    type: Array,
    default: [],
  },
});

module.exports = model('Item', itemSchema);
