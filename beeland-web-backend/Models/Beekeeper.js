const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BeekeeperSchema = new Schema({
  serviceArea: { type: Number, required: true }, 
  hiveCount: { type: Number, required: true },
  hivesReserved: { type: Number, required: true, default: 0 },
  serviceRate: { type: Number, required: true }, 
  experience: { type: Number, required: true },
  travel_price: { type: Number, required: true },
  species: [
    {
      Type: { type: String, required: true }, 
    }
  ]
});
const Beekeeper = mongoose.model('Beekeeper', BeekeeperSchema, 'BEEKEEPER');
module.exports = Beekeeper;

