
console.log("StayNest JavaScript loaded");

const cityFilter = document.getElementById("city-filter");
const budgetFilter = document.getElementById("budget-filter");
const genderFilter = document.getElementById("gender-filter");

const propertyGrid = document.getElementById("property-grid");
const noResults = document.getElementById("no-results");
const loadingMessage = document.getElementById("loading-properties");

const propertyListings = document.getElementById("property-listings");
const propertyDetails = document.getElementById("property-details");
const backButton = document.getElementById("back-to-listings");

const detailsImage = document.getElementById("details-image");
const galleryThumbnails = document.getElementById("gallery-thumbnails");
const detailsLocation = document.getElementById("details-location");
const detailsName = document.getElementById("details-name");
const detailsRating = document.getElementById("details-rating");
const detailsPrice = document.getElementById("details-price");
const detailsDescription = document.getElementById("details-description");
const detailsAmenities = document.getElementById("details-amenities");
const interestedButton = document.getElementById("interested-button");

let properties = [];
let shortlistedProperties = [];
let shortlistLoading = false;

const propertyData = {
    "Comfort Living PG": {
        images: [
            "assets/images/comfort-living.jpg",
            "assets/images/comfort-living-2.jpg",
            "assets/images/comfort-living-3.jpg"
        ],
        amenities: ["Wi-Fi", "Study area", "Furnished bedroom"]
    },
    "Student Haven PG": {
        images: [
            "assets/images/student-haven.jpg",
            "assets/images/student-haven-2.jpg",
            "assets/images/student-haven-3.jpg"
        ],
        amenities: ["Wi-Fi", "Laundry facilities", "Study area"]
    },
    "Urban Nest PG": {
        images: [
            "assets/images/urban-nest.jpg",
            "assets/images/urban-nest-2.jpg",
            "assets/images/urban-nest-3.jpg"
        ],
        amenities: ["Wi-Fi", "Study desk", "Wardrobe"]
    }
};

function formatPrice(price) {
    return Number(price).toLocaleString("en-IN", {
        maximumFractionDigits: 0
    });
}

function getPropertyImages(property) {
    return propertyData[property.name]?.images || [
        property.image
    ];
}

function createPropertyCard(property) {
    const card = document.createElement("article");
    card.className = "property-card";

    card.dataset.id = property.id;
    card.dataset.city = property.city.toLowerCase();
    card.dataset.price = property.price;
    card.dataset.gender = property.gender_type;

    const images = getPropertyImages(property);
    const info = propertyData[property.name] || {
        images: [],
        amenities: []
    };

    const image = document.createElement("img");
    image.className = "property-image";
    image.src = images[0] || property.image;
    image.alt = "Accommodation at " + property.name;

    const content = document.createElement("div");
    content.className = "property-info";

    const shortlistBadge = document.createElement("span");
    shortlistBadge.className = "shortlist-badge";
    shortlistBadge.textContent = "♥ Shortlisted";
    shortlistBadge.hidden = !shortlistedProperties.includes(Number(property.id));

    const location = document.createElement("p");
    location.className = "property-location";
    location.textContent = property.location;

    const name = document.createElement("h3");
    name.textContent = property.name;

    const description = document.createElement("p");
    description.className = "property-description";
    description.textContent = property.description || "Details coming soon.";

    const footer = document.createElement("div");
    footer.className = "property-footer";

    const price = document.createElement("p");
    price.className = "property-price";
    price.append("₹" + formatPrice(property.price) + " ");

    const month = document.createElement("span");
    month.textContent = "/ month";
    price.appendChild(month);

    const gender = document.createElement("span");
    gender.className = "gender-badge";

    const genderLabels = {
        male: "Male",
        female: "Female",
        any: "Any gender"
    };
    gender.textContent = genderLabels[property.gender_type] || "Not specified";

    const button = document.createElement("button");
    button.className = "view-details-button";
    button.type = "button";
    button.textContent = "View Details";
    button.addEventListener("click", function () {
        showPropertyDetails(property);
    });

    footer.append(price, gender);
    content.append(shortlistBadge, location, name, description, footer, button);
    card.append(image, content);

    return card;
}

function renderProperties() {
    propertyGrid.querySelectorAll(".property-card").forEach(function (card) {
        card.remove();
    });

    properties.forEach(function (property) {
        propertyGrid.appendChild(createPropertyCard(property));
    });

    filterProperties();
    updateShortlistBadges();
}


let filterRequestId = 0;

async function filterProperties() {
    const requestId = ++filterRequestId;

    const selectedCity = cityFilter.value;
    const selectedBudget = budgetFilter.value;
    const selectedGender = genderFilter.value;

    const params = new URLSearchParams();

    if (selectedCity !== "") {
        params.set("city", selectedCity);
    }

    if (selectedBudget !== "") {
        params.set("budget", selectedBudget);
    }

    if (selectedGender !== "") {
        params.set("gender", selectedGender);
    }

    noResults.hidden = true;

    if (loadingMessage) {
        loadingMessage.hidden = false;
        loadingMessage.textContent = "Loading properties...";
    }

    try {
        const url = "api/properties.php" +
            (params.toString() ? "?" + params.toString() : "");

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }

        const filteredProperties = await response.json();

        if (!Array.isArray(filteredProperties)) {
            throw new Error("Invalid property list received.");
        }

        // Ignore older requests if a newer filter selection was made.
        if (requestId !== filterRequestId) {
            return;
        }

        properties = filteredProperties;

        renderFilteredProperties();

    } catch (error) {
        if (requestId !== filterRequestId) {
            return;
        }

        console.error("Filtering failed:", error);
        alert("Unable to filter properties. Please try again.");

    } finally {
        if (requestId === filterRequestId && loadingMessage) {
            loadingMessage.hidden = true;
        }
    }
}


function renderFilteredProperties() {
    propertyGrid.querySelectorAll(".property-card").forEach(function (card) {
        card.remove();
    });

    properties.forEach(function (property) {
        propertyGrid.appendChild(createPropertyCard(property));
    });

    noResults.hidden = properties.length > 0;

    updateShortlistBadges();

    // Store the latest count so React can read it on startup.
window.stayNestPropertyCount = properties.length;

// Tell React whenever the filtered property count changes.
window.dispatchEvent(
    new CustomEvent("staynest:property-count", {
        detail: { count: properties.length }
    })
);
}



cityFilter.addEventListener("change", filterProperties);
budgetFilter.addEventListener("change", filterProperties);
genderFilter.addEventListener("change", filterProperties);


async function loadShortlist() {
    try {
        const response = await fetch("api/shortlist.php");

        // A visitor who is not logged in has no accessible shortlist.
        if (response.status === 401) {
            shortlistedProperties = [];
            updateShortlistBadges();
            return;
        }

        if (!response.ok) {
            throw new Error("Could not load shortlist.");
        }

        const propertyIds = await response.json();

        if (!Array.isArray(propertyIds)) {
            throw new Error("Invalid shortlist response.");
        }

        shortlistedProperties = propertyIds.map(Number);
        updateShortlistBadges();
        console.log("Database shortlist loaded:", shortlistedProperties);
    } catch (error) {
        console.error("Could not load shortlist:", error);
    }
}



function updateShortlistBadges() {
    document.querySelectorAll(".property-card").forEach(function (card) {
        const propertyId = Number(card.dataset.id);
        const badge = card.querySelector(".shortlist-badge");

        if (badge) {
            badge.hidden = !shortlistedProperties.includes(propertyId);
        }
    });
}


function buildGallery(property) {
    const images = getPropertyImages(property);

    galleryThumbnails.replaceChildren();

    images.forEach(function (imagePath, index) {
        const thumbnail = document.createElement("img");
        thumbnail.src = imagePath;
        thumbnail.alt = property.name + " photo " + (index + 1);
        thumbnail.className = "gallery-thumbnail";

        if (index === 0) thumbnail.classList.add("active");

        thumbnail.addEventListener("click", function () {
            detailsImage.src = imagePath;

            galleryThumbnails
                .querySelectorAll(".gallery-thumbnail")
                .forEach(function (item) {
                    item.classList.remove("active");
                });

            thumbnail.classList.add("active");
        });

        galleryThumbnails.appendChild(thumbnail);
    });

    detailsImage.src = images[0] || property.image;
    detailsImage.alt = property.name;
}

function showPropertyDetails(property) {
    buildGallery(property);

    detailsLocation.textContent = property.location;
    detailsName.textContent = property.name;
    detailsPrice.textContent = "₹" + formatPrice(property.price) + " / month";
    detailsDescription.textContent = property.description || "Details coming soon.";

    detailsRating.textContent = property.rating
        ? "★ " + Number(property.rating).toFixed(1) + " / 5 (sample rating)"
        : "No rating yet";

    detailsAmenities.replaceChildren();

    const amenities = property.amenities || [];

    amenities.forEach(function (amenity) {
        const item = document.createElement("li");
        item.textContent = amenity;
        detailsAmenities.appendChild(item);
    });

    interestedButton.textContent =
    shortlistedProperties.includes(Number(property.id))
        ? "Remove from Shortlist"
        : "I'm Interested";

    propertyListings.hidden = true;
    propertyDetails.hidden = false;

    window.scrollTo({ top: 0, behavior: "smooth" });
}

backButton.addEventListener("click", function () {
    propertyDetails.hidden = true;
    propertyListings.hidden = false;
    updateShortlistBadges();
});


interestedButton.addEventListener("click", async function () {
    const property = properties.find(function (item) {
        return item.name === detailsName.textContent;
    });

    if (!property) {
        alert("Could not identify this property.");
        return;
    }

    if (shortlistLoading) return;

    const propertyId = Number(property.id);
    const isShortlisted = shortlistedProperties.includes(propertyId);
    const action = isShortlisted ? "remove" : "add";

    shortlistLoading = true;
    interestedButton.disabled = true;
    interestedButton.textContent = "Saving...";

    try {
        const response = await fetch("api/shortlist.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                property_id: propertyId,
                action: action
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Could not update shortlist.");
        }

        if (action === "add") {
            shortlistedProperties.push(propertyId);
        } else {
            shortlistedProperties = shortlistedProperties.filter(
                function (id) {
                    return id !== propertyId;
                }
            );
        }

        interestedButton.textContent =
            action === "add" ? "Remove from Shortlist" : "I'm Interested";

        updateShortlistBadges();
    } catch (error) {
        console.error("Shortlist update failed:", error);
        alert(error.message);
        interestedButton.textContent = isShortlisted
            ? "Remove from Shortlist"
            : "I'm Interested";
    } finally {
        shortlistLoading = false;
        interestedButton.disabled = false;
    }
});


async function loadProperties() {
    try {
        const response = await fetch("api/properties.php");

        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }

        properties = await response.json();

        if (!Array.isArray(properties)) {
            throw new Error("The API did not return a property list.");
        }

        if (loadingMessage) loadingMessage.hidden = true;

        renderFilteredProperties();
    } catch (error) {
        console.error("Could not load properties:", error);

        if (loadingMessage) {
            loadingMessage.textContent =
                "Unable to load properties. Please refresh the page.";
        }
    }
}

async function initializeStayNest() {
    await loadShortlist();
    await loadProperties();
    updateShortlistBadges();
}

initializeStayNest();




async function updateAuthControls() {
    const authControls = document.getElementById("auth-controls");

    if (!authControls) return;

    try {
        const response = await fetch("api/session.php", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Unable to check login status.");
        }

        const session = await response.json();

        if (session.logged_in) {
            authControls.replaceChildren();

            const greeting = document.createElement("span");
            greeting.textContent = `Hi, ${session.user_name || "Student"}`;
            greeting.className = "auth-greeting";

            const logoutLink = document.createElement("a");
            logoutLink.href = "auth/logout.php";
            logoutLink.className = "auth-link";
            logoutLink.textContent = "Log Out";

            authControls.append(greeting, logoutLink);
        }
    } catch (error) {
        console.error("Unable to update authentication controls:", error);
    }
}

updateAuthControls();
