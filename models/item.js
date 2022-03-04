const { Schema, model } = require('mongoose');

const itemSchema = new Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  cod: {
    type: Number,
    unique: true,
  },
  desc: {
    type: String,
  },
  tax: {
    type: Number,
    default: 19,
  },
  amount: {
    type: Array,
    default: [
      {
        unidad: 0,
        sobre: [0, 0],
        caja: [0, 0],
      },
    ],
  },
});

module.exports = model('Item', itemSchema);
