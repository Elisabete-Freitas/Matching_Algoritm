const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Crop2HivesSchema = new Schema({
    cropType: { type: String, required: true },
    farmArea: { type: Number, required: true },
    beehivesNeededPerHectare: { type: Number, required: true },
    pollinationStart: { type: Date , required: true  },
    pollinationEnd: { type: Date , required: true }
});

const CropInfo = mongoose.model('Crop2Hives', Crop2HivesSchema, 'CROP2HIVES');
module.exports = CropInfo;  