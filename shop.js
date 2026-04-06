// HOMEPAGE, ALL SHOES, MEN, WOMEN, KIDS, NEW PRODUCTS RENDERING
let currentLimit = 12;
let activeCategory = '';
let storedList = [];

function renderProducts(category, fixedLimit = null, randomize = false) {
    const container = document.getElementById('product-container');
    const loadBtn = document.getElementById('load-btn');
    if (!container) return;

    if (category !== activeCategory) {
        activeCategory = category;
        currentLimit = 12;

        let productList = JSON.parse(localStorage.getItem('pace_products')) || products;

        let tempProducts = productList;
        if (category === 'NEW') {
            tempProducts = productList.filter(p => p.isNew === true);
        } else if (category !== 'ALL') {
            tempProducts = productList.filter(p => p.type === category);
        }

        let uniqueProducts = [];
        let nameMap = new Map();

        for (let p of tempProducts) {
            let uniqueKey = p.name + '-' + p.type;
            if (!nameMap.has(uniqueKey)) {
                nameMap.set(uniqueKey, { ...p, colorCount: 1 });
                uniqueProducts.push(nameMap.get(uniqueKey));
            } else {
                nameMap.get(uniqueKey).colorCount++;
            }
        }
        tempProducts = uniqueProducts;

        tempProducts.sort((a, b) => {
            let aStock = window.getTotalStock(a.stock);
            let bStock = window.getTotalStock(b.stock);
            if (aStock === 0 && bStock > 0) return 1;
            if (bStock === 0 && aStock > 0) return -1;
            return 0;
        });

        if (randomize) {
            const isBack = performance.getEntriesByType("navigation")[0]?.type === "back_forward";
            if (isBack && sessionStorage.getItem("saved_products")) {
                tempProducts = JSON.parse(sessionStorage.getItem("saved_products"));
                if (sessionStorage.getItem("saved_limit")) {
                    currentLimit = parseInt(sessionStorage.getItem("saved_limit"));
                }
            } else {
                tempProducts = [...tempProducts].sort(() => Math.random() - 0.5);
                sessionStorage.setItem("saved_products", JSON.stringify(tempProducts));
                sessionStorage.setItem("saved_limit", 12);
            }
        }
        storedList = tempProducts;
    }

    let displayProducts = storedList;
    let limitToUse = fixedLimit ? fixedLimit : currentLimit;
    displayProducts = storedList.slice(0, limitToUse);

    let currentWishlist = getWishlistData();

    container.innerHTML = displayProducts.map(p => {
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
                    <p>₱ ${p.price}</p>
                </div>
                <div class="product-btn">
                    <div class="wishlist"><button onclick="addToWishlist('${p.id}')"><i class="fi ${heartClass}"></i></button></div>
                    <div class="view" onclick="window.location.href='product-detail.html?id=${p.id}'"><button>SEE DETAILS</button></div>
                </div>
            </div>
        `;
    }).join('');

    if (loadBtn) {
        if (fixedLimit || displayProducts.length >= storedList.length) loadBtn.style.display = 'none';
        else loadBtn.style.display = 'inline-block';
    }

    const viewCountText = document.getElementById('load-count');
    if (viewCountText) {
        viewCountText.innerText = `You have viewed ${displayProducts.length} of ${storedList.length} products`;
        viewCountText.style.display = fixedLimit ? 'none' : 'block';
    }
}

function loadMore() {
    currentLimit += 8;
    sessionStorage.setItem("saved_limit", currentLimit);
    renderProducts(activeCategory, null, true);
}

function sortProducts(sortType) {
    if (sortType === 'low-high') {
        storedList.sort((a, b) => parseFloat(a.price.replace(/,/g, '')) - parseFloat(b.price.replace(/,/g, '')));
    } else if (sortType === 'high-low') {
        storedList.sort((a, b) => parseFloat(b.price.replace(/,/g, '')) - parseFloat(a.price.replace(/,/g, '')));
    } else if (sortType === 'new') {
        storedList.sort((a, b) => (a.isNew === b.isNew) ? 0 : a.isNew ? -1 : 1);
    }

    if (window.location.pathname.includes('homepage.html') || window.location.pathname === '/') {
        renderProducts('ALL', 8, false);
    } else {
        currentLimit = 12;
        renderProducts(activeCategory, null, false);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path.includes('homepage.html') || path === '/') renderProducts('ALL', 8, true);
    else if (path.includes('women.html')) renderProducts('WOMEN');
    else if (path.includes('men.html')) renderProducts('MEN');
    else if (path.includes('kids.html')) renderProducts('KIDS');
    else if (path.includes('new.html')) renderProducts('NEW');
    else if (path.includes('all-product.html')) renderProducts('ALL', null, true);
});