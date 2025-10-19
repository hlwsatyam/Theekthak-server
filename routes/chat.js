const express = require('express');
const router = express.Router();
 
const { Conversation, Message } = require('../models/Chat');

 















// Get user conversations
router.get('/conversations', async (req, res) => {
  try {
    const userId =  req.headers.currentuser; 
    
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'username name photoURL isOnline lastSeen')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'username name photoURL'
      }
    })
    .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});



















// Get or create conversation
router.post('/conversations', async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.headers.currentuser;

 
    if (!participantId) {
      return res.status(400).json({ error: 'Participant ID is required' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [userId, participantId], $size: 2 }
    })
    .populate('participants', 'username name photoURL isOnline lastSeen')
    .populate('lastMessage');

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [userId, participantId],
        isGroup: false
      });
      await conversation.save();
      
      // Populate the newly created conversation
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'username name photoURL isOnline lastSeen')
        .populate('lastMessage');
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get messages for a conversation
 


router.get('/conversations/:receiver/messages', async (req, res) => {
  try {
    const { receiver } = req.params; // receiver id
    const sender = req.headers.currentuser; // from fetcher / headers
    const { page = 1, limit = 50 } = req.query;

    if (!sender || !receiver) {
      return res.status(400).json({ error: 'Sender or receiver missing' });
    }

    // Find conversation between these two participants
    const conversation = await Conversation.findOne({
      participants: { $all: [sender, receiver] },
      isGroup: false
    });
 
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
 
    // Fetch messages with pagination
    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'username name photoURL')
      .populate('repliedTo')
      .sort({ createdAt: 1 }) // ascending order
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      conversationId: conversation._id,
      messages
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});











 

 router.post('/messages', async (req, res) => {
  try {
    const { reciever, content, messageType = 'text', media } = req.body;
    const sender = req.headers.currentuser; // from fetcher
console.log(req.body)
    if (!sender || !reciever) {
      return res.status(400).json({ error: 'Sender or receiver missing' });
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [sender, reciever] },
      isGroup: false
    });

    // If conversation doesn't exist → first message
    if (!conversation) {
      conversation = new Conversation({
        participants: [sender, reciever],
        isGroup: false,
        pending: true // first sender's message is pending
      });
      await conversation.save();
    }

    // Create the message
    const message = new Message({
      conversation: conversation._id,
      sender,
      content,
      messageType,
      media: media || []
    });
    await message.save();

    // ✅ Only mark pending = false if sender is NOT the first sender
    if (conversation.pending && sender.toString() !== conversation.participants[0].toString()) {
      conversation.pending = false;
    }

    conversation.lastMessage = message._id;
    await conversation.save();

    // Populate sender info
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username name photoURL');

    res.status(201).json({
      success: true,
      conversationId: conversation._id,
      message: populatedMessage,
      pending: conversation.pending
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});















// Mark messages as read
router.post('/messages/read', async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId =  req.headers.currentuser; ;

    await Message.updateMany(
      {
        _id: { $in: messageIds },
        sender: { $ne: userId } // Don't mark own messages as read
      },
      {
        $addToSet: {
          readBy: {
            user: userId,
            readAt: new Date()
          }
        },
        isRead: true
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Search conversations and users
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;

    if (!query || query.length < 2) {
      return res.json({ conversations: [], users: [] });
    }

    // Search in conversations
    const conversations = await Conversation.find({
      participants: userId,
      isGroup: false
    })
    .populate('participants', 'username name photoURL isOnline lastSeen')
    .populate('lastMessage');

    const filteredConversations = conversations.filter(conv => 
      conv.participants.some(participant => 
        participant._id.toString() !== userId &&
        (participant.name?.toLowerCase().includes(query.toLowerCase()) ||
         participant.username?.toLowerCase().includes(query.toLowerCase()))
      )
    );

    // Search users (excluding current user)
    const User = require('../models/User');
    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    }).select('username name photoURL isOnline lastSeen');

    res.json({
      conversations: filteredConversations,
      users
    });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Delete conversation
router.delete('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findOneAndDelete({
      _id: conversationId,
      participants: userId,
      isGroup: false
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Optionally delete messages as well
    await Message.deleteMany({ conversation: conversationId });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

module.exports = router;