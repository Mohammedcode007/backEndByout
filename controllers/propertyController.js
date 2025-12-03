const Property = require('../models/Property');
const mongoose = require('mongoose');

// إضافة عقار
const addProperty = async (req, res, next) => {
  try {
    const ownerId = req.user._id; // من JWT
    const propertyData = req.body;

    const property = await Property.create({ ...propertyData, owner: ownerId });
    res.status(201).json(property);
  } catch (err) {
    next(err);
  }
};

// تعديل عقار
const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid property ID" });

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    // التأكد أن المستخدم هو المالك
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this property" });
    }

    Object.assign(property, req.body); // تحديث الحقول المرسلة
    await property.save();

    res.json(property);
  } catch (err) {
    next(err);
  }
};

// حذف عقار
const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid property ID" });

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this property" });
    }

    await property.remove();
    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// جلب عقار واحد
const getProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid property ID" });

    const property = await Property.findById(id).populate('owner', 'name email phone');
    if (!property) return res.status(404).json({ message: "Property not found" });

    res.json(property);
  } catch (err) {
    next(err);
  }
};

// جلب كل العقارات مع فلترة بسيطة
const getAllProperties = async (req, res, next) => {
  try {
    const { type, transactionType, city, featured, status } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (transactionType) filter.transactionType = transactionType;
    if (city) filter['location.city'] = city;
    if (featured) filter.featured = featured === 'true';
    if (status) filter.status = status;

    const properties = await Property.find(filter).populate('owner', 'name email phone');
    res.json(properties);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addProperty,
  updateProperty,
  deleteProperty,
  getProperty,
  getAllProperties
};
