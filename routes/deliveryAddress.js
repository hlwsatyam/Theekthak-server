const express = require('express');
const router = express.Router();
const DeliveryAddress = require('../models/DeliveryAddress');
const Order = require('../models/Order');
const auth = require('../middlewares/auth');

// Get all delivery addresses for user
router.get('/', auth, async (req, res) => {
  try {
    const addresses = await DeliveryAddress.find({ 
      user: req.user,
      isActive: true 
    }).sort({ isDefault: -1, createdAt: -1 });
    
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/default', auth, async (req, res) => {
  try {
    const address = await DeliveryAddress.findOne({
      isDefault: true,
      user: req.user
    });
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




// Get single delivery address
router.get('/:id', auth, async (req, res) => {
  try {
    const address = await DeliveryAddress.findOne({
      _id: req.params.id,
      user: req.user
    });
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Create new delivery address







router.post("/", auth, async (req, res) => {
  try {
    const {
      title,
      addressLine1,
      city,
      state,
      pincode,
      contactName,
      contactNumber,
      location,
    } = req.body;

    // --- VALIDATION SECTION ---
    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required." });
    }

    if (!addressLine1 || addressLine1.trim() === "") {
      return res.status(400).json({ message: "Address Line 1 is required." });
    }

    if (!city || city.trim() === "") {
      return res.status(400).json({ message: "City is required." });
    }

    if (!state || state.trim() === "") {
      return res.status(400).json({ message: "State is required." });
    }

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ message: "Please enter a valid 6-digit pincode." });
    }

    if (!contactName || contactName.trim() === "") {
      return res.status(400).json({ message: "Contact name is required." });
    }

    if (!contactNumber || !/^\d{10}$/.test(contactNumber)) {
      return res.status(400).json({ message: "Please enter a valid 10-digit contact number." });
    }

    if (
      !location ||
      typeof location.latitude !== "number" ||
      typeof location.longitude !== "number"
    ) {
      return res.status(400).json({ message: "Location (latitude & longitude) is required." });
    }

    // --- CREATE AND SAVE ---
    const address = new DeliveryAddress({
      ...req.body,
      user: req.user,
    });





    // If first address, set as default
   

  const s=  await address.save();
  const count = await DeliveryAddress.countDocuments({ user: req.user });

 if (count === 1) {
      await DeliveryAddress.findByIdAndUpdate(s._id, {
        isDefault:true
      })
    }



 
 
    res.status(201).json({
      message: "Address added successfully.",
      address,
    });
  } catch (error) {
    console.error("Error while adding delivery address:", error);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
});






// Update delivery address
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user has active orders where address is being used
    const activeOrders = await Order.findOne({
      user: req.user,
      deliveryAddress: req.params.id,
      status: { $in: ['confirmed', 'preparing', 'on_the_way'] }
    });
    
    if (activeOrders) {
      return res.status(400).json({ 
        message: 'Cannot edit address while you have active food deliveries' 
      });
    }
    
    const address = await DeliveryAddress.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    res.json(address);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

 













 router.delete("/:id", auth, async (req, res) => {
  try {
    // 1️⃣ Check if this address was used in any order
    const ordersWithAddress = await Order.findOne({
      deliveryAddress: req.params.id,
    });

    if (ordersWithAddress) {
      return res.status(400).json({
        message: "Cannot delete address that is used in previous orders.",
      });
    }

    // 2️⃣ Find and delete the address
    const address = await DeliveryAddress.findOneAndDelete({
      _id: req.params.id,
      user: req.user,
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found." });
    }

    // 3️⃣ Check if the deleted one was default
    const wasDefault = address.isDefault;

    // 4️⃣ If default, make another available address the default one
    if (wasDefault) {
      const nextAddress = await DeliveryAddress.findOne({
        user: req.user,
      }).sort({ createdAt: -1 }); // latest added address

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    // 5️⃣ Respond with success
    res.json({
      message: wasDefault
        ? "Default address deleted. Another address has been set as default."
        : "Address deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: error.message });
  }
});
















// Set default address
router.patch('/:id/set-default', auth, async (req, res) => {
  try {
    await DeliveryAddress.updateMany(
      { user: req.user },
      { isDefault: false }
    );
    
    const address = await DeliveryAddress.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      { isDefault: true },
      { new: true }
    );
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;