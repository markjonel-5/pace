window.addEventListener('DOMContentLoaded', () => {
    // 1. Check Security
    fetch('Database/fetch-session.php?nocache=' + new Date().getTime())
        .then(res => res.json())
        .then(data => {
            if (!data.success || data.user.role !== 'admin') {
                window.location.href = "login.html";
                return;
            }
            
            // 2. Fetch all data using the Dashboard Bridge!
            fetch('Database/fetch-dashboard.php?nocache=' + new Date().getTime())
            .then(r => r.json())
            .then(dashData => {
                if(!dashData.success) return;
                
                const orders = dashData.data.orders || [];
                const products = dashData.data.products || [];
                const users = dashData.data.users || [];

                // 3. Compute Top 4 Stats & TRENDS
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();
                const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

                let totalRevenue = 0, thisMonthRev = 0, lastMonthRev = 0;
                let totalCompletedOrders = 0, thisMonthOrd = 0, lastMonthOrd = 0;
                
                orders.forEach(o => {
                    if (o.status === 'Completed') {
                        let amount = parseFloat(o.totalAmount || 0);
                        totalRevenue += amount;
                        totalCompletedOrders++;

                        let orderDate = new Date(o.date);
                        if (!isNaN(orderDate)) {
                            if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
                                thisMonthRev += amount;
                                thisMonthOrd++;
                            } else if (orderDate.getMonth() === prevMonth && orderDate.getFullYear() === prevYear) {
                                lastMonthRev += amount;
                                lastMonthOrd++;
                            }
                        }
                    }
                });

                const totalCustomers = users.filter(u => u.role !== 'admin').length;
                let thisMonthUsers = 0, lastMonthUsers = 0;
                users.forEach(u => {
                    if (u.role !== 'admin') {
                        let regStr = u.registered_date || u.registeredDate;
                        if (regStr && regStr !== 'Unknown') {
                            let regDate = new Date(regStr);
                            if (!isNaN(regDate)) {
                                if (regDate.getMonth() === currentMonth && regDate.getFullYear() === currentYear) thisMonthUsers++;
                                else if (regDate.getMonth() === prevMonth && regDate.getFullYear() === prevYear) lastMonthUsers++;
                            }
                        }
                    }
                });

                let thisMonthProducts = 0, lastMonthProducts = 0;
                products.forEach(p => {
                    if (p.dateAdded) {
                        let pDate = new Date(p.dateAdded);
                        if (!isNaN(pDate)) {
                            if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) thisMonthProducts++;
                            else if (pDate.getMonth() === prevMonth && pDate.getFullYear() === prevYear) lastMonthProducts++;
                        }
                    }
                });

                // Populate Main Numbers
                document.getElementById('rep-revenue').innerText = '₱ ' + totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 });
                document.getElementById('rep-orders').innerText = orders.length; 
                document.getElementById('rep-customers').innerText = totalCustomers;
                document.getElementById('rep-products').innerText = products.length;

                // Helper Function to Generate Trend HTML
                function getTrendHTML(current, previous) {
                    if (previous === 0 && current === 0) return `<span class="trend-badge trend-neutral"><i class="fi fi-rr-minus-small"></i> 0%</span>`;
                    if (previous === 0 && current > 0) return `<span class="trend-badge trend-positive"><i class="fi fi-rr-arrow-trend-up"></i> +100%</span>`;
                    
                    const percentChange = ((current - previous) / previous) * 100;
                    const rounded = Math.abs(Math.round(percentChange));
                    
                    if (percentChange > 0) {
                        return `<span class="trend-badge trend-positive"><i class="fi fi-rr-arrow-trend-up"></i> +${rounded}%</span>`;
                    } else if (percentChange < 0) {
                        return `<span class="trend-badge trend-negative"><i class="fi fi-rr-arrow-trend-down"></i> -${rounded}%</span>`;
                    } else {
                        return `<span class="trend-badge trend-neutral"><i class="fi fi-rr-minus-small"></i> 0%</span>`;
                    }
                }

                // Inject Trend Badges into HTML
                const trendRevEl = document.getElementById('trend-rep-revenue');
                const trendOrdEl = document.getElementById('trend-rep-orders');
                const trendCustEl = document.getElementById('trend-rep-customers');
                const trendProductsEl = document.getElementById('trend-rep-products');

                if (trendRevEl) trendRevEl.innerHTML = getTrendHTML(thisMonthRev, lastMonthRev);
                if (trendOrdEl) trendOrdEl.innerHTML = getTrendHTML(thisMonthOrd, lastMonthOrd);
                if (trendCustEl) trendCustEl.innerHTML = getTrendHTML(thisMonthUsers, lastMonthUsers);
                if (trendProductsEl) trendProductsEl.innerHTML = getTrendHTML(thisMonthProducts, lastMonthProducts);

                // 4. Compute Double Bar Graph Data
                let monthlyRev = new Array(12).fill(0);
                let monthlyOrd = new Array(12).fill(0);

                orders.forEach(o => {
                    if (o.status === 'Completed') {
                        const date = new Date(o.date);
                        if (!isNaN(date)) {
                            let month = date.getMonth();
                            monthlyRev[month] += parseFloat(o.totalAmount || 0);
                            monthlyOrd[month] += 1;
                        }
                    }
                });

                const maxRev = Math.max(...monthlyRev, 100);
                const maxOrd = Math.max(...monthlyOrd, 10);
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                
                const chartArea = document.getElementById('double-bar-chart');
                if (chartArea) {
                    chartArea.innerHTML = monthNames.map((month, index) => {
                        const revHeight = (monthlyRev[index] / maxRev) * 100;
                        const ordHeight = (monthlyOrd[index] / maxOrd) * 100;
                        
                        const revText = `₱ ${monthlyRev[index].toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
                        const ordText = `${monthlyOrd[index]} Orders`;

                        return `
                            <div class="month-col">
                                <div class="bar-group">
                                    <div class="bar rev" style="height: ${revHeight}%" onmousemove="showReportTooltip(event, '${revText}')" onmouseout="hideReportTooltip()"></div>
                                    <div class="bar ord" style="height: ${ordHeight}%" onmousemove="showReportTooltip(event, '${ordText}')" onmouseout="hideReportTooltip()"></div>
                                </div>
                                <span class="month-label">${month}</span>
                            </div>
                        `;
                    }).join('');
                }

                setupTooltip();
            });
        });
});

// ==========================================
// TOOLTIP LOGIC
// ==========================================
function setupTooltip() {
    let tooltip = document.getElementById('report-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'report-tooltip';
        document.body.appendChild(tooltip);
    }
}

window.showReportTooltip = function(event, value) {
    const tooltip = document.getElementById('report-tooltip');
    if (tooltip) {
        tooltip.innerHTML = value;
        tooltip.style.opacity = '1';
        tooltip.style.left = event.clientX + 'px';
        tooltip.style.top = event.clientY + 'px';
    }
};

window.hideReportTooltip = function() {
    const tooltip = document.getElementById('report-tooltip');
    if (tooltip) tooltip.style.opacity = '0';
};

// PDF Generation
window.downloadPDF = function() {
    const element = document.getElementById('printable-report');
    const header = document.getElementById('pdf-header');
    const btn = document.getElementById('pdf-download-btn');
    
    document.getElementById('report-date').innerText = new Date().toLocaleString();
    if (header) header.style.display = 'block';
    if (btn) btn.style.display = 'none';

    element.style.height = 'auto';

    const opt = {
        margin:       0.5,
        filename:     'PACE_System_Report.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        if (header) header.style.display = 'none';
        if (btn) btn.style.display = 'flex';
        element.style.height = 'calc(100vh - 120px)';
    });
};