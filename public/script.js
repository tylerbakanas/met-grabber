// public/script.js
document.addEventListener('DOMContentLoaded', () => {
    const fetchImageBtn = document.getElementById('fetchImageBtn');
    const searchQueryInput = document.getElementById('searchQueryInput'); // Get the new input element
    const imageDisplay = document.getElementById('imageDisplay');
    const artworkTitle = document.getElementById('artworkTitle');
    const artworkArtist = document.getElementById('artworkArtist');
    const artworkObjectId = document.getElementById('artworkObjectId');
    const artworkUrl = document.getElementById('artworkUrl');

    fetchImageBtn.addEventListener('click', async () => {
        const searchTerm = searchQueryInput.value.trim(); // Get the value from the input and trim whitespace

        imageDisplay.innerHTML = '<p>Fetching a random artwork...</p>'; // Show loading state
        artworkTitle.textContent = 'N/A';
        artworkArtist.textContent = 'N/A';
        artworkObjectId.textContent = 'N/A';
        artworkUrl.style.display = 'none';
        artworkUrl.href = '#';

        try {
            // Encode the search term to be safe for URL parameters
            const encodedSearchTerm = encodeURIComponent(searchTerm);

            // Construct the API URL. If searchTerm is empty, send a default (or skip 'q' param)
            // For now, let's always include 'q' - backend will handle empty if needed.
            const apiUrl = `/api/random-met-image?q=${encodedSearchTerm}`;

            const response = await fetch(apiUrl);
            const data = await response.json();

            if (response.ok) {
                if (data.imageUrl) {
                    imageDisplay.innerHTML = `<img src="${data.imageUrl}" alt="${data.title || 'Met Artwork'}">`;
                    artworkTitle.textContent = data.title || 'Unknown Title';
                    artworkArtist.textContent = data.artist || 'Unknown Artist';
                    artworkObjectId.textContent = data.objectID || 'N/A';
                    if (data.objectURL) {
                        artworkUrl.href = data.objectURL;
                        artworkUrl.style.display = 'inline';
                    }
                } else {
                    imageDisplay.innerHTML = `<p>Error: ${data.message || 'No image URL found.'}</p>`;
                }
            } else {
                imageDisplay.innerHTML = `<p>Error: ${data.message || 'Could not fetch image.'}</p>`;
            }
        } catch (error) {
            console.error('Error fetching random Met image:', error);
            imageDisplay.innerHTML = '<p>Failed to connect to server or fetch data.</p>';
        }
    });
});