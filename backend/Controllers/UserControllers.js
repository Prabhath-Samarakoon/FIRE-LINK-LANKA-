const User = require("../Model/UserModel");

const getAllUsers = async (req, res, next) => {

    let users;
    try {
        users = await User.find();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching users", error: err.message });
    }

    if (!users) {
        return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json({ 
        success: true,
        message: "Users retrieved successfully",
        data: users,
        count: users.length
    });
};

const normalizeName = (value) => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value);

const addUsers = async (req, res, next) => {
    try {
        const { name, gmail, age, address, position = "" } = req.body;
        const photo = req.file ? `/uploads/users/${req.file.filename}` : (req.body.photo || "");

        // Basic validation
        if (!name || !gmail || !age || !address || !position) {
            return res.status(400).json({ success: false, message: "All fields are required: name, gmail, age, address, position" });
        }

        const normalizedEmail = String(gmail).trim().toLowerCase();
        const normalizedName = normalizeName(String(name));

        const emailRegex = /^\S+@\S+\.[\S]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        const numericAge = Number(age);
        if (!Number.isInteger(numericAge) || numericAge < 18 || numericAge > 65) {
            return res.status(400).json({ success: false, message: "Age must be an integer between 18 and 65" });
        }

        // Uniqueness checks
        const existingByEmail = await User.findOne({ gmail: normalizedEmail });
        if (existingByEmail) {
            return res.status(409).json({ success: false, message: "Email already exists" });
        }
        const existingByName = await User.findOne({ name: normalizedName });
        if (existingByName) {
            return res.status(409).json({ success: false, message: "Name already exists" });
        }

        const newUser = new User({
            name: normalizedName,
            gmail: normalizedEmail,
            age: numericAge,
            address: String(address).trim(),
            position: String(position).trim(),
            photo
        });
        const saved = await newUser.save();

        return res.status(201).json({ 
            success: true,
            message: "User created successfully",
            data: saved
        });
    } catch (err) {
        console.log(err);
        // Handle duplicate key error from MongoDB
        if (err && err.code === 11000) {
            const key = Object.keys(err.keyPattern || {})[0] || 'field';
            return res.status(409).json({ success: false, message: `${key} already exists` });
        }
        return res.status(500).json({ success: false, message: "Error adding user", error: err.message });
    }
}

const getById = async (req, res, next) => {

    const id = req.params.id;

    let user;
    try {
        user = await User.findById(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching user", error: err.message });
    }

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ 
        success: true,
        message: "User retrieved successfully",
        data: user
    });
};

//Update User details
const updateUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { name, gmail, age, address, position = "" } = req.body;
        const photo = req.file ? `/uploads/users/${req.file.filename}` : (req.body.photo || "");

        const update = {};
        if (name !== undefined) update.name = normalizeName(String(name));
        if (gmail !== undefined) update.gmail = String(gmail).trim().toLowerCase();
        if (age !== undefined) {
            const numericAge = Number(age);
            if (!Number.isInteger(numericAge) || numericAge < 18 || numericAge > 65) {
                return res.status(400).json({ success: false, message: "Age must be an integer between 18 and 65" });
            }
            update.age = numericAge;
        }
        if (address !== undefined) update.address = String(address).trim();
        if (position !== undefined) update.position = String(position).trim();
        if (photo) update.photo = photo;

        // If updating email or name, enforce uniqueness excluding current user
        if (update.gmail) {
            const exists = await User.findOne({ _id: { $ne: id }, gmail: update.gmail });
            if (exists) return res.status(409).json({ success: false, message: "Email already exists" });
        }
        if (update.name) {
            const exists = await User.findOne({ _id: { $ne: id }, name: update.name });
            if (exists) return res.status(409).json({ success: false, message: "Name already exists" });
        }

        const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).json({ success: false, message: "Unable to Update User details" });
        }
        return res.status(200).json({ 
            success: true,
            message: "User updated successfully",
            data: user
        });
    } catch (err) {
        console.log(err);
        if (err && err.code === 11000) {
            const key = Object.keys(err.keyPattern || {})[0] || 'field';
            return res.status(409).json({ success: false, message: `${key} already exists` });
        }
        return res.status(500).json({ success: false, message: "Error updating user", error: err.message });
    }
};

//Delete User
const deleteUser = async (req, res, next) => {
    const id = req.params.id;

    let user;
    try {
        user = await User.findByIdAndDelete(id);
    } catch (err) { 
        console.log(err);
        return res.status(500).json({ message: "Error deleting user", error: err.message });
    }       
    if (!user) {
        return res.status(404).json({ message: "Unable to Delete User details" });  
    }
    return res.status(200).json({ 
        success: true,
        message: "User deleted successfully"
    });
};

// Search users by name
const searchUsers = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return res.status(200).json({ 
                success: true,
                message: "Search query too short",
                data: { users: [] }
            });
        }
        
        const users = await User.find({
            name: { $regex: q, $options: 'i' }
        }).select('name position').limit(10);
        
        return res.status(200).json({ 
            success: true,
            message: "Users found successfully",
            data: { users }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error searching users", error: err.message });
    }
};

// Counts by position
const getCountByPosition = async (req, res, next) => {
    try {
        const allUsers = await User.find();
        const byPosition = {};
        for (const u of allUsers) {
            const key = u.position || "Unassigned";
            byPosition[key] = (byPosition[key] || 0) + 1;
        }
        const breakdown = Object.entries(byPosition).map(([position, count]) => ({ position, count }));
        const total = allUsers.length;
        return res.status(200).json({ 
            success: true,
            message: "User counts retrieved successfully",
            data: { total, byPosition, breakdown }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error counting users", error: err.message });
    }
};

exports.getAllUsers = getAllUsers;
exports.addUsers = addUsers;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.searchUsers = searchUsers;
exports.getCountByPosition = getCountByPosition;