const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true
    },


  username: {
    type: String,
    
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  }
  
  
  ,  password: {
    type: String,
    
    minlength: 6
  },


 bio: {
    type: String,
    default: '',
    maxlength: 150
  },

  dateOfBirth: {
    type: Date
  },



  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  },

  website: {
    type: String,
    default: ''
  },




  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],




    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },



    fullName: {
        type: String,
       
        trim: true
    },
    phone: {
        type: String,
        
        trim: true
    },




    photoURL: {
        type: String,
        default: ''
    },
    provider: {
        type: String,
        default: 'google'
    },
    isNewUser: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },

  isVerified: {
    type: Boolean,
    default: false
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  location: {
    country: String,
    city: String,
    latitude: Number,
    longitude: Number
  },
  notificationSettings: {
    pushNotifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true }
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String
  },
  preferences: {
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'USD' },
    theme: { type: String, default: 'light' }
  }
}










 , {
  timestamps: true
}  );







userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};







module.exports = mongoose.model('User', userSchema);