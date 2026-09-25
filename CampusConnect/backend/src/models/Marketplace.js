const mongoose = require('mongoose');
const { UNIVERSITY_OPTIONS } = require('../constants/universities');

const marketplaceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Listing title is required'],
            trim: true,
            minlength: [3, 'Listing title must be at least 3 characters'],
            maxlength: [140, 'Listing title cannot exceed 140 characters']
        },

        courseCode: {
            type: String,
            required: [true, 'Course code is required'],
            trim: true,
            uppercase: true,
            minlength: [2, 'Course code must be at least 2 characters'],
            maxlength: [30, 'Course code cannot exceed 30 characters']
        },

        pricePKR: {
            type: Number,
            required: [true, 'Price in PKR is required'],
            min: [0, 'Price cannot be negative'],
            max: [100000000, 'Price cannot exceed 100,000,000 PKR']
        },

        universityTag: {
            type: String,
            required: [true, 'University tag is required'],
            enum: {
                values: UNIVERSITY_OPTIONS,
                message:
                    'University tag must be one of: NUST, FAST, COMSATS, Bahria, Air, or Other'
            },
            index: true
        },

        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Seller is required'],
            index: true
        },

        driveLink: {
            type: String,
            required: [true, 'Google Drive link is required'],
            trim: true,
            maxlength: [500, 'Google Drive link cannot exceed 500 characters'],
            match: [
                /^https:\/\/(drive\.google\.com|docs\.google\.com|sheets\.google\.com|forms\.google\.com)\/.+$/i,
                'driveLink must be a valid Google Drive or Google Docs link'
            ]
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model('Marketplace', marketplaceSchema);