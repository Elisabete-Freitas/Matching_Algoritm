const mongoose = require('mongoose');
const { Schema } = mongoose;

const ServiceRequestSchema = new Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    beekeeper: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: false 
    },
    cropType: {
        type: String,
        required: true
    },
    farmArea: {
        type: Number, 
        required: true
    },
    numberOfHivesNeeded: {
        type: Number,
        required: true
    },
    serviceRate: {
        type: Number, 
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    lastUpdatedDate: {
        type: Date,
        default: Date.now
    }
});

const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema, 'SERVICEREQUEST');
module.exports = ServiceRequest;
