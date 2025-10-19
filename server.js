// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./config/database');



// const    Server =   require('socket.io') ;

// const io = new Server.Server()






// // Import routes
// const authRoutes = require('./routes/authRoutes');
// const reelsRoutes = require('./routes/reelsAuth');
// const reelRoutes = require('./routes/reelRoutes');

// // Initialize express app
// const app = express();
// const path = require("path") ;





























 



// const helmet = require('helmet');
// app.use(helmet());
// app.use(express.json({ limit: '10mb' }));
// const rateLimit = require('express-rate-limit');
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);



















// // ✅ Serve the uploads folder statically
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.use((req, res, next) => {
//   const now = new Date().toLocaleString();
//   console.log(`✅ [${now}] Route hit: ${req.method} ${req.originalUrl}`);
//   next();
// });


// // Connect to database
// connectDB();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/reels', reelsRoutes);
// app.use('/api/reel', reelRoutes);
// app.use('/api/user', require('./routes/user.js'));
// app.use('/api/posts', require('./routes/posts.js'));
// app.use('/api/chat',  require('./routes/chat.js'));



// // Basic route
// app.get('/', (req, res) => {
//     res.json({ message: 'Auth API is running' });
// });


// const { setupSocketHandlers } = require('./sockets/socketHandlers');
// setupSocketHandlers(io);



// // Start server
// const PORT = process.env.PORT || 5000;
// io.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });






 

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http'); // ✅ HTTP server ke liye import
const { Server } = require('socket.io'); // ✅ socket.io Server import

// Initialize express app
const app = express();




// app.use(
//   "/files",
//   express.static(path.join(__dirname, "files"), {
//     setHeaders: (res, filePath) => {
//       if (filePath.endsWith(".mp4")) {
//         res.setHeader("Content-Type", "video/mp4");
//       }
//     },
//   })
// );
app.use(
  "/localfile",
  
  express.static(path.join(__dirname, "localfile"))
);


// ✅ Create HTTP server from Express app
const server = http.createServer(app);

// ✅ Initialize Socket.IO with CORS setup
const io = new Server(server, {
  cors: {
    origin: '*', // React Native / frontend ka origin yahan likh sakte ho
    methods: ['GET', 'POST'],
  },
});


app.use(express.json({ limit: '10mb' }));

 
app.use(cors());

// ✅ Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Log routes
app.use((req, res, next) => {
  const now = new Date().toLocaleString();
  console.log(`✅ [${now}] Route hit: ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Connect MongoDB
connectDB();

// ✅ Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reels', require('./routes/reelsAuth'));
app.use('/api/reel', require('./routes/reelRoutes'));
app.use('/api/user', require('./routes/user.js'));
app.use('/api/posts', require('./routes/posts.js'));
app.use('/api/chat', require('./routes/chat.js'));
app.use('/api/stores', require('./routes/stores.js'));

 


app.use('/api/users', require('./routes/users.js'));
 
app.use('/api/qr-scanner', require('./routes/qrScanner.js'));





 

app.use('/api/products', require('./routes/product.js'));
app.use('/api/delivery-address', require('./routes/deliveryAddress.js'));

// ✅ Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Auth API is running' });
});

// ✅ Setup Socket Handlers
const { setupSocketHandlers } = require('./sockets/socketHandlers');
setupSocketHandlers(io);

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
