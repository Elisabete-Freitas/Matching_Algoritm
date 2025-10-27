const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' 
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' 
    },
    content: {
        type: String,
        required: true
    },
    serviceRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceRequest', 
        required: false 
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    readAt: {
        type: Date
    }
});

const Message = mongoose.model('Message', MessageSchema, 'MESSAGE');
module.exports = Message;
