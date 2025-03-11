let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');


// Scroll event'i için aktif link belirleme
window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute("id");

        if (top >= offset && top < offset + height) {
            navLinks.forEach(link => {
                link.classList.remove('active');
            });

            let activeLink = document.querySelector('header nav a[href*="' + id + '"]');
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
}

// Menü ikonu tıklanınca navbar aç/kapa
menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
}

let sendMessageBtn = document.querySelector('.contact .btn'); // Sadece "Send Message" butonunu seçiyoruz
let messageBox = document.querySelector('#messageBox'); // Mesaj kutusu

sendMessageBtn.onclick = (event) => {
    event.preventDefault(); // Formun sayfayı yenilemesini engelle

    messageBox.style.display = "block";
    messageBox.classList.add("show");

    // 3 saniye sonra mesajı gizle
    setTimeout(() => {
        messageBox.classList.remove("show");
        setTimeout(() => messageBox.style.display = "none", 500); // Animasyon bitince gizle
    }, 3000);
};
