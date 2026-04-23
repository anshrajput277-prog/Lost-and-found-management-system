const express = require('express');
const Item = require('../models/Item');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all item routes
router.use(authMiddleware);

// POST /api/items → Add item
router.post('/', async (req, res) => {
  try {
    const { itemName, description, type, location, date, contactInfo } = req.body;

    if (!itemName || !description || !type || !location || !contactInfo) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const item = await Item.create({
      itemName,
      description,
      type,
      location,
      date: date || Date.now(),
      contactInfo,
      postedBy: req.user.id,
    });

    await item.populate('postedBy', 'name email');
    res.status(201).json({ message: 'Item reported successfully', item });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ message: 'Server error while adding item' });
  }
});

// GET /api/items/search?name=xyz → Search items (must be before /:id)
router.get('/search', async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ message: 'Search query "name" is required' });
    }

    const items = await Item.find({
      $or: [
        { itemName: { $regex: name, $options: 'i' } },
        { type: { $regex: name, $options: 'i' } },
        { location: { $regex: name, $options: 'i' } },
        { description: { $regex: name, $options: 'i' } },
      ],
    }).populate('postedBy', 'name email');

    res.status(200).json({ count: items.length, items });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error during search' });
  }
});

// GET /api/items → View all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find()
      .sort({ createdAt: -1 })
      .populate('postedBy', 'name email');

    res.status(200).json({ count: items.length, items });
  } catch (error) {
    console.error('Fetch items error:', error);
    res.status(500).json({ message: 'Server error while fetching items' });
  }
});

// GET /api/items/:id → View item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('postedBy', 'name email');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ item });
  } catch (error) {
    console.error('Fetch item error:', error);
    res.status(500).json({ message: 'Server error while fetching item' });
  }
});

// PUT /api/items/:id → Update item
router.put('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Only the owner can update
    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own items' });
    }

    const { itemName, description, type, location, date, contactInfo } = req.body;

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { itemName, description, type, location, date, contactInfo },
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email');

    res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error while updating item' });
  }
});

// DELETE /api/items/:id → Delete item
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Only the owner can delete
    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own items' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error while deleting item' });
  }
});

module.exports = router;
