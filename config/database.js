const mongoose = require('mongoose');
// const Store = require('../models/Store');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);






// const stores = await Store.find();
// for (const store of stores) {
//   if (store.location?.coordinates?.longitude && store.location?.coordinates?.latitude) {
//     store.geo = {
//       type: 'Point',
//       coordinates: [
//         store.location.coordinates.longitude,
//         store.location.coordinates.latitude
//       ]
//     };
//     await store.save();
//   }
// }



        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;