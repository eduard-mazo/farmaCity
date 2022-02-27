const { Schema, model } = require('mongoose');

const itemSchema = new Schema({
  cod: {
    type: Number,
  },
  desc: {
    type: String,
  },
  tax: {
    type: Number,
    default: 19,
  },
  amount: {
    type: Number,
    default: 0,
  },
});

module.exports = model('Item', itemSchema);
