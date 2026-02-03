const mongoose = require ("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({ 

    name:{
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
        unique: true,
        index: true,
        set: (v) => typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : v
    }, 
    gmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        index: true,
        match: [/^\S+@\S+\.[\S]+$/, 'Invalid email format']
    },
    age:{
        type: Number,
        required: true,
        min: 18,
        max: 65
    },
    address:{
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 200
    },
    position:{
        type: String,
        required: true,
        trim: true,
        default: ""
    },
    photo:{
        type: String,
        required: false,
        default: ""
    }
}, { timestamps: true });

// Indexes are already defined in the schema fields above

module.exports = mongoose.model("UserModel", userSchema)
