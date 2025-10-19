const mongoose = require('mongoose');


const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      enum: ["Reel", "Post", "Comment"],
      default: "Reel", // ✅ default type is Reel
    },
  },
  { timestamps: true }
);

// Prevent duplicate likes by same user for same item
likeSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true });



module.exports=   mongoose.model("Like", likeSchema);
