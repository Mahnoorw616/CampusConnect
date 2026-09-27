const mongoose = require('mongoose');
const Marketplace = require('../models/Marketplace');
const { UNIVERSITY_OPTIONS } = require('../constants/universities');

const GOOGLE_DRIVE_HOSTS = new Set([
    'drive.google.com',
    'docs.google.com',
    'sheets.google.com',
    'forms.google.com'
]);

const isValidGoogleDriveLink = (value) => {
    try {
        const parsedUrl = new URL(String(value));

        return (
            parsedUrl.protocol === 'https:' &&
            GOOGLE_DRIVE_HOSTS.has(parsedUrl.hostname.toLowerCase())
        );
    } catch (_error) {
        return false;
    }
};

const populateListing = (query) =>
    query.populate(
        'sellerId',
        'name email university batchYear whatsappNumber'
    );

const serializeListing = (listing, viewerId) => {
    const returnedListing = listing.toObject();

    returnedListing.isOwner = Boolean(
        viewerId &&
        listing.sellerId &&
        listing.sellerId._id &&
        listing.sellerId._id.toString() === viewerId.toString()
    );

    return returnedListing;
};

const getListings = async (req, res, next) => {
    try {
        const university = req.query.uni
            ? String(req.query.uni).trim()
            : '';

        const filter = {};

        if (university) {
            if (!UNIVERSITY_OPTIONS.includes(university)) {
                return res.status(400).json({
                    success: false,
                    message: `uni must be one of: ${UNIVERSITY_OPTIONS.join(', ')}`
                });
            }

            filter.universityTag = university;
        }

        const listings = await populateListing(
            Marketplace.find(filter).sort({ createdAt: -1 })
        );

        return res.status(200).json({
            success: true,
            count: listings.length,
            listings: listings.map((listing) =>
                serializeListing(listing, req.user._id)
            )
        });
    } catch (error) {
        return next(error);
    }
};

const createListing = async (req, res, next) => {
    try {
        const {
            title,
            courseName,
            courseCode,
            pricePKR,
            universityTag,
            driveLink,
            description,
            coverImage
        } = req.body;

        if (
            !title ||
            !courseName ||
            !courseCode ||
            pricePKR === undefined ||
            pricePKR === null ||
            pricePKR === '' ||
            (typeof pricePKR === 'string' && !pricePKR.trim()) ||
            !universityTag ||
            !description
        ) {
            return res.status(400).json({
                success: false,
                message:
                    'title, courseName, courseCode, pricePKR, universityTag, and description are required'
            });
        }

        const numericPrice = Number(pricePKR);

        if (!Number.isFinite(numericPrice) || numericPrice < 0) {
            return res.status(400).json({
                success: false,
                message: 'pricePKR must be a non-negative number'
            });
        }

        const normalizedUniversity = String(universityTag).trim();

        if (!UNIVERSITY_OPTIONS.includes(normalizedUniversity)) {
            return res.status(400).json({
                success: false,
                message: `universityTag must be one of: ${UNIVERSITY_OPTIONS.join(', ')}`
            });
        }

        const normalizedDriveLink = driveLink
            ? String(driveLink).trim()
            : '';

        if (
            normalizedDriveLink &&
            !isValidGoogleDriveLink(normalizedDriveLink)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    'driveLink must be a valid HTTPS Google Drive or Google Docs link'
            });
        }

        const normalizedCoverImage = coverImage
            ? String(coverImage).trim()
            : '';

        if (normalizedCoverImage) {
            try {
                const imageUrl = new URL(normalizedCoverImage);

                if (!['http:', 'https:'].includes(imageUrl.protocol)) {
                    throw new Error('Invalid cover image protocol');
                }
            } catch (_error) {
                return res.status(400).json({
                    success: false,
                    message: 'coverImage must be a valid HTTP or HTTPS URL'
                });
            }
        }

        const listing = await Marketplace.create({
            title: String(title).trim(),
            courseName: String(courseName).trim(),
            courseCode: String(courseCode).trim().toUpperCase(),
            pricePKR: numericPrice,
            universityTag: normalizedUniversity,
            sellerId: req.user._id,
            description: String(description).trim(),
            driveLink: normalizedDriveLink,
            coverImage: normalizedCoverImage
        });

        const populatedListing = await populateListing(
            Marketplace.findById(listing._id)
        );

        return res.status(201).json({
            success: true,
            message: 'Marketplace listing created successfully',
            listing: serializeListing(
                await populatedListing,
                req.user._id
            )
        });
    } catch (error) {
        return next(error);
    }
};

const deleteListing = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid marketplace listing ID'
            });
        }

        const listing = await Marketplace.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Marketplace listing not found'
            });
        }

        if (listing.sellerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own marketplace listings'
            });
        }

        await Marketplace.findByIdAndDelete(listing._id);

        return res.status(200).json({
            success: true,
            message: 'Marketplace listing deleted successfully'
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getListings,
    createListing,
    deleteListing
};