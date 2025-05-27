// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get a random image from the Met
app.get('/api/random-met-image', async (req, res) => {
    try {
        // Get the 'q' parameter from the request query string
        // Default to 'art' if the 'q' parameter is not provided or is empty
        const searchTerm = req.query.q ? req.query.q.trim() : 'art';

        // Construct the search URL for the Met API
        // Only include the 'q' parameter if searchTerm is not empty
        let searchUrl = 'https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&isPublicDomain=true';
        if (searchTerm) { // Check if searchTerm is not empty
            searchUrl += `&q=${encodeURIComponent(searchTerm)}`;
        } else {
            // If searchTerm is empty, it might be better to use a general term or handle differently.
            // For now, let's default to 'art' in the backend if frontend sends empty 'q'
            searchUrl += `&q=art`; // Fallback to a general term if user provides empty input
        }


        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (!searchResponse.ok) {
            console.error('Met API Search request failed:', searchResponse.status, searchResponse.statusText);
            return res.status(searchResponse.status).json({ message: 'Failed to search Met API: ' + searchResponse.statusText });
        }

        if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
            console.warn(`Met API Search found no object IDs for query "${searchTerm}" with images or in public domain.`);
            return res.status(404).json({ message: `No suitable public domain artworks with images found for "${searchTerm}". Try a different term.` });
        }

        const objectIDs = searchData.objectIDs;
        const randomObjectID = objectIDs[Math.floor(Math.random() * objectIDs.length)];

        const objectDetailsUrl = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${randomObjectID}`;
        const detailsResponse = await fetch(objectDetailsUrl);
        const detailsData = await detailsResponse.json();

        if (!detailsResponse.ok) {
            console.error('Met API Object details request failed for ID:', randomObjectID, detailsResponse.status, detailsResponse.statusText);
            return res.status(detailsResponse.status).json({ message: `Failed to fetch details for object ID ${randomObjectID}: ${detailsResponse.statusText}` });
        }

        if (detailsData.primaryImage && detailsData.isPublicDomain) {
            res.json({
                imageUrl: detailsData.primaryImage,
                title: detailsData.title || 'Unknown Title',
                artist: detailsData.artistDisplayName || 'Unknown Artist',
                objectID: detailsData.objectID,
                objectURL: detailsData.objectURL || '#'
            });
        } else if (detailsData.primaryImageSmall && detailsData.isPublicDomain) {
            res.json({
                imageUrl: detailsData.primaryImageSmall,
                title: detailsData.title || 'Unknown Title',
                artist: detailsData.artistDisplayName || 'Unknown Artist',
                objectID: detailsData.objectID,
                objectURL: detailsData.objectURL || '#'
            });
        } else {
            console.warn(`Object ID ${randomObjectID} unexpectedly has no valid image or is not public domain despite search filter.`);
            return res.status(404).json({ message: 'Selected artwork does not have an available primary image or is not public domain. Please try again with a different search term.' });
        }

    } catch (error) {
        console.error('Server-side error in /api/random-met-image:', error);
        res.status(500).json({ message: 'Internal server error while fetching Met image.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});