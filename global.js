// GLOBAL FAVICON AND TITLE
document.title = "PACE";

let favicon = document.querySelector("link[rel~='icon']");
if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    document.head.appendChild(favicon);
}
favicon.href = "Brand Image/pace favicon.png";

// STOCK HELPER
window.getTotalStock = function (stockVal) {
    if (typeof stockVal === 'number' || typeof stockVal === 'string') return parseInt(stockVal) || 0;
    if (typeof stockVal === 'object' && stockVal !== null) {
        return Object.values(stockVal).reduce((total, qty) => total + (parseInt(qty) || 0), 0);
    }
    return 0;
};

// CART
window.syncCartToDatabase = function (email, cartArray) {
    fetch('Database/update-account.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_cart', email: email, cart: cartArray })
    }).catch(err => console.error("Error syncing cart:", err));
};

// WISHLIST
window.syncWishlistToDatabase = function (email, wishlistArray) {
    fetch('Database/update-account.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_wishlist', email: email, wishlist: wishlistArray })
    }).catch(err => console.error("Error syncing wishlist:", err));
};

// NOTIFICATION
window.syncNotificationsToDatabase = function (email, notifArray) {
    fetch('Database/update-account.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_notifications', email: email, notifications: notifArray })
    }).catch(err => console.error("Error syncing notifications:", err));
};

// CHAT HISTORY
window.syncChatToDatabase = function (email, chatArray) {
    fetch('Database/update-account.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_chat', email: email, chat: chatArray })
    }).catch(err => console.error("Error syncing chat:", err));
};

// ADDRESS
window.syncAddressesToDatabase = function (email, addressesArray) {
    fetch('Database/update-account.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_addresses', email: email, addresses: addressesArray })
    }).catch(err => console.error("Error syncing addresses:", err));
};

// PAYMENT METHOD
window.syncPaymentsToDatabase = function (email, paymentsArray) {
    fetch('Database/update-account.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_payments', email: email, payments: paymentsArray })
    }).catch(err => console.error("Error syncing payments:", err));
};


// NAVBAR SCROLL HIDING
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar-section');
    if (!nav) return;

    const currentScroll = window.scrollY;
    if (currentScroll > lastScroll) nav.style.transform = "translateY(-100%)";
    else nav.style.transform = "translateY(0)";
    lastScroll = currentScroll;
});

document.addEventListener('mousemove', (e) => {
    const nav = document.querySelector('.navbar-section');
    if (e.clientY < 60 && nav) nav.style.transform = "translateY(0)";
});

// SECTION ANIMATION
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.05 });
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// GLOBAL NAVBAR COMPONENT
function renderNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) return;

    navbarContainer.innerHTML = `
        <div class="navbar-section">
            <div class="nav-wrapper">
                <div class="nav-menu">
                    <a href="homepage.html">HOME</a>
                    <a href="men.html">MEN</a>
                    <a href="women.html">WOMEN</a>
                    <a href="kids.html">KIDS</a>
                    <a href="new.html">NEW ARRIVAL</a>
                </div>
                <div class="nav-logo">
                    <a href="homepage.html"><img src="Brand Image/pace logo orange.png" alt="PACE Logo" class="logo-img"></a>
                </div>
                <div class="nav-icon">
                    <button id="global-search-btn" onclick="toggleSearchPanel()"><i class="fi fi-rr-search"></i></button>
                    <a href="wishlist.html" onclick="openWishlistPanel(event)"><i class="fi fi-rs-heart"></i></a>
                    <a href="cart.html" onclick="openCartPanel(event)"><i class="fi fi-rr-shopping-cart"></i></a>
                    <div id="user-popup-container" class="user-popup-container"></div>
                </div>
            </div>
        </div>
    `;
}

// GLOBAL FOOTER COMPONENT
function renderFooter() {
    const footerContainer = document.getElementById('footer-container');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
        <footer class="footer-section">
            <div class="footer-container">
                <div class="footer-column">
                    <h4>SHOP</h4>
                    <a href="men.html">Men's Collection</a>
                    <a href="women.html">Women's Collection</a>
                    <a href="kids.html">Kids' Collection</a>
                    <a href="new.html">New Arrivals</a>
                </div>
                <div class="footer-column">
                    <h4>SUPPORT</h4>
                    <a href="size-guide.html">Size Guide</a>
                    <a href="shipping-guide.html">Shipping & Pick-Up </a>
                    <a href="faqs.html">FAQs</a>
                    <a href="contact-us.html">Contact Us</a>
                </div>
                <div class="footer-column">
                    <h4>ABOUT</h4>
                    <a href="about-pace.html">Our Story</a>
                    <a href="team.html">Meet the Team</a>
                    <a href="why-us.html">Why Choose Us</a>
                    <a href="store-loc.html">Store Location</a>
                </div>
                <div class="footer-column">
                    <h4>CONNECT WITH US</h4>
                    <div class="social">
                        <a href="https://www.facebook.com/profile.php?id=61572149755730"><i class="fi fi-brands-facebook"></i></a>
                        <a href="https://www.instagram.com/pace_philippines/"><i class="fi fi-brands-instagram"></i></a>
                        <a href="https://www.youtube.com/channel/UCLiThmvB-qilFjVNqigzUzQ"><i class="fi fi-brands-youtube"></i></a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 PACE, Inc. All Rights Reserved.</p>
                <div class="legal-links">
                    <a href="privacy-policy.html">Privacy Policy</a>
                    <a href="terms-conditions.html">Terms & Conditions</a>
                </div>
            </div>
        </footer>
    `;
}

// USER POPUP MENU START
function renderUserMenu() {
    const container = document.getElementById('user-popup-container');
    if (!container) return;

    try {
        if (window.currentUser) {
            let rawFName = window.currentUser.first_name || window.currentUser.firstName || window.currentUser.name || 'User';
            let rawLName = window.currentUser.last_name || window.currentUser.lastName || '';

            let fName = String(rawFName).trim();
            let lName = String(rawLName).trim();

            const firstInitial = fName.length > 0 ? fName.charAt(0) : 'U';
            const lastInitial = lName.length > 0 ? lName.charAt(0) : '';
            const initials = (firstInitial + lastInitial).toUpperCase();

            let savedPhoto = window.currentUser.profilePic || window.currentUser.profile_pic;

            let profileImageHTML = savedPhoto
                ? `<img src="${savedPhoto}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; flex-shrink: 0;">`
                : `<div class="profile-initials">${initials}</div>`;

            container.innerHTML = `
                <button class="user-popup-btn" onclick="toggleUserPopup()"><i class="fi fi-rs-user"></i></button>
                <div class="user-action-card" id="user-popup-menu">
                    <div class="card-profile-header" style="display: flex; gap: 15px; align-items: center;">
                        ${profileImageHTML}
                        <div class="profile-text">
                            <h4 style="margin-bottom: 2px;">Hi, ${fName}!</h4>
                            <p>${window.currentUser.email || ''}</p>
                        </div>
                    </div>
                    <div class="account-links">
                        <a href="account.html"><i class="fi fi-rr-settings"></i> Account Settings</a>
                        <a href="address.html"><i class="fi fi-rr-map-marker"></i> Address Book</a>
                        <a href="payment-method.html"><i class="fi fi-rr-credit-card"></i> Payment Methods</a>
                        <a href="order-history.html"><i class="fi fi-rr-box"></i> Order History</a>
                        <a href="notification.html"><i class="fi fi-rr-bell"></i> Notifications</a>
                        <a href="chat-support.html"><i class="fi fi-rr-headset"></i> Chat Support</a>
                    </div>
                    <div class="card-logout">
                        <button onclick="logoutUser()" class="logout-btn"><i class="fi fi-rs-sign-out-alt"></i> Logout</button>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <button class="user-popup-btn" onclick="toggleUserPopup()"><i class="fi fi-rs-user"></i></button>
                <div class="user-action-card" id="user-popup-menu">
                    <div class="card-greeting"><h4>Welcome to <span>PACE</span></h4></div>
                    <div class="card-buttons">
                        <a href="login.html" class="card-login-btn">LOGIN</a>
                        <a href="signup.html" class="card-signup-btn">CREATE ACCOUNT</a>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error("User Menu Render Error:", error);
    }
}

function logoutUser() {
    fetch('Database/logout.php')
        .then(response => response.json())
        .then(data => {
            window.currentUser = null;
            window.scrollTo(0, 0);
            window.location.href = 'homepage.html';
        })
        .catch(error => {
            console.error("Logout Error:", error);
            window.currentUser = null;
            window.location.href = 'homepage.html';
        });
}

function toggleUserPopup() {
    const menu = document.getElementById("user-popup-menu");
    if (menu) menu.classList.toggle("show");
}

window.addEventListener('click', function (event) {
    if (!event.target.matches('.user-popup-btn') && !event.target.closest('.user-popup-btn')) {
        const popups = document.getElementsByClassName("user-action-card");
        for (let i = 0; i < popups.length; i++) {
            if (popups[i].classList.contains('show')) popups[i].classList.remove('show');
        }
    }
});
// USER POPUP MENU END

function getCartData() {
    if (window.currentUser) {
        return window.currentUser.cart || [];
    } else {
        return window.guestCart || [];
    }
}

function saveCartData(cart) {
    if (window.currentUser) {
        window.currentUser.cart = cart;
        if (window.syncCartToDatabase) window.syncCartToDatabase(window.currentUser.email, cart);
    } else {
        window.guestCart = cart;
        fetch('Database/update-guest-session.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update_cart', cart: cart })
        });
    }
    if (typeof renderCartPreview === 'function') renderCartPreview();
    if (typeof renderCartPage === 'function') renderCartPage();
}

function getWishlistData() {
    if (window.currentUser) {
        return window.currentUser.wishlist || [];
    } else {
        return window.guestWishlist || [];
    }
}

function saveWishlistData(wishlist) {
    if (window.currentUser) {
        window.currentUser.wishlist = wishlist;
        if (window.syncWishlistToDatabase) window.syncWishlistToDatabase(window.currentUser.email, wishlist);
    } else {
        window.guestWishlist = wishlist;
        fetch('Database/update-guest-session.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update_wishlist', wishlist: wishlist })
        });
    }
    if (typeof renderWishlistPreview === 'function') renderWishlistPreview();
    if (typeof renderWishlistPage === 'function') renderWishlistPage();
}
/* FETCH AND SAVE WISHLIST DATA (USER VS GUEST) FUNCTION END */

// MINI CART PANEL FUNCTIONS START
function buildCartPanel() {
    if (document.getElementById('cart-preview-panel')) return;
    const cartWrapper = document.createElement('div');
    cartWrapper.innerHTML = `
        <div id="cart-preview-overlay" onclick="closeCartPanel()"></div>
        <div id="cart-preview-panel">
            <div class="cart-preview-header">
                <h3>Shopping Cart <span id="cart-preview-count">(0)</span></h3>
                <button onclick="closeCartPanel()" class="close-cart-btn">&times;</button>
            </div>
            <div class="cart-preview-body" id="cart-preview-body"></div>
            <div class="cart-preview-footer">
                <div class="cart-preview-subtotal"><span>Subtotal:</span><span id="cart-preview-total">₱ 0.00</span></div>
                <button class="cart-preview-checkout-btn" onclick="window.location.href='cart.html'">VIEW FULL CART</button>
            </div>
        </div>
    `;
    document.body.appendChild(cartWrapper);
}

function openCartPanel(event) {
    if (window.location.pathname.includes('cart.html')) return;
    if (event) event.preventDefault();
    const overlay = document.getElementById('cart-preview-overlay');
    const panel = document.getElementById('cart-preview-panel');
    const nav = document.querySelector('.navbar-section');
    if (!overlay || !panel) return;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    if (nav) nav.style.right = `${scrollbarWidth}px`;
    document.body.style.overflow = 'hidden';

    overlay.style.display = 'block';
    setTimeout(() => { overlay.style.opacity = '1'; panel.classList.add('open'); }, 10);
    renderCartPreview();
}

function closeCartPanel() {
    const overlay = document.getElementById('cart-preview-overlay');
    const panel = document.getElementById('cart-preview-panel');
    const nav = document.querySelector('.navbar-section');
    if (!overlay || !panel) return;

    document.body.style.overflow = '';
    document.body.style.paddingRight = '0px';
    if (nav) nav.style.right = '0px';

    panel.classList.remove('open');
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.display = 'none'; }, 300);
}

function renderCartPreview() {
    const body = document.getElementById('cart-preview-body');
    const totalEl = document.getElementById('cart-preview-total');
    const countEl = document.getElementById('cart-preview-count');
    if (!body) return;

    let cart = getCartData();
    let globalProducts = JSON.parse(localStorage.getItem('pace_products')) || [];
    let removedItems = [];

    let validCart = cart.filter(item => {
        let liveProduct = globalProducts.find(p => String(p.id) === String(item.productId));

        // Check stock for the SPECIFIC size the user added to the cart
        let specificSizeStock = 0;
        if (liveProduct && typeof liveProduct.stock === 'object') {
            specificSizeStock = liveProduct.stock[item.size] || 0;
        } else if (liveProduct) {
            specificSizeStock = window.getTotalStock(liveProduct.stock);
        }

        if (!liveProduct || specificSizeStock === 0) {
            removedItems.push(item.name + " (" + item.size + ")");
            return false;
        }
        return true;
    });

    if (removedItems.length > 0) {
        if (window.currentUser) {
            window.currentUser.cart = validCart;
            if (window.syncCartToDatabase) window.syncCartToDatabase(window.currentUser.email, validCart);
        } else {
            window.guestCart = validCart;
            fetch('Database/update-guest-session.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_cart', cart: validCart })
            });
        }
        cart = validCart;
        if (typeof renderCartPage === 'function') renderCartPage();
    }

    let totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    if (countEl) countEl.innerText = `(${totalItems})`;

    if (cart.length === 0) {
        body.innerHTML = `
            <div class="mini-cart-empty">
                <i class="fi fi-rr-shopping-cart" style="font-size: 50px; color: #ddd; margin-bottom: 10px; display: block;"></i>
                <p>Your cart is currently empty.</p>
            </div>`;
        if (totalEl) totalEl.innerText = '\u20B1 0.00';
        return;
    }

    let subtotal = 0;
    body.innerHTML = cart.map((item, index) => {
        let qty = item.quantity || 1;
        let cleanPrice = parseFloat(item.price.replace(/,/g, ''));
        subtotal += cleanPrice * qty;

        return `
            <div class="mini-cart-item" onclick="window.location.href='product-detail.html?id=${item.productId}'">
                <img src="${item.image}" alt="${item.name}" class="mini-cart-img">
                <div class="mini-cart-details">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <h4>${item.name}</h4>
                        <button class="mini-cart-delete-btn" onclick="event.stopPropagation(); removeFromPreviewCart(${index})" title="Remove Item">
                            <i class="fi fi-rs-trash"></i>
                        </button>
                    </div>
                    <p>${item.type}</p>
                    <p>Color: ${item.color}</p>
                    <p>Size: ${item.size}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                        <span style="font-size: 13px; color: var(--gray-text);">Qty: ${qty}</span>
                        <span class="mini-cart-price">\u20B1 ${item.price}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (totalEl) {
        const formattedTotal = subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        totalEl.innerText = '\u20B1 ' + formattedTotal;
    }
}

function removeFromPreviewCart(index) {
    let cart = getCartData();
    cart.splice(index, 1);
    saveCartData(cart);
}

// GLOBAL ADD TO CART FUNCTION
function addToCart(product) {
    const errorMsg = document.getElementById('size-error-message');
    const sizeGrid = document.getElementById('size-grid');

    if (typeof currentSelectedSize !== 'undefined' && !currentSelectedSize) {
        if (errorMsg) errorMsg.classList.remove('error-hidden');
        if (sizeGrid) sizeGrid.classList.add('size-grid-error');
        return;
    }

    try {
        let cart = getCartData();
        const selectedSize = typeof currentSelectedSize !== 'undefined' ? currentSelectedSize : 'Default';
        const uniqueCartId = product.id + "-" + selectedSize + "-" + product.color;
        const existingItemIndex = cart.findIndex(item => item.cartItemId === uniqueCartId);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({
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
            });
        }

        saveCartData(cart);

        if (errorMsg) errorMsg.classList.add('error-hidden');

        const modal = document.getElementById('success-modal');
        const nav = document.querySelector('.navbar-section');
        if (document.getElementById('modal-img')) document.getElementById('modal-img').src = product.img;
        if (document.getElementById('modal-name')) document.getElementById('modal-name').innerText = product.name;
        if (document.getElementById('modal-price')) document.getElementById('modal-price').innerText = '\u20B1 ' + product.price;
        if (document.getElementById('modal-color')) document.getElementById('modal-color').innerText = product.color;
        if (document.getElementById('modal-size')) document.getElementById('modal-size').innerText = selectedSize;

        if (modal) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            if (nav) nav.style.right = `${scrollbarWidth}px`;
            document.body.style.overflow = 'hidden';
            modal.showModal();
        }

        if (typeof currentSelectedSize !== 'undefined') currentSelectedSize = null;
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active-size'));

    } catch (error) {
        console.error("Cart Memory Error:", error);
    }
}

function closeModal() {
    const m = document.getElementById('success-modal');
    if (m) m.close();
}
// MINI CART PANEL FUNCTIONS END

// MINI WISHLIST PANEL FUNCTIONS START
function buildWishlistPanel() {
    if (document.getElementById('wishlist-preview-panel')) return;
    const wishWrapper = document.createElement('div');
    wishWrapper.innerHTML = `
        <div id="wishlist-preview-overlay" onclick="closeWishlistPanel()"></div>
        <div id="wishlist-preview-panel">
            <div class="cart-preview-header">
                <h3>My Wishlist <span id="wishlist-preview-count">(0)</span></h3>
                <button onclick="closeWishlistPanel()" class="close-cart-btn">&times;</button>
            </div>
            <div class="cart-preview-body" id="wishlist-preview-body"></div>
            <div class="cart-preview-footer">
                <button class="cart-preview-checkout-btn" onclick="window.location.href='wishlist.html'">VIEW FULL WISHLIST</button>
            </div>
        </div>
    `;
    document.body.appendChild(wishWrapper);
}

function openWishlistPanel(event) {
    if (window.location.pathname.includes('wishlist.html')) return;
    if (event) event.preventDefault();
    const overlay = document.getElementById('wishlist-preview-overlay');
    const panel = document.getElementById('wishlist-preview-panel');
    const nav = document.querySelector('.navbar-section');
    if (!overlay || !panel) return;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    if (nav) nav.style.right = `${scrollbarWidth}px`;
    document.body.style.overflow = 'hidden';

    overlay.style.display = 'block';
    setTimeout(() => { overlay.style.opacity = '1'; panel.classList.add('open'); }, 10);
    renderWishlistPreview();
}

function closeWishlistPanel() {
    const overlay = document.getElementById('wishlist-preview-overlay');
    const panel = document.getElementById('wishlist-preview-panel');
    const nav = document.querySelector('.navbar-section');
    if (!overlay || !panel) return;

    document.body.style.overflow = '';
    document.body.style.paddingRight = '0px';
    if (nav) nav.style.right = '0px';

    panel.classList.remove('open');
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.display = 'none'; }, 300);
}

function renderWishlistPreview() {
    const body = document.getElementById('wishlist-preview-body');
    const countEl = document.getElementById('wishlist-preview-count');
    if (!body) return;

    let wishlist = getWishlistData();
    if (countEl) countEl.innerText = `(${wishlist.length})`;

    if (wishlist.length === 0) {
        body.innerHTML = `
            <div class="mini-cart-empty">
                <i class="fi fi-rs-heart-crack" style="font-size: 50px; color: #ddd; margin-bottom: 10px; display: block;"></i>
                <p>Your wishlist is currently empty.</p>
            </div>`;
        return;
    }

    let currentProducts = JSON.parse(localStorage.getItem('pace_products')) || [];

    body.innerHTML = wishlist.map((savedItem) => {

        let item = currentProducts.find(p => String(p.id) === String(savedItem.id));
        if (!item) return '';

        return `
            <div class="mini-cart-item" onclick="window.location.href='product-detail.html?id=${item.id}'">
                <img src="${item.img}" alt="${item.name}" class="mini-cart-img">
                <div class="mini-cart-details">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <h4 style="margin-bottom: 10px;">${item.name}</h4>
                        <button class="mini-cart-delete-btn" onclick="event.stopPropagation(); addToWishlist('${item.id}');" title="Remove from Wishlist">
                            <i class="fi fi-ss-heart wishlist-remove-icon"></i>
                        </button>
                    </div>
                    <p style="margin-bottom: 2px;">${item.type}</p>
                    <p>Color: ${item.color}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="mini-cart-price" style="margin-top: 10px;">\u20B1 ${item.price}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// GLOBAL ADD TO WISHLIST FUNCTION
function addToWishlist(productId) {
    let wishlist = getWishlistData();
    const index = wishlist.findIndex(item => String(item.id) === String(productId));

    if (index > -1) {
        wishlist.splice(index, 1);
    } else {
        wishlist.push({ id: String(productId) });
    }

    saveWishlistData(wishlist);

    if (document.getElementById('product-container') && typeof renderProducts === 'function') {
        const path = window.location.pathname;
        if (path.includes('homepage.html') || path === '/') {
            renderProducts(typeof activeCategory !== 'undefined' ? activeCategory : 'ALL', 8, false);
        } else {
            renderProducts(typeof activeCategory !== 'undefined' ? activeCategory : 'ALL', null, false);
        }
    }

    const pdWishBtn = document.querySelector('.pd-wish');
    if (pdWishBtn) {
        const urlParams = new URLSearchParams(window.location.search);
        let currentPgId = urlParams.get('id');

        if (!currentPgId && urlParams.get('name')) {
            let currentProducts = JSON.parse(localStorage.getItem('pace_products')) || [];
            let targetProduct = currentProducts.find(p => p.name === urlParams.get('name'));
            if (targetProduct) currentPgId = targetProduct.id;
        }

        if (currentPgId === String(productId)) {
            let updatedList = getWishlistData();
            let isSaved = updatedList.some(item => item.id === currentPgId);
            let heartIcon = pdWishBtn.querySelector('i');

            if (heartIcon) {
                heartIcon.className = isSaved ? 'fi fi-ss-heart' : 'fi fi-rs-heart';
                heartIcon.style.color = isSaved ? 'var(--brand-color)' : '';
            }
        }
    }

    const searchPanel = document.getElementById('global-search-panel');
    if (searchPanel && searchPanel.classList.contains('open')) {
        const searchInput = document.getElementById('panel-search-input');
        const currentQuery = searchInput ? searchInput.value.trim() : '';
        renderSearchPanelProducts(currentQuery);
    }
}
// MINI WISHLIST PANEL FUNCTIONS END

// GLOBAL FLOATING CHAT WIDGET FUNCTION START
const chatFAQs = {
    "Where is my order?": "You can track your order by navigating to the 'Order History' tab in your Account Settings.",
    "Do you offer free shipping?": "Yes! All orders automatically qualify for free standard shipping.",
    "What payment methods work?": "We accept GCash and Cash on Delivery.",
    "How do I use the size guide?": "Click the 'Size Guide' button on any product page to see exact measurements for Men's, Women's, and Kids' shoes.",
    "How do I save shoes for later?": "Click the heart icon on any shoe to add it to your Wishlist.",
    "Can I save multiple addresses?": "Yes! Go to 'Saved Addresses' in your Account to add and label multiple delivery locations.",
};

function buildGlobalChat() {

    const currentUser = window.currentUser;

    const hiddenPages = ['chat-support.html', 'login.html', 'signup.html', 'checkout.html', 'admin-dashboard.html', 'admin-products.html', 'admin-orders.html', 'admin-users.html', 'admin-messages.html', 'admin-reports.html'];
    const currentPath = window.location.pathname;
    const shouldHide = hiddenPages.some(page => currentPath.includes(page));

    if (!currentUser || shouldHide || document.getElementById('global-chat-container')) return;

    const chatContainer = document.createElement('div');
    chatContainer.id = 'global-chat-container';
    chatContainer.innerHTML = `
        <div id="chat-popup-window" class="chat-hidden">
            <div class="chat-header">
                <div>
                    <h4>PACE Support</h4>
                    <p>Typically replies in minutes</p>
                </div>
                <button class="close-chat-btn" onclick="toggleChat()">&times;</button>
            </div>
            
            <div class="chat-messages" id="chat-messages-box">
            </div>
            
            <div class="chat-faqs" id="chat-faqs-container">
                <button class="faq-chip" onclick="sendFAQMessage('Where is my order?')">Where is my order?</button>
                <button class="faq-chip" onclick="sendFAQMessage('Do you offer free shipping?')">Do you offer free shipping?</button>
                <button class="faq-chip" onclick="sendFAQMessage('What payment methods work?')">What payment methods work?</button>
                <button class="faq-chip" onclick="sendFAQMessage('How do I use the size guide?')">How do I use the size guide?</button>
                <button class="faq-chip" onclick="sendFAQMessage('How do I save shoes for later?')">How do I save shoes for later?</button>
                <button class="faq-chip" onclick="sendFAQMessage('Can I save multiple addresses?')">Can I save multiple addresses?</button>
            </div>
            
            <div class="chat-input-area">
                <input type="text" id="chat-text-input" placeholder="Type a message..." onkeypress="handleChatEnter(event)">
                <button onclick="sendChatMessage()"><i class="fi fi-rr-paper-plane"></i></button>
            </div>
        </div>
        
        <button id="floating-chat-btn" onclick="toggleChat()">
            <img id="chat-open-icon" src="Brand Image/pace chat logo.png" alt="Chat Support" style="width: 45px; height: 45px; object-fit: contain;">
            <i id="chat-close-icon" class="fi fi-rr-cross" style="display: none; font-size: 20px;"></i>
        </button>
    `;
    document.body.appendChild(chatContainer);
    loadChatHistory();
}

function toggleChat() {
    const chatWindow = document.getElementById('chat-popup-window');
    const openIcon = document.getElementById('chat-open-icon');
    const closeIcon = document.getElementById('chat-close-icon');

    if (chatWindow.classList.contains('chat-hidden')) {

        chatWindow.classList.remove('chat-hidden');
        if (openIcon) openIcon.style.display = 'none';
        if (closeIcon) closeIcon.style.display = 'block';

        const box = document.getElementById('chat-messages-box');
        box.scrollTop = box.scrollHeight;
    } else {
        chatWindow.classList.add('chat-hidden');
        if (openIcon) openIcon.style.display = 'block';
        if (closeIcon) closeIcon.style.display = 'none';
    }
}

document.addEventListener('click', function (event) {
    const chatWindow = document.getElementById('chat-popup-window');
    const chatBtn = document.getElementById('floating-chat-btn');

    if (chatWindow && !chatWindow.classList.contains('chat-hidden')) {
        if (!chatWindow.contains(event.target) && !chatBtn.contains(event.target)) {
            toggleChat();
        }
    }
});

function sendFAQMessage(question) {
    appendMessageUI('user-msg', question);
    saveChatToDatabase('user', question);

    if (typeof renderPageChat === 'function') renderPageChat();

    setTimeout(() => {
        const answer = chatFAQs[question];
        appendMessageUI('bot-msg', answer);
        saveChatToDatabase('bot', answer);

        if (typeof renderPageChat === 'function') renderPageChat();
    }, 1000);
}

function sendChatMessage() {
    const input = document.getElementById('chat-text-input');
    const text = input.value.trim();

    if (text !== '') {
        appendMessageUI('user-msg', text);
        saveChatToDatabase('user', text);
        input.value = '';

        if (typeof renderPageChat === 'function') renderPageChat();
    }
}

function handleChatEnter(event) {
    if (event.key === 'Enter') sendChatMessage();
}

function appendMessageUI(className, text) {
    const messageBox = document.getElementById('chat-messages-box');

    if (!messageBox) return;

    const msg = document.createElement('div');
    msg.className = `chat-msg ${className}`;
    msg.innerText = text;
    messageBox.appendChild(msg);
    messageBox.scrollTop = messageBox.scrollHeight;
}

function saveChatToDatabase(sender, text) {
    if (!window.currentUser) return;
    if (!window.currentUser.chatHistory) window.currentUser.chatHistory = [];

    const now = new Date();
    const timeString = now.toLocaleDateString() + ' at ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    window.currentUser.chatHistory.push({
        sender: sender,
        text: text,
        time: timeString,
        timestamp: Date.now(),
        read: false
    });

    if (window.syncChatToDatabase) {
        window.syncChatToDatabase(window.currentUser.email, window.currentUser.chatHistory);
    }
}

function loadChatHistory() {
    const messageBox = document.getElementById('chat-messages-box');
    messageBox.innerHTML = '';

    if (window.currentUser && window.currentUser.chatHistory && window.currentUser.chatHistory.length > 0) {
        window.currentUser.chatHistory.forEach((msg, index) => {
            const className = msg.sender === 'user' ? 'user-msg' : 'bot-msg';
            appendMessageUI(className, msg.text);

            if (index === window.currentUser.chatHistory.length - 1 && msg.sender === 'user' && msg.read) {
                const seenIndicator = document.createElement('div');
                seenIndicator.style.cssText = "font-size: 10px; color: var(--gray-text); text-align: right; margin-top: -10px; margin-bottom: 10px; padding-right: 10px;";
                seenIndicator.innerText = "Seen";
                messageBox.appendChild(seenIndicator);
                messageBox.scrollTop = messageBox.scrollHeight;
            }
        });
    } else {
        appendMessageUI('bot-msg', 'Hi there! Need help finding your perfect pair of shoes? 👟');
        if (window.currentUser) saveChatToDatabase('bot', 'Hi there! Need help finding your perfect pair of shoes? 👟');
    }
}
// GLOBAL FLOATING CHAT WIDGET FUNCTION END 

// GLOBAL SEARCH PANEL FUNCTIONS START
function buildSearchPanel() {
    if (document.getElementById('global-search-panel')) return;
    const searchWrapper = document.createElement('div');
    searchWrapper.innerHTML = `
        <div id="search-panel-overlay" onclick="closeSearchPanel()"></div>
        <div id="global-search-panel">
            <div class="search-panel-container">
                <div class="search-panel-header">
                    <div class="search-input-group">
                        <i class="fi fi-rr-search search-panel-icon"></i>
                        <input type="text" id="panel-search-input" placeholder="Type shoe name or type..." oninput="handleSearchPanelInput()" autocomplete="off">
                        <button onclick="clearSearchInput()" id="clear-search-btn" class="clear-search-btn" style="display: none;">&times;</button>
                    </div>
                    <button onclick="closeSearchPanel()" class="panel-close-btn">CANCEL</button>
                </div>
                <div class="search-panel-body" id="search-results-box">
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(searchWrapper);
}

window.toggleSearchPanel = function () {
    const panel = document.getElementById('global-search-panel');
    if (panel && panel.classList.contains('open')) {
        closeSearchPanel();
    } else {
        openSearchPanel();
    }
};

function openSearchPanel() {
    const overlay = document.getElementById('search-panel-overlay');
    const panel = document.getElementById('global-search-panel');
    const input = document.getElementById('panel-search-input');
    const nav = document.querySelector('.navbar-section');
    if (!overlay || !panel) return;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.paddingRight = `${scrollbarWidth}px`;
    if (nav) nav.style.paddingRight = `${scrollbarWidth}px`;

    document.body.style.overflow = 'hidden';

    overlay.classList.add('open');
    panel.classList.add('open');

    renderSearchPanelProducts(null);
    if (input) setTimeout(() => input.focus(), 100);
}

function closeSearchPanel() {
    const overlay = document.getElementById('search-panel-overlay');
    const panel = document.getElementById('global-search-panel');
    const input = document.getElementById('panel-search-input');
    const clearBtn = document.getElementById('clear-search-btn');
    const nav = document.querySelector('.navbar-section');
    if (!overlay || !panel) return;

    document.body.style.overflow = '';

    document.body.style.paddingRight = '0px';
    if (nav) nav.style.paddingRight = '0px';

    overlay.classList.remove('open');
    panel.classList.remove('open');

    setTimeout(() => {
        if (input) input.value = '';
        if (clearBtn) clearBtn.style.display = 'none';
    }, 300);
}

window.clearSearchInput = function () {
    const input = document.getElementById('panel-search-input');
    const clearBtn = document.getElementById('clear-search-btn');
    if (input) {
        input.value = '';
        input.focus();
    }
    if (clearBtn) clearBtn.style.display = 'none';
    renderSearchPanelProducts(null);
};

window.handleSearchPanelInput = function () {
    const input = document.getElementById('panel-search-input');
    const clearBtn = document.getElementById('clear-search-btn');
    if (!input) return;

    const query = input.value.trim();
    if (clearBtn) clearBtn.style.display = query.length > 0 ? 'block' : 'none';

    renderSearchPanelProducts(query);
};

window.executeSearchLink = function (searchText) {
    const input = document.getElementById('panel-search-input');
    const clearBtn = document.getElementById('clear-search-btn');
    if (input) input.value = searchText;
    if (clearBtn) clearBtn.style.display = 'block';
    renderSearchPanelProducts(searchText);
};

function renderSearchPanelProducts(query) {
    const resultsBox = document.getElementById('search-results-box');
    if (!resultsBox) return;

    let uniqueProducts = [];
    let nameMap = new Map();

    let currentProducts = JSON.parse(localStorage.getItem('pace_products')) || [];

    for (let p of currentProducts) {
        let uniqueKey = p.name + '-' + p.type;
        if (!nameMap.has(uniqueKey)) {
            nameMap.set(uniqueKey, { ...p, colorCount: 1 });
            uniqueProducts.push(nameMap.get(uniqueKey));
        } else {
            nameMap.get(uniqueKey).colorCount++;
        }
    }

    let resultsHTML = '';
    let productsToShow = [];
    let currentWishlist = getWishlistData();

    if (!query || query === '') {
        resultsHTML += `
            <div class="search-category-quicklinks">
                <span class="faq-chip" onclick="executeSearchLink('Men')">Men</span>
                <span class="faq-chip" onclick="executeSearchLink('Women')">Women</span>
                <span class="faq-chip" onclick="executeSearchLink('Kids')">Kids</span>
                <span class="faq-chip" onclick="executeSearchLink('Pace 680')">PACE 680</span>
                <span class="faq-chip" onclick="executeSearchLink('Pace Ice')">PACE Ice</span>
            </div>
            <div class="search-results-header"><h3>Suggested Products</h3></div>
        `;
        const permanentSuggestions = ['Pace 680', 'Pace 740', 'Pace Ice', 'Pace Tekela'];
        productsToShow = permanentSuggestions
            .map(shoeName => uniqueProducts.find(p => p.name === shoeName))
    } else {
        const lowerCaseQuery = query.toLowerCase();
        productsToShow = uniqueProducts.filter(p =>
            p.name.toLowerCase().includes(lowerCaseQuery) ||
            p.type.toLowerCase().includes(lowerCaseQuery)
        );

        if (productsToShow.length === 0) {
            resultsBox.innerHTML = `
                <div class="mini-cart-empty">
                    <i class="fi fi-rs-search" style="font-size: 50px; color: #ddd;"></i>
                    <p>No results found for "${query}".</p>
                </div>`;
            return;
        }
        resultsHTML += `<div class="search-results-header"><h3>Found for "${query}"</h3></div>`;
    }

    productsToShow.sort((a, b) => {
        let aStock = window.getTotalStock(a.stock);
        let bStock = window.getTotalStock(b.stock);
        if (aStock === 0 && bStock > 0) return 1;
        if (bStock === 0 && aStock > 0) return -1;
        return a.name.localeCompare(b.name);
    });

    resultsHTML += `<div class="product-section" style="padding-top: 0; background: transparent;">`;

    resultsHTML += productsToShow.map(p => {
        let isSaved = currentWishlist.some(item => item.id === p.id);
        let heartClass = isSaved ? "fi-ss-heart" : "fi-rs-heart";

        let badgeHTML = '';
        if (window.getTotalStock(p.stock) === 0) {
            badgeHTML = '<span class="new-badge" style="background-color: #d9534f;">OUT OF STOCK</span>';
        } else if (p.isNew) {
            badgeHTML = '<span class="new-badge">NEW</span>';
        }

        return `
            <div class="product-card">
                <button class="product-image">
                    ${badgeHTML}
                    <img src="${p.img}" class="primary-img">
                    <img src="${p.hover}" class="hover-img" onclick="window.location.href='product-detail.html?id=${p.id}'"> 
                </button>
                <div class="product-name">
                    <h5>${p.name}</h5>
                    <p>${p.colorCount} color${p.colorCount > 1 ? 's' : ''}</p>
                </div>
                <div class="product-price">
                    <p><i>${p.type}</i></p>
                    <p>\u20B1 ${p.price}</p>
                </div>
                <div class="product-btn">
                    <div class="wishlist"><button onclick="event.stopPropagation(); addToWishlist('${p.id}')"><i class="fi ${heartClass}"></i></button></div>
                    <div class="view" onclick="window.location.href='product-detail.html?id=${p.id}'"><button>SEE DETAILS</button></div>
                </div>
            </div>
        `;
    }).join('');

    resultsHTML += `</div>`;
    resultsBox.innerHTML = resultsHTML;
}
// GLOBAL SEARCH PANEL FUNCTIONS END

// FETCH LIVE PRODUCTS FROM MYSQL (WITH CACHE BUSTER)
function initDatabase() {
    fetch('Database/fetch-products.php?nocache=' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem('pace_products', JSON.stringify(data.products));

                if (typeof renderProducts === 'function') {
                    const path = window.location.pathname.toLowerCase();
                    if (path.includes('homepage') || path === '/' || path.endsWith('/pace/')) {
                        renderProducts('ALL', 8);
                    } else if (typeof activeCategory !== 'undefined') {
                        renderProducts(activeCategory);
                    } else {
                        renderProducts('ALL');
                    }
                }

                if (typeof renderCartPreview === 'function') renderCartPreview();
                if (typeof renderWishlistPreview === 'function') renderWishlistPreview();
                if (typeof renderCartPage === 'function') renderCartPage();
                if (typeof renderWishlistPage === 'function') renderWishlistPage();
            }
        })
        .catch(error => console.error("Database fetch error:", error));
}

window.currentUser = null;
window.guestCart = [];
window.guestWishlist = [];

// INITIALIZE ON PAGE LOAD
window.addEventListener('DOMContentLoaded', () => {

    fetch('Database/fetch-session.php?nocache=' + new Date().getTime())
        .then(res => res.text())
        .then(text => {
            try {
                const data = JSON.parse(text);
                if (data.success && data.user) {
                    window.currentUser = data.user;
                    window.guestCart = [];
                    window.guestWishlist = [];
                } else {
                    window.currentUser = null;
                    window.guestCart = data.guest_cart || [];
                    window.guestWishlist = data.guest_wishlist || [];
                }
            } catch (e) {
                console.error("Session parse error:", text);
            }

            initDatabase();

            renderNavbar();
            renderFooter();
            buildCartPanel();
            buildWishlistPanel();
            buildSearchPanel();
            renderUserMenu();
            buildGlobalChat();

            if (typeof loadAccountData === 'function') loadAccountData();
            if (typeof loadAddressData === 'function') loadAddressData();
            if (typeof loadPaymentData === 'function') loadPaymentData();
        })
        .catch(err => {
            console.error("Network error:", err);
            initDatabase();
            renderNavbar();
            renderFooter();
        });

    const successModal = document.getElementById('success-modal');
    if (successModal) {
        successModal.addEventListener('close', () => {
            const nav = document.querySelector('.navbar-section');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '0px';
            if (nav) nav.style.right = '0px';
        });
    }
});