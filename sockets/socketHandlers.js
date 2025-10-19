const { Message, Conversation } = require('../models/Chat');
const User = require('../models/User');

const onlineUsers = new Map();

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User goes online
    socket.on('user_online', async (userId) => {
      try {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date()
        });

        socket.join(`user_${userId}`);
        
        // Notify all users in conversations with this user
        const userConversations = await Conversation.find({
          participants: userId
        });
        
        userConversations.forEach(conv => {
          conv.participants.forEach(participantId => {
            if (participantId.toString() !== userId) {
              io.to(`user_${participantId}`).emit('user_status_changed', { 
                userId, 
                isOnline: true 
              });
            }
          });
        });
        
      } catch (error) {
        console.error('Error in user_online:', error);
      }
    });

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, messageType = 'text', media, repliedTo } = data;
        const senderId = socket.userId;

        if (!senderId) {
          socket.emit('message_error', { error: 'User not authenticated' });
          return;
        }

        // Verify user is participant of conversation
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: senderId
        }).populate('participants');

        if (!conversation) {
          socket.emit('message_error', { error: 'Conversation not found' });
          return;
        }

        // Create message
        const message = new Message({
          conversation: conversationId,
          sender: senderId,
          content,
          messageType,
          media: media || [],
          repliedTo
        });

        await message.save();

        // Update conversation last message
        conversation.lastMessage = message._id;
        await conversation.save();

        // Populate message for emission
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username name photoURL')
          .populate('repliedTo');

        // Emit to all participants in the conversation room
        io.to(`conversation_${conversationId}`).emit('new_message', populatedMessage);

        // Notify other participants individually
        conversation.participants.forEach(participant => {
          if (participant._id.toString() !== senderId) {
            const participantSocketId = onlineUsers.get(participant._id.toString());
            if (participantSocketId) {
              io.to(participantSocketId).emit('message_notification', {
                conversationId,
                message: populatedMessage,
                unreadCount: 1
              });
            }
          }
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing_start', async (data) => {
      const { conversationId } = data;
      const userId = socket.userId;

      if (!userId) return;

      await Conversation.findByIdAndUpdate(conversationId, {
        $addToSet: { 
          typingUsers: { 
            user: userId,
            startedAt: new Date()
          }
        }
      });

      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId,
        isTyping: true
      });
    });

    socket.on('typing_stop', async (data) => {
      const { conversationId } = data;
      const userId = socket.userId;

      if (!userId) return;

      await Conversation.findByIdAndUpdate(conversationId, {
        $pull: { typingUsers: { user: userId } }
      });

      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId,
        isTyping: false
      });
    });

    // Mark messages as read
    socket.on('mark_as_read', async (data) => {
      try {
        const { conversationId, messageIds } = data;
        const userId = socket.userId;

        if (!userId) return;

        await Message.updateMany(
          {
            _id: { $in: messageIds },
            sender: { $ne: userId }
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

        socket.to(`conversation_${conversationId}`).emit('messages_read', {
          messageIds,
          readBy: userId
        });

      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        if (socket.userId) {
          onlineUsers.delete(socket.userId);
          
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: new Date()
          });

          // Notify all users in conversations
          const userConversations = await Conversation.find({
            participants: socket.userId
          });
          
          userConversations.forEach(conv => {
            conv.participants.forEach(participantId => {
              if (participantId.toString() !== socket.userId) {
                io.to(`user_${participantId}`).emit('user_status_changed', { 
                  userId: socket.userId, 
                  isOnline: false 
                });
              }
            });
          });
        }
        console.log('User disconnected:', socket.id);
      } catch (error) {
        console.error('Error in disconnect handler:', error);
      }
    });
  });
};

module.exports = { setupSocketHandlers };