const express = require("express");
const router = express.Router();
const Message = require("../Models/Message");
const User = require("../Models/User");

router.get("/user/:userId", async (req, res) => {
    const { userId } = req.params;
    const { page, limit } = req.query;
  
    try {
      const notifications = await Message.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .exec();
  
      const total = await Message.countDocuments({ recipient: userId });
  
      res.json({ data: notifications, total });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).send("Error fetching notifications.");
    }
  });
  

// Fetch unread messages for a user
router.get("/unread/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const unreadMessages = await Message.find({ recipient: userId, status: "sent" }).sort({ createdAt: -1 });
        res.json(unreadMessages);
    } catch (error) {
        console.error("Failed to fetch unread messages:", error);
        res.status(500).send("Error fetching unread messages.");
    }
});

// Fetch unread message count for a user
router.get('/unread-count/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const unreadCount = await Message.countDocuments({ recipient: userId, status: 'sent' });
        res.json({ unreadCount });
    } catch (error) {
        console.error("Failed to fetch unread count:", error);
        res.status(500).send("Error fetching unread count.");
    }
});

// Mark message as read
router.patch('/mark-as-read/:userId', async (req, res) => {
    const { userId } = req.params;
    const { messageId } = req.body;

    try {
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }
        
        if (message.recipient.toString() !== userId) {
            return res.status(403).json({ message: "You do not have permission to mark this message as read" });
        }

        message.status = 'read';
        message.readAt = new Date();
        await message.save();

        res.json(message);
    } catch (error) {
        console.error("Failed to mark message as read:", error);
        res.status(500).send("Error marking message as read.");
    }
});


module.exports = router;
