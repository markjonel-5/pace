// ===============================================
// 1. GLOBAL VARIABLES
// ===============================================
let currentPage = 1;
const itemsPerPage = 4;
let currentFilteredProducts = [];
let currentDeleteId = null;
let currentStockFilter = 'ALL';
let tempStockState = {}; // Used to preserve size quantities if admin misclicks category

// SIZE CONFIGURATION DICTIONARY
const sizeConfig = {
    'MEN': ['M 8', 'M 8.5', 'M 9', 'M 9.5', 'M 10', 'M 10.5', 'M 11', 'M 11.5', 'M 12', 'M 12.5', 'M 13', 'M 13.5'],
    'WOMEN': ['W 5', 'W 5.5', 'W 6', 'W 6.5', 'W 7', 'W 7.5', 'W 8', 'W 8.5', 'W 9', 'W 9.5', 'W 10', 'W 10.5'],
    'KIDS': ['1Y', '1.5Y', '2Y', '2.5Y', '3Y', '3.5Y', '4Y', '4.5Y', '5Y', '5.5Y', '6Y', '6.5Y']
};

// ===============================================
// 2. PAGE INITIALIZATION & SECURITY
// ===============================================
window.addEventListener('DOMContentLoaded', () => {
    // SECURITY CHECK
    const currentUser = JSON.parse(localStorage.getItem('pace_current_user'));
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = "login.html";
        return;
    }

    // FIX: Safely grab names using BOTH the new database format and old format
    let fName = currentUser.first_name || currentUser.firstName || 'Admin';
    let lName = currentUser.last_name || currentUser.lastName || '';
    
    // Force to strings so .charAt() never crashes
    fName = String(fName);
    lName = String(lName);

    const firstInitial = fName.length > 0 ? fName.charAt(0) : 'A';
    const lastInitial = lName.length > 0 ? lName.charAt(0) : '';
    const initials = (firstInitial + lastInitial).toUpperCase();

    // Set Sidebar Name & Initials
    const sidebarInitials = document.getElementById('sidebar-initials');
    const adminNameDisplay = document.getElementById('admin-name-display');
    if (sidebarInitials) sidebarInitials.innerText = initials;
    if (adminNameDisplay) adminNameDisplay.innerText = `${fName} ${lName}`.trim();

    // Set Popup Name and Initials dynamically based on the logged-in admin
    const popupName = document.getElementById('popup-admin-name');
    const popupInitials = document.getElementById('popup-initials');
    if (popupName) popupName.innerText = `${fName} ${lName}`.trim();
    if (popupInitials) popupInitials.innerText = initials;

    // SEARCH LISTENER
    const searchInput = document.getElementById('products-search-input');
    if (searchInput) {
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search');
        if (searchParam) {
            searchInput.value = searchParam; 
        }
        searchInput.addEventListener('input', filterProducts);
    }

    // CATEGORY LISTENER FOR DYNAMIC SIZE GRID
    const categoryDropdown = document.getElementById('prod-category');
    if (categoryDropdown) {
        categoryDropdown.addEventListener('change', function(e) {
            generateSizeGrid(e.target.value);
        });
    }

    // INITIALIZE TABLE
    loadProducts();
});

// ===============================================
// 3. STATS, DATA LOADING & HELPER FUNCTIONS
// ===============================================
function getTotalStock(stockVal) {
    // Legacy support (if stock is still a single number)
    if (typeof stockVal === 'number' || typeof stockVal === 'string') {
        return parseInt(stockVal) || 0;
    }
    // New nested object support
    if (typeof stockVal === 'object' && stockVal !== null) {
        return Object.values(stockVal).reduce((total, qty) => total + (parseInt(qty) || 0), 0);
    }
    return 0;
}

function loadProducts() {
    // Ask the PHP bridge for the latest database info
    fetch('Database/fetch-products.php')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Save it locally so your table filters and pagination still work perfectly!
            localStorage.setItem('pace_products', JSON.stringify(data.products));
            renderProductStats(data.products);
            filterProducts();
        }
    })
    .catch(error => console.error("Error loading products:", error));
}

function renderProductStats(products) {
    let total = products.length;
    let lowStock = 0;
    let outOfStock = 0;
    let totalValue = 0;

    products.forEach(p => {
        let stock = getTotalStock(p.stock);
        let price = parseFloat(p.price.replace(/,/g, '')) || 0;

        if (stock === 0) outOfStock++;
        else if (stock <= 10) lowStock++;

        totalValue += (stock * price);
    });

    document.getElementById('stat-total-products').innerText = total;
    document.getElementById('stat-low-stock').innerText = lowStock;
    document.getElementById('stat-out-of-stock').innerText = outOfStock;
    document.getElementById('stat-inventory-value').innerText = '₱ ' + totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

// ===============================================
// 4. FILTERING, TABLE RENDERING & PAGINATION
// ===============================================
window.filterByStock = function(status, element) {
    document.querySelectorAll('.order-stat-box').forEach(box => {
        box.classList.remove('active');
    });

    if (element) {
        element.classList.add('active');
    }

    currentStockFilter = status;
    filterProducts();
};

function filterProducts() {
    let products = JSON.parse(localStorage.getItem('pace_products')) || [];
    const searchVal = document.getElementById('products-search-input').value.toLowerCase();
    const categoryVal = document.getElementById('filter-category').value;

    let filtered = products;

    // Filter by Stock Status
    if (currentStockFilter === 'LOW') {
        filtered = filtered.filter(p => {
            let s = getTotalStock(p.stock);
            return s > 0 && s <= 10;
        });
    } else if (currentStockFilter === 'OUT') {
        filtered = filtered.filter(p => getTotalStock(p.stock) === 0);
    }

    // Filter by Category
    if (categoryVal === 'NEW') {
        filtered = filtered.filter(p => p.isNew === true);
    } else if (categoryVal !== 'ALL') {
        filtered = filtered.filter(p => p.type === categoryVal);
    }

    // Filter by Search Query
    if (searchVal.trim() !== '') {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchVal) || 
            p.id.toLowerCase().includes(searchVal)
        );
    }

    currentFilteredProducts = filtered;
    currentPage = 1; 
    
    renderProductsTable();
}

function renderProductsTable() {
    const tableBody = document.getElementById('products-table-body');
    const paginationContainer = document.getElementById('pagination-container');
    
    if (currentFilteredProducts.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 40px; color: var(--gray-text);">No products found.</td></tr>`;
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = currentFilteredProducts.slice(start, end);

    tableBody.innerHTML = paginatedItems.map(p => {
        let stock = getTotalStock(p.stock);
        
        let statusClass = 'status-active';
        let statusText = 'Active';
        if (stock === 0) {
            statusClass = 'status-out';
            statusText = 'Out of Stock';
        } else if (stock <= 10) {
            statusClass = 'status-low';
            statusText = 'Low Stock';
        }

        return `
        <tr>
            <td>
                <div class="table-product-cell">
                    <img src="${p.img}" alt="${p.name}" class="table-product-img">
                    <div class="table-product-name">
                        <strong>${p.name}</strong>
                        <span>Color: ${p.color} ${p.isNew ? '<span style="color:var(--brand-color);">(New)</span>' : ''}</span>
                    </div>
                </div>
            </td>
            <td style="font-weight: 600; color: var(--gray-text);">${p.id}</td>
            <td style="color: var(--darkgray-text);">${p.type}</td>
            <td style="font-weight: 600;">₱ ${p.price}</td>
            <td style="font-weight: 700; color: ${stock <= 10 ? 'var(--brand-color)' : 'var(--darkgray-text)'};">${stock}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td style="text-align: right; padding-right: 30px;">
                <button class="action-btn edit" onclick="openProductModal('${p.id}')"><i class="fi fi-rr-edit"></i></button>
                <button class="action-btn delete" onclick="openDeleteModal('${p.id}')"><i class="fi fi-rr-trash"></i></button>
            </td>
        </tr>
        `;
    }).join('');

    renderPagination();
}

function renderPagination() {
    const container = document.getElementById('pagination-container');
    if(!container) return;

    const totalPages = Math.ceil(currentFilteredProducts.length / itemsPerPage);

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    for(let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    container.innerHTML = html;
}

window.goToPage = function(page) {
    currentPage = page;
    renderProductsTable();
};

// ===============================================
// 5. ADD & EDIT PRODUCT MODAL LOGIC
// ===============================================
let shoeImage = []; 

// DYNAMIC SIZE GRID GENERATOR
function generateSizeGrid(category, existingStock = null) {
    const container = document.getElementById('size-stock-container');
    const sizes = sizeConfig[category] || [];
    
    // Merge existing stock into temporary state to preserve data during misclicks
    if (existingStock && typeof existingStock === 'object') {
        tempStockState = { ...tempStockState, ...existingStock };
    }

    let html = '<div class="size-stock-grid">';
    sizes.forEach(size => {
        let qty = tempStockState[size] || 0;
        html += `
            <div class="size-stock-item">
                <label>${size}</label>
                <input type="number" class="size-qty-input account-input-field" data-size="${size}" value="${qty}" min="0" required>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;

    // Attach listeners to preserve values instantly as user types
    container.querySelectorAll('.size-qty-input').forEach(input => {
        input.addEventListener('input', (e) => {
            tempStockState[e.target.dataset.size] = parseInt(e.target.value) || 0;
        });
    });
}

window.openProductModal = function(productId = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('product-form');
    const nav = document.querySelector('.admin-navbar-section');

    form.reset(); 
    shoeImage = []; 
    tempStockState = {}; // Clear temp stock state
    document.getElementById('admin-media-error').style.display = 'none';
    renderAdminPhotoPreviews(); 

    if (productId) {
        title.innerText = "Edit Product";
        let products = JSON.parse(localStorage.getItem('pace_products')) || [];
        let p = products.find(item => item.id === productId);
        
        if (p) {
            document.getElementById('prod-original-id').value = p.id;
            document.getElementById('prod-name').value = p.name;
            document.getElementById('prod-category').value = p.type;
            document.getElementById('prod-color').value = p.color;
            document.getElementById('prod-price').value = parseFloat(p.price.replace(/,/g, ''));
            document.getElementById('prod-isNew').checked = p.isNew;
            
            // Build the size grid based on current saved nested stock
            let savedStock = typeof p.stock === 'object' ? p.stock : {};
            generateSizeGrid(p.type, savedStock);
            
            if (p.img) shoeImage.push(p.img);
            if (p.hover) shoeImage.push(p.hover);
            renderAdminPhotoPreviews();
        }
    } else {
        title.innerText = "Add New Product";
        document.getElementById('prod-original-id').value = ""; 
        document.getElementById('prod-category').value = "MEN"; // Default
        generateSizeGrid('MEN'); // Generate fresh grid
    }

    if (modal) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        if (nav) nav.style.paddingRight = `calc(40px + ${scrollbarWidth}px)`; 
        modal.showModal();
    }
};

window.closeProductModal = function() {
    const modal = document.getElementById('product-modal');
    const nav = document.querySelector('.admin-navbar-section');
    if (modal) {
        modal.close();
        document.body.style.overflow = '';
        document.body.style.paddingRight = ''; 
        if (nav) nav.style.paddingRight = ''; 
    }
};

// --- PHOTO UPLOAD LOGIC ---
document.getElementById('admin-upload-photos')?.addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    const errorMsg = document.getElementById('admin-media-error');
    
    if (shoeImage.length + files.length > 2) {
        errorMsg.innerText = "Maximum of 2 photos allowed.";
        errorMsg.style.display = 'block';
        this.value = ''; 
        return;
    }
    
    files.forEach(file => {
        if (file.size > 2 * 1024 * 1024) { 
            errorMsg.innerText = "A photo is too large (Max 2MB).";
            errorMsg.style.display = 'block';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            shoeImage.push(event.target.result);
            renderAdminPhotoPreviews();
            errorMsg.style.display = 'none';
        };
        reader.readAsDataURL(file);
    });
    
    this.value = ''; 
});

function renderAdminPhotoPreviews() {
    const container = document.getElementById('admin-media-preview-container');
    const uploadBox = document.getElementById('admin-upload-box');
    let html = '';
    
    shoeImage.forEach((src, index) => {
        let tagText = index === 0 ? "Primary" : "Hover";
        html += `
            <div style="position: relative;">
                <button type="button" class="media-delete-btn" onclick="removeAdminPhoto(${index})">&times;</button>
                <div class="media-preview-box">
                    <img src="${src}" class="media-preview-content">
                </div>
                <div style="font-size: 10px; text-align: center; color: var(--gray-text); margin-top: 3px; font-weight: 600;">${tagText}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;

    if (shoeImage.length >= 2) {
        uploadBox.style.display = 'none';
    } else {
        uploadBox.style.display = 'flex';
    }
}

window.removeAdminPhoto = function(index) {
    shoeImage.splice(index, 1);
    renderAdminPhotoPreviews();
};

window.saveProduct = function(event) {
    event.preventDefault(); 
    
    const errorMsg = document.getElementById('admin-media-error');
    if (shoeImage.length !== 2) {
        errorMsg.innerText = "You must upload exactly 2 photos (Primary and Hover).";
        errorMsg.style.display = 'block';
        return; 
    }

    const submitBtn = event.target.querySelector('.account-save-btn');
    submitBtn.innerText = "Saving...";
    submitBtn.style.pointerEvents = "none";

    let nestedStock = {};
    document.querySelectorAll('.size-qty-input').forEach(input => {
        nestedStock[input.dataset.size] = parseInt(input.value) || 0;
    });

    let rawPrice = parseFloat(document.getElementById('prod-price').value);
    
    let productData = {
        id: document.getElementById('prod-original-id').value,
        name: document.getElementById('prod-name').value.trim(),
        type: document.getElementById('prod-category').value,
        color: document.getElementById('prod-color').value.trim(),
        price: rawPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        isNew: document.getElementById('prod-isNew').checked,
        stock: nestedStock,
        img: shoeImage[0],
        hover: shoeImage[1]
    };

    /// Send it to the Database!
    fetch('Database/save-product.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
    })
    .then(response => response.json())
    .then(data => {
        submitBtn.innerText = "Save Product";
        submitBtn.style.pointerEvents = "auto";
        if (data.success) {
            closeProductModal();
            loadProducts(); // Refresh the table automatically!
        } else {
            alert("Error saving: " + data.message);
        }
    })
    .catch(error => {
        // FIX: Unfreeze the button if the server crashes!
        submitBtn.innerText = "Save Product";
        submitBtn.style.pointerEvents = "auto";
        console.error('Error:', error);
        alert("A server error occurred. Please try again.");
    });
};

// ===============================================
// 6. DELETE PRODUCT MODAL LOGIC
// ===============================================
window.openDeleteModal = function(productId) {
    let products = JSON.parse(localStorage.getItem('pace_products')) || [];
    let p = products.find(item => String(item.id) === String(productId));
    
    const nav = document.querySelector('.admin-navbar-section');
    const modal = document.getElementById('delete-modal');
    
    if (p && modal) {
        currentDeleteId = String(productId); 
        document.getElementById('delete-prod-name').innerText = p.name;
        
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        if (nav) nav.style.paddingRight = `calc(40px + ${scrollbarWidth}px)`;

        modal.showModal();
    }
};

window.closeDeleteModal = function() {
    currentDeleteId = null;
    const modal = document.getElementById('delete-modal');
    const nav = document.querySelector('.admin-navbar-section');
    
    if (modal) {
        modal.close();
        document.body.style.overflow = '';
        document.body.style.paddingRight = ''; 
        if (nav) nav.style.paddingRight = ''; 
    }
};

window.executeDelete = function() {
    if (!currentDeleteId) return;

    // Send the Delete request to MySQL
    fetch('Database/delete-product.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentDeleteId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Keep your awesome logic that removes it from users' carts and wishlists locally
            let users = JSON.parse(localStorage.getItem('pace_users')) || [];
            let currentUser = JSON.parse(localStorage.getItem('pace_current_user'));
            let isCurrentUserUpdated = false;

            users = users.map(user => {
                if (user.cart) user.cart = user.cart.filter(item => String(item.productId) !== String(currentDeleteId));
                if (user.wishlist) user.wishlist = user.wishlist.filter(item => String(item.id) !== String(currentDeleteId));
                if (currentUser && currentUser.email === user.email) {
                    currentUser = user;
                    isCurrentUserUpdated = true;
                }
                return user;
            });

            localStorage.setItem('pace_users', JSON.stringify(users));
            if (isCurrentUserUpdated) localStorage.setItem('pace_current_user', JSON.stringify(currentUser));

            let guestCart = JSON.parse(localStorage.getItem('pace_guest_cart')) || [];
            localStorage.setItem('pace_guest_cart', JSON.stringify(guestCart.filter(item => String(item.productId) !== String(currentDeleteId))));

            let guestWishlist = JSON.parse(localStorage.getItem('pace_guest_wishlist')) || [];
            localStorage.setItem('pace_guest_wishlist', JSON.stringify(guestWishlist.filter(item => String(item.id) !== String(currentDeleteId))));
            
            closeDeleteModal();
            loadProducts(); // Refresh the table
        }
    })
    .catch(error => console.error('Error:', error));
};