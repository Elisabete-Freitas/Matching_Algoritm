const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FarmerSchema = new Schema({
  farmArea: { type: Number, required: true }, 
  crops: [
    {
      cropType: { type: String, required: true }, 
      cropArea: { type: Number, required: true }  
    }
  ]
});
const Farmer = mongoose.model('Farmer', FarmerSchema, 'FARMER');
module.exports = Farmer;