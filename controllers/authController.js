const User = require('../models/User');
const admin = require('firebase-admin');

// Initialize Firebase Admin (optional for verification)
// const serviceAccount = require('../path-to-your-service-account-key.json');

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
//   });
// }

const handleGoogleAuth = async (req, res) => {
    try {
        const { idToken, user: firebaseUser } = req.body;

 

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: 'ID token is required'
            });
        }

        // Verify Firebase ID token
        // const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, displayName, photoURL } = firebaseUser;

        // Check if user exists in our database
        let user = await User.findOne({ uid });

        if (user) {
            // Update last login for existing user
            user.lastLogin = new Date();
            user.isNewUser = false;
            await user.save();

            return res.json({
                success: true,
                user: {
                    id: user._id,
                    uid: user.uid,
                    email: user.email,
                    name: user.name,
                    photoURL: user.photoURL,
                    isNewUser: false
                },
                message: 'Login successful'
            });
        } else {
            // Create new user
            user = new User({
                uid,
                email,
                name:displayName,
                photoURL: photoURL || '',
                isNewUser: true
            });

            await user.save();

            return res.status(201).json({
                success: true,
                user: {
                    id: user._id,
                    uid: user.uid,
                    email: user.email,
                    name: user.name,
                    photoURL: user.photoURL,
                    isNewUser: true
                },
                message: 'Account created successfully'
            });
        }

    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};




 





const profileCreate = async (req, res) => {
  try {
    const { user } = req.body; // expecting { user: { name, uuid, phone } }
console.log(req.body)
    if (!user || !user.id) {
      return res.status(400).json({
        success: false,
        message: 'User UUID is required',
      });
    }

    const { id, name, phone } = user;

    // Find user by uid
    let existingUser = await User.findById( id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fullName and phone
    existingUser.fullName = name || existingUser.name;
    existingUser.phone = phone || existingUser.phone;

    await existingUser.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: existingUser._id,
        uid: existingUser.uid,
        email: existingUser.email,
        fullName: existingUser.fullName,
        phone: existingUser.phone,
        photoURL: existingUser.photoURL,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile' || error.message,
      error: error.message,
    });
  }
};

















const checkUserExists = async (req, res) => {
    try {
        const { uid } = req.params;
        
        const user = await User.findOne({ uid });
        
        if (user) {
            return res.json({
                success: true,
                exists: true,
                user: {
                    id: user._id,
                    uid: user.uid,
                    email: user.email,
                    name: user.name,
                    isNewUser: false
                }
            });
        } else {
            return res.json({
                success: true,
                exists: false
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking user',
            error: error.message
        });
    }
};

module.exports = {
    handleGoogleAuth,profileCreate,
    checkUserExists
};