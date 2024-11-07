// ****************************************************************************
// * I declare that this assignment is my own work in accordance with the Seneca Academic
// * Policy. No part of this assignment has been copied manually or electronically from
// * any other source (including web sites) or distributed to other students.
// *
// * https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
// *
// * Assignment: 2247 / 2
// * Student Name: Kriss Kapadia
// * Student Email: kakapadia@myseneca.ca
// * Course/Section: WEB422/ZAA
// * Deployment URL: https://web-422-ass1.vercel.app
// *
// *****************************************************************************

let page = 1; // Track the current page
const perPage = 15; // Number of listings per page
let searchName = null; // Current search value

// Load Listings Data
function loadListingsData() {
    let url = `https://web-422-ass1.vercel.app/api/listings?page=${page}&perPage=${perPage}`;

    // Include search name if it exists
    if (searchName) {
        url += `&name=${searchName}`;
    }

    fetch(url)
        .then(res => {
            return res.ok ? res.json() : Promise.reject(res.status);
        })
        .then(data => {
            const listingsTableBody = document.querySelector('#listingsTable tbody');
            listingsTableBody.innerHTML = ''; 
            
            // Check if the data array is not empty
            if (data.length) {
                // Generate table rows
                const rows = data.map(listing => `
                    <tr data-id="${listing._id}">
                        <td>${listing.name}</td>
                        <td>${listing.room_type}</td>
                        <td>${listing.address.street}, ${listing.address.city}, ${listing.address.state} ${listing.address.zip}, ${listing.address.country}</td>
                        <td>
                            ${listing.summary || "No summary available."}<br/><br/>
                            <strong>Accommodates:</strong> ${listing.accommodates}<br/>
                            <strong>Rating:</strong> ${listing.review_scores?.review_scores_rating || "N/A"} (${listing.number_of_reviews || 0} Reviews)
                        </td>
                    </tr>
                `).join('');

                listingsTableBody.innerHTML = rows;
                // Update the current page display
                document.getElementById('current-page').textContent = page;

                // Add click events to each row
                listingsTableBody.querySelectorAll('tr').forEach(row => {
                    row.addEventListener('click', () => {
                        const listingId = row.getAttribute('data-id');
                        loadListingDetails(listingId);
                    });
                });
            }    
            else {
                if (page > 1) {
                    page--; // Decrease page if current page is greater than 1
                }
                listingsTableBody.innerHTML = '<tr><td colspan="4"><strong>No data available</strong></td></tr>';
            }
            document.getElementById('current-page').textContent = page;
        })
        .catch(err => {
            const listingsTableBody = document.querySelector('#listingsTable tbody');
            listingsTableBody.innerHTML = '<tr><td colspan="4"><strong>No data available</strong></td></tr>';
            document.getElementById('current-page').textContent = page;
        });
}

// Load Listing Details
function loadListingDetails(listingId) {
    fetch(`https://web-422-ass1.vercel.app/api/listings/${listingId}`)
    .then(res => {
        if (res.ok) {
            return res.json();
        } else {
            throw new Error('Error fetching listing details');
        }
    })
    .then(listing => {
        // Check for image and set fallback if not available
        const imageUrl = listing.images?.picture_url || 'https://placehold.co/600x400?text=Photo+Not+Available';

        // Populate the modal with listing details
        const modalTitle = document.getElementById('modalLabel');
        const modalBody = document.querySelector('#detailsModal .modal-body');

        // Set the modal title and content
        modalTitle.textContent = listing.name;
        modalBody.innerHTML = `
            <img id="photo" onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Photo+Not+Available'" class="img-fluid mb-3" src="${imageUrl}" alt="${listing.name}" />
            <strong>Type:</strong> ${listing.room_type}<br/>
            <strong>Location:</strong> ${listing.address.street}, ${listing.address.city}, ${listing.address.state} ${listing.address.zip}, ${listing.address.country}<br/>
            <strong>Summary:</strong> ${listing.neighborhood_overview || "No neighborhood overview available."}<br/><br/>
            <strong>Accommodates:</strong> ${listing.accommodates}<br/>
            <strong>Price:</strong> $${listing.price?.toFixed(2) || "Not Available"}<br/>
            <strong>Room:</strong> ${listing.room_type}<br/>
            <strong>Bed:</strong> ${listing.bed_type} (${listing.beds || 0})<br/><br/>
            <strong>Rating:</strong> ${listing.review_scores?.review_scores_rating || "N/A"} (${listing.number_of_reviews || 0} Reviews)
        `;

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
        modal.show();
    })
    .catch(err => {
        console.error(err);
        // Show an error message and fallback content
        const modalTitle = document.getElementById('modalLabel');
        const modalBody = document.querySelector('#detailsModal .modal-body');
        
        // Fallback content
        modalTitle.textContent = 'Error Loading Listing';
        modalBody.innerHTML = `
            <img id="photo" class="img-fluid mb-3" src="https://placehold.co/600x400?text=Photo+Not+Available" alt="Error Image" />
            <p>Sorry, We are not able to load your data. Please try again later.</p>
        `;
        const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
        modal.show();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadListingsData();

    document.getElementById('previous-page').addEventListener('click', (e) => {
        e.preventDefault(); 
        if (page > 1) {
            page--;
            loadListingsData(); 
        }
    });

    document.getElementById('next-page').addEventListener('click', (e) => {
        e.preventDefault(); 
        page++; 
        loadListingsData(); 
    });

    document.getElementById('searchForm').addEventListener('submit', (e) => {
        e.preventDefault();
        searchName = document.getElementById('name').value; 
        page = 1; 
        loadListingsData(); 
    });

    document.getElementById('clearForm').addEventListener('click', () => {
        document.getElementById('name').value = ''; 
        searchName = null;
        page = 1; 
        loadListingsData(); 
    });
});

// Initial load of listings
loadListingsData();
