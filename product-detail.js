// PRODUCT DETAIL CONNECTION FROM PRODUCT INFORMATION
let currentSelectedSize = null;
const params = new URLSearchParams(window.location.search);
const targetId = params.get('id');
const targetName = params.get('name');

window.onload = function () {
    if (!document.getElementById('pd-name')) return;
    
    // Fetch directly from the live database to guarantee the page loads!
    fetch('Database/fetch-products.php')
    .then(res => res.json())
    .then(data => {
        if (data.success && data.products.length > 0) {
            // Keep local storage updated
            localStorage.setItem('pace_products', JSON.stringify(data.products));
            
            let product;
            if (targetId) product = data.products.find(p => String(p.id) === String(targetId));
            else if (targetName) product = data.products.find(p => p.name === targetName);

            if (product) loadProductDetails(product);
            else document.getElementById('pd-name').innerText = "Product Not Found";
        }
    })
    .catch(err => console.error("Error loading product:", err));
};

// TO GET PRODUCT DETAILS FROM THE SPECIFIC PRODUCT
function loadProductDetails(p) {
    if (!document.getElementById('pd-name')) return;

    document.getElementById('pd-name').innerText = p.name;
    document.getElementById('desc-name').innerText = p.name;
    document.getElementById('pd-price').innerText = '₱ ' + p.price;

    const breadCat = document.getElementById('bread-cat');
    breadCat.innerText = p.type.charAt(0).toUpperCase() + p.type.slice(1).toLowerCase();
    breadCat.href = p.type.toLowerCase() + '.html';
    document.getElementById('bread-name').innerText = p.name;
    document.getElementById('main-display-image').src = p.img;

    const colorContainer = document.querySelector('.color-option');
    if (colorContainer) {
        let currentProducts = JSON.parse(localStorage.getItem('pace_products')) || products;
        const relatedVariants = currentProducts.filter(item => item.name === p.name);
        colorContainer.innerHTML = relatedVariants.map(variant => `
            <button type="button" class="color-box ${variant.id === p.id ? 'selected' : ''}" 
                    onclick="switchColor('${variant.id}')" title="${variant.color}">
                <img src="${variant.img}" alt="${variant.color}">
            </button>
        `).join('');
    }

    document.getElementById('thumb-1').src = p.img;
    document.getElementById('thumb-2').src = p.hover;
    document.querySelectorAll('.thumb').forEach(el => el.classList.remove('active-thumb'));
    if (document.getElementById('thumb-1')?.parentElement) {
        document.getElementById('thumb-1').parentElement.classList.add('active-thumb');
    }

    const detailsContainer = document.getElementById('pd-details-content');
    if (detailsContainer) {
        let detailsContent = '';

        if (p.type === 'MEN') {
            detailsContent = `
                    <ul style="list-style: none; padding: 0; line-height: 2.2;">
                        <li><strong>Weight:</strong> Approx. 285g (varies by size)</li>
                        <li><strong>Upper:</strong> Breathable engineered mesh with supportive overlays</li>
                        <li><strong>Midsole:</strong> High-rebound foam for all-day comfort and energy return</li>
                        <li><strong>Outsole:</strong> Durable rubber designed for multi-surface traction</li>
                        <li><strong>Fit:</strong> Standard men's width, fits true to size</li>
                        <li><strong>Best For:</strong> Road running, daily training, and casual wear</li>
                    </ul>
                `;
        } else if (p.type === 'WOMEN') {
            detailsContent = `
                    <ul style="list-style: none; padding: 0; line-height: 2.2;">
                        <li><strong>Weight:</strong> Approx. 240g (varies by size)</li>
                        <li><strong>Upper:</strong> Adaptive, lightweight knit for a secure, breathable feel</li>
                        <li><strong>Midsole:</strong> Plush, soft-cushioning foam for responsive support</li>
                        <li><strong>Outsole:</strong> Flexible rubber designed for natural foot movement</li>
                        <li><strong>Fit:</strong> Contoured specifically for the female foot profile</li>
                        <li><strong>Best For:</strong> Gym workouts, walking, and everyday lifestyle</li>
                    </ul>
                `;
        } else if (p.type === 'KIDS') {
            detailsContent = `
                    <ul style="list-style: none; padding: 0; line-height: 2.2;">
                        <li><strong>Weight:</strong> Ultra-lightweight design to prevent foot fatigue</li>
                        <li><strong>Upper:</strong> Durable synthetic materials and breathable mesh</li>
                        <li><strong>Midsole:</strong> Supportive EVA foam to cushion growing feet</li>
                        <li><strong>Outsole:</strong> Non-marking grippy rubber for indoor and outdoor play</li>
                        <li><strong>Fit:</strong> Snug fit with alternative closures for easy on and off</li>
                        <li><strong>Best For:</strong> School, sports, and weekend adventures</li>
                    </ul>
                `;
        }
        detailsContainer.innerHTML = detailsContent;
    }

    // CATEGORY SPECIFIC SIZES
    const sizeContainer = document.getElementById('size-grid');
    let sizes = [];
    if (p.type === 'MEN') sizes = ['8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5'];
    else if (p.type === 'WOMEN') sizes = ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5'];
    else if (p.type === 'KIDS') sizes = ['1Y', '1.5Y', '2Y', '2.5Y', '3Y', '3.5Y', '4Y', '4.5Y', '5Y', '5.5Y', '6Y', '6.5Y'];

    if (sizeContainer) {
        sizeContainer.innerHTML = sizes.map(size => {
            let label = (p.type === 'MEN') ? 'M ' + size : (p.type === 'WOMEN') ? 'W ' + size : size;
            
            // Check specific size quantity
            let qty = 0;
            if (typeof p.stock === 'object' && p.stock !== null) {
                qty = p.stock[label] || 0; 
            } else {
                qty = window.getTotalStock(p.stock); // Fallback for old data
            }

            // Disable button if qty is 0 by greying it out and crossing the text
            if (qty === 0) {
                return `<button class="size-btn" disabled style="opacity: 0.5; cursor: not-allowed; text-decoration: line-through; background: #f9f9f9;">${label}</button>`;
            } else {
                return `<button class="size-btn" onclick="selectSize(this, '${label}')">${label}</button>`;
            }
        }).join('');
    }

    // CHECK BADGE STATUS (OUT OF STOCK OR NEW ARRIVAL)
    const badgeEl = document.getElementById('pd-new-badge');
    if (badgeEl) {
        if (window.getTotalStock(p.stock) === 0) {
            badgeEl.innerText = "OUT OF STOCK";
            badgeEl.style.backgroundColor = "#d9534f";
            badgeEl.style.display = "block";
        } else if (p.isNew) {
            badgeEl.innerText = "NEW";
            badgeEl.style.backgroundColor = "var(--brand-color)";
            badgeEl.style.display = "block";
        } else {
            badgeEl.style.display = "none";
        }
    }

    // PRODUCT DETAIL ADD TO CART CONNECTION
    const addToCartBtn = document.querySelector('.pd-cart');
    const buyNowBtn = document.querySelector('.pd-buy');

    if (window.getTotalStock(p.stock) === 0) {
        if (addToCartBtn) {
            addToCartBtn.innerHTML = "OUT OF STOCK";
            addToCartBtn.style.backgroundColor = "#ccc";
            addToCartBtn.style.borderColor = "#ccc";
            addToCartBtn.style.color = "#666";
            addToCartBtn.style.cursor = "not-allowed";
            addToCartBtn.onclick = function (event) { event.preventDefault(); };
        }
        if (buyNowBtn) {
            buyNowBtn.style.display = "none";
        }
    } else {

        if (addToCartBtn) {

            addToCartBtn.innerHTML = "ADD TO CART";
            addToCartBtn.style.backgroundColor = "";
            addToCartBtn.style.borderColor = "";
            addToCartBtn.style.color = "";
            addToCartBtn.style.cursor = "pointer";

            addToCartBtn.onclick = function (event) {
                event.preventDefault();
                addToCart(p);
            };
        }

        if (buyNowBtn) {

            buyNowBtn.style.display = "";

            buyNowBtn.onclick = function (event) {
                event.preventDefault();
                buyNow(p);
            };
        }
    }

    // PRODUCT DETAIL WISHLIST CONNECTION
    const wishBtn = document.querySelector('.pd-wish');
    if (wishBtn) {
        let currentWishlist = getWishlistData();
        let isSaved = currentWishlist.some(item => item.id === p.id);
        let heartIcon = wishBtn.querySelector('i');

        heartIcon.className = isSaved ? 'fi fi-ss-heart' : 'fi fi-rs-heart';

        wishBtn.onclick = function (event) {
            event.preventDefault();

            addToWishlist(p.id);

            let updatedWishlist = getWishlistData();
            let nowSaved = updatedWishlist.some(item => item.id === p.id);

            heartIcon.className = nowSaved ? 'fi fi-ss-heart' : 'fi fi-rs-heart';
        };
    }
    renderProductReviewSummary(p.name);
}

// SWITCH COLOR IN PRODUCT DETAIL PAGE
function switchColor(variantId) {
    let currentProducts = JSON.parse(localStorage.getItem('pace_products')) || products;
    const newVariant = currentProducts.find(p => String(p.id) === String(variantId));
    if (!newVariant) return;
    window.history.pushState(null, '', '?id=' + variantId);
    loadProductDetails(newVariant);
    currentSelectedSize = null;
    document.getElementById('size-error-message')?.classList.add('error-hidden');
    document.getElementById('size-grid')?.classList.remove('size-grid-error');
}

// CHANGE IMAGE IN PRODUCT DETAIL PAGE
function changeImage(element) {
    document.querySelectorAll('.thumb').forEach(el => el.classList.remove('active-thumb'));
    element.classList.add('active-thumb');
    document.getElementById('main-display-image').src = element.querySelector('img').src;
}

// CHANGE SIZE IN PRODUCT DETAIL PAGE
function selectSize(btn, sizeValue) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active-size'));
    btn.classList.add('active-size');
    currentSelectedSize = sizeValue;
    document.getElementById('size-error-message')?.classList.add('error-hidden');
    const sizeGrid = document.getElementById('size-grid');
    if (sizeGrid) sizeGrid.classList.remove('size-grid-error');
}

// PRODUCT DETAIL ACCORDION FUNCTIONS
document.querySelectorAll('.accordion-header').forEach(acc => {
    acc.addEventListener('click', function () {
        this.classList.toggle('active');
        const content = this.nextElementSibling;
        content.style.maxHeight = content.style.maxHeight ? null : content.scrollHeight + "px";
    });
});

// SIZE GUIDE PANEL FUNCTIONS
function openSG() {
    const overlay = document.getElementById('sg-overlay');
    const panel = document.getElementById('sg-panel');
    const nav = document.querySelector('.navbar-section');
    if (!overlay || !panel) return;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    if (nav) nav.style.right = `${scrollbarWidth}px`;
    document.body.style.overflow = 'hidden';
    overlay.style.display = 'block';
    setTimeout(() => panel.classList.add('open'), 10);
}

function closeSG() {
    const overlay = document.getElementById('sg-overlay');
    const panel = document.getElementById('sg-panel');
    const nav = document.querySelector('.navbar-section');
    if (!overlay || !panel) return;
    document.body.style.overflow = '';
    document.body.style.paddingRight = '0px';
    if (nav) nav.style.right = '0px';
    panel.classList.remove('open');
    setTimeout(() => overlay.style.display = 'none', 300);
}

// PRODUCT DETAIL BUY NOW FUNCTION
function buyNow(product) {
    const errorMsg = document.getElementById('size-error-message');
    const sizeGrid = document.getElementById('size-grid');

    if (typeof currentSelectedSize !== 'undefined' && !currentSelectedSize) {
        if (errorMsg) errorMsg.classList.remove('error-hidden');
        if (sizeGrid) sizeGrid.classList.add('size-grid-error');
        return;
    }

    try {
        const selectedSize = typeof currentSelectedSize !== 'undefined' && currentSelectedSize ? currentSelectedSize : 'Default';
        const uniqueCartId = product.id + "-" + selectedSize + "-" + product.color;

        const buyNowItem = {
            productId: product.id,
            cartItemId: uniqueCartId,
            name: product.name,
            type: product.type,
            price: product.price,
            size: selectedSize,
            color: product.color,
            image: product.img,
            quantity: 1,
            selected: true
        };

        sessionStorage.setItem('pace_buy_now_item', JSON.stringify(buyNowItem));
        window.location.href = 'checkout.html';

    } catch (error) {
        console.error("Buy Now Error:", error);
    }
}

// PRODUCT REVIEWS LOGIC (NEW: FETCHES FROM MYSQL LIVE DATABASE)
let activeProductReviews = [];

function renderProductReviewSummary(productName) {
    const acTexts = document.querySelectorAll('.accordion-content .ac-text');
    if (acTexts.length < 3) return;
    const reviewBox = acTexts[2];

    fetch('Database/fetch-feedbacks.php')
    .then(res => res.json())
    .then(data => {
        let globalFeedbacks = data.success ? data.reviews : [];
        activeProductReviews = globalFeedbacks.filter(fb => fb.productName === productName);
        let totalReviews = activeProductReviews.length;

        if (totalReviews === 0) {
            reviewBox.innerHTML = `
                <div class="review-summary">
                    <div class="review-overall">
                        <div class="review-score">0.0</div>
                        <div class="review-stars" style="color: #ccc;">★★★★★</div>
                        <div class="review-count">There are no reviews yet</div>
                    </div>
                    <div class="review-bars">
                        ${[5, 4, 3, 2, 1].map(i => `<div class="review-bar-row"><span class="bar-label">${i} ★</span><div class="bar-track"><div class="bar-fill" style="width: 0%;"></div></div><span class="bar-count">0</span></div>`).join('')}
                    </div>
                </div>
            `;
            return;
        }

        let sum = 0;
        let starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

        activeProductReviews.forEach(fb => {
            sum += fb.rating;
            starCounts[fb.rating] = (starCounts[fb.rating] || 0) + 1;
        });

        let average = (sum / totalReviews).toFixed(1);
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) starsHTML += i <= Math.round(average) ? '★' : '☆';

        let barsHTML = '';
        for (let i = 5; i >= 1; i--) {
            let percentage = (starCounts[i] / totalReviews) * 100;
            barsHTML += `<div class="review-bar-row"><span class="bar-label">${i} ★</span><div class="bar-track"><div class="bar-fill" style="width: ${percentage}%;"></div></div><span class="bar-count">${starCounts[i]}</span></div>`;
        }

        let previewReviews = activeProductReviews.slice(0, 2);
        let commentsHTML = previewReviews.map(fb => generateReviewCard(fb)).join('');

        reviewBox.innerHTML = `
            <div class="review-summary">
                <div class="review-overall">
                    <div class="review-score">${average}</div>
                    <div class="review-stars" style="color: var(--brand-color);">${starsHTML}</div>
                    <div class="review-count">Based on ${totalReviews} review${totalReviews > 1 ? 's' : ''}</div>
                </div>
                <div class="review-bars">${barsHTML}</div>
            </div>
            <div class="customer-reviews-list">${commentsHTML}</div>
            <button class="see-all-reviews-btn" onclick="openAllReviewsModal()">See All ${totalReviews} Reviews</button>
        `;
    })
    .catch(err => console.error("Error loading reviews:", err));
}

function generateReviewCard(fb) {
    let fbStars = '';
    for (let i = 1; i <= 5; i++) fbStars += i <= fb.rating ? '★' : '☆';

    let mediaHTML = '';
    if ((fb.photos && fb.photos.length) || fb.video) {
        mediaHTML += `<div class="review-card-media">`;
        if (fb.video) {
            mediaHTML += `<video src="${fb.video}" class="review-media-item" onclick="openMediaPreview('${fb.video}', 'video')" muted></video>`;
        }
        if (fb.photos) {
            fb.photos.forEach(photo => {
                mediaHTML += `<img src="${photo}" class="review-media-item" onclick="openMediaPreview('${photo}', 'image')">`;
            });
        }
        mediaHTML += `</div>`;
    }

    return `
        <div class="review-card">
            <div class="review-card-header">
                <div>
                    <span class="review-card-name">${fb.userName}</span>
                    <div class="review-card-stars">${fbStars}</div>
                </div>
                <span class="review-card-date">${fb.date}</span>
            </div>
            <p class="review-card-text">"${fb.comment}"</p>
            ${mediaHTML}
        </div>
    `;
}

// ALL REVIEWS MODAL LOGIC
let currentReviewFilter = 'All';

window.openAllReviewsModal = function () {
    renderModalReviews();
    const modal = document.getElementById('all-reviews-modal');
    const nav = document.querySelector('.navbar-section');

    if (modal) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        if (nav) nav.style.right = `${scrollbarWidth}px`;
        modal.showModal();
    }
};

window.closeAllReviewsModal = function () {
    const modal = document.getElementById('all-reviews-modal');
    const nav = document.querySelector('.navbar-section');

    if (modal) {
        modal.close();
        document.body.style.overflow = '';
        document.body.style.paddingRight = '0px';
        if (nav) nav.style.right = '0px';
    }
};

function renderModalReviews() {
    const listContainer = document.getElementById('all-reviews-list-container');
    const tabsContainer = document.getElementById('review-filter-tabs');

    let starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    activeProductReviews.forEach(fb => starCounts[fb.rating]++);

    tabsContainer.innerHTML = `
        <button onclick="filterReviews('All')" class="review-filter-tab ${currentReviewFilter === 'All' ? 'active' : ''}">All</button>
        ${[5, 4, 3, 2, 1].map(i => `
            <button onclick="filterReviews(${i})" class="review-filter-tab ${currentReviewFilter === i ? 'active' : ''}">${i} Star (${starCounts[i]})</button>
        `).join('')}
    `;

    let displayedReviews = currentReviewFilter === 'All'
        ? activeProductReviews
        : activeProductReviews.filter(fb => fb.rating === currentReviewFilter);

    if (displayedReviews.length === 0) {
        listContainer.innerHTML = `
            <div class="review-empty-state">
                <i class="fi fi-rr-comment-alt review-empty-icon"></i>
                <p style="margin: 0;">No reviews found for this rating.</p>
            </div>
        `;
    } else {
        listContainer.innerHTML = displayedReviews.map(fb => generateReviewCard(fb)).join('');
    }
}

window.filterReviews = function (filterValue) {
    currentReviewFilter = filterValue;
    renderModalReviews();
};

// MEDIA FULLSCREEN PREVIEW LOGIC
window.openMediaPreview = function (src, type) {
    const modal = document.getElementById('media-fullscreen-modal');
    const container = document.getElementById('fullscreen-media-container');
    const nav = document.querySelector('.navbar-section');

    if (!modal || !container) return;

    if (type === 'image') {
        container.innerHTML = `<img src="${src}" class="fullscreen-content" onclick="event.stopPropagation()">`;
    } else {
        container.innerHTML = `<video src="${src}" class="fullscreen-content" controls autoplay onclick="event.stopPropagation()"></video>`;
    }

    if (document.body.style.overflow !== 'hidden') {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        if (nav) nav.style.right = `${scrollbarWidth}px`;
    }

    modal.showModal();

    modal.onclick = function () {
        closeMediaPreview();
    };

    modal.oncancel = function (e) {
        e.preventDefault();
        closeMediaPreview();
    };
};

window.closeMediaPreview = function () {
    const modal = document.getElementById('media-fullscreen-modal');
    const container = document.getElementById('fullscreen-media-container');
    const nav = document.querySelector('.navbar-section');

    if (modal && container) {
        container.innerHTML = '';
        modal.close();

        if (document.querySelectorAll('dialog[open]').length === 0) {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '0px';
            if (nav) nav.style.right = '0px';
        }
    }
};