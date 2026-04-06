// CATEGORY INFORMATION
const categories = [
    { title: "MEN", desc: "Built for style, comfort, and confidence", img: "Category Image/Men Category.jpg", color: "#C06C37", link: "men.html" },
    { title: "WOMEN", desc: "Built for elegant, versatile, and empowered", img: "Category Image/Women Category.jpg", color: "#C06C37", link: "women.html" },
    { title: "KIDS", desc: "Built for playful designs for every adventure", img: "Category Image/Kid Category.jpg", color: "#C06C37", link: "kids.html" }
];

// CATEGORY CAROUSEL FUNCTION
let index = 0;

function nextCategory(direction) {
    const track = document.getElementById("image-track");
    const catTitle = document.getElementById("cat-title");
    const catDesc = document.getElementById("cat-desc");
    const catBg = document.getElementById("cat-bg");

    if (!track) return;

    index += direction;
    if (index >= categories.length) index = 0;
    if (index < 0) index = categories.length - 1;

    track.style.transform = `translateX(-${index * 100}%)`;

    const current = categories[index];
    catBg.style.backgroundColor = current.color;

    catTitle.classList.remove('text-slide-up');
    catDesc.classList.remove('text-slide-up');

    void catTitle.offsetWidth;

    catTitle.innerText = current.title;
    catDesc.innerText = current.desc;

    catTitle.classList.add('text-slide-up');
    catDesc.classList.add('text-slide-up');
}

function visitCategory() {
    window.location.href = categories[index].link;
}

function renderCategoryUI() {
    const track = document.getElementById("image-track");
    const catTitle = document.getElementById("cat-title");
    const catDesc = document.getElementById("cat-desc");
    const catBg = document.getElementById("cat-bg");
    const dots = document.querySelectorAll('.carousel-indicators .dot');

    if (!track) return;

    track.style.transform = `translateX(-${index * 100}%)`;

    const current = categories[index];
    catBg.style.backgroundColor = current.color;

    catTitle.classList.remove('text-slide-up');
    catDesc.classList.remove('text-slide-up');
    void catTitle.offsetWidth;

    catTitle.innerText = current.title;
    catDesc.innerText = current.desc;

    catTitle.classList.add('text-slide-up');
    catDesc.classList.add('text-slide-up');

    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function nextCategory(direction) {
    index += direction;
    if (index >= categories.length) index = 0;
    if (index < 0) index = categories.length - 1;
    renderCategoryUI();
}

function goToCategory(newIndex) {
    if (newIndex === index) return;
    index = newIndex;
    renderCategoryUI();
}

function visitCategory() {
    window.location.href = categories[index].link;
}

// ABOUT INFORMATION
const aboutContainer = document.getElementById('about-info');
if (aboutContainer) {
    const aboutData = [
        { title: "COMFORT", img: "About Image/comfort.jpg", desc: "Engineered with advanced cushioning systems to support you through every step of your daily journey." },
        { title: "QUALITY", img: "About Image/quality.jpg", desc: "Hand-selected materials and precision stitching ensure that your pair stands the test of time." },
        { title: "STYLE", img: "About Image/style.jpg", desc: "Modern silhouettes inspired by urban culture, designed to fit seamlessly into your wardrobe." }
    ];
    aboutContainer.innerHTML = aboutData.map(about => `
        <div class="about-card">
            <img src="${about.img}" alt="${about.title}">
            <div class="card-text">
                <h3>${about.title}</h3>
                <p>${about.desc}</p>
            </div>
        </div>
    `).join('');
}

// TEAM INFORMATION
const teamContainer = document.getElementById('team-card');
if (teamContainer) {
    const teamData = [
        { name: "Perez, Mark Jonel S.", role: "BACKEND DEVELOPER", img: "Team Image/Perez, M.jpeg" },
        { name: "Francia, Gad Daniel Kellyn C.", role: "FRONTEND DEVELOPER", img: "Team Image/Francia, G.jpg" },
        { name: "Crisostomo, Jomari", role: "FRONTEND DEVELOPER", img: "Team Image/jomari.png" },
        { name: "Javier, Mikel Kyan", role: "FRONTEND DEVELOPER", img: "Team Image/Javier, M.jfif" },
        { name: "Sumala, John Aldrin S.", role: "BACKEND DEVELOPER", img: "Team Image/Sumala, J.A.jpg" }
    ];
    teamContainer.innerHTML = teamData.map(member => `
        <div class="member-card">
            <img src="${member.img}" alt="${member.name}">
            <div class="member-info">
                <h1>${member.name}</h1>
                <p>${member.role}</p>
            </div>
        </div>
    `).join('');
}

// CONTACT FORM LOGIC
document.addEventListener('DOMContentLoaded', () => {
    const hpContactForm = document.getElementById('contact-form');

    if (hpContactForm) {
        hpContactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const subjectInput = document.getElementById('contact-subject').value;
            const message = document.getElementById('contact-message').value;

            const subject = encodeURIComponent(subjectInput);
            const body = encodeURIComponent(message);

            window.location.href = `mailto:pace@gmail.com?subject=${subject}&body=${body}`;

            setTimeout(() => { this.reset(); }, 1000);
        });
    }
});