const translations = {
    "HOME": "ANA SAYFA",
    "SELECTED WORKS": "SEÇİLMİŞ ÇALIŞMALAR",
    "CAPABILITIES": "YETENEKLER",
    "VIEW CV": "CV GÖRÜNTÜLE",
    "Computer Engineering Student & Developer": "Bilgisayar Mühendisliği Öğrencisi ve Geliştirici",
    "Hi, I'm a 4th-year Computer Engineering student and aspiring Software Developer with a strong focus on Data Analysis, AI, and Mobile Development. Experienced in building modern mobile applications, as well as developing AI-driven solutions with LLM integrations. Skilled in Python, Machine Learning, and SQL, with a proven ability to transform complex data into impactful software and data-driven solutions": "Merhaba, Veri Analizi, Yapay Zeka ve Mobil Geliştirme odaklı 4. sınıf Bilgisayar Mühendisliği öğrencisi ve Yazılım Geliştirici adayıyım. Modern mobil uygulamalar geliştirmenin yanı sıra LLM entegrasyonlarıyla yapay zeka odaklı çözümler üretme konusunda deneyimliyim. Python, Makine Öğrenmesi ve SQL konularında yetkinim, karmaşık verileri etkili yazılımlara ve veri odaklı çözümlere dönüştürebilirim.",
    "View CV": "CV Görüntüle",
    "View My Work": "Çalışmalarımı Gör",
    "Selected Works": "Seçilmiş Çalışmalar",
    "Hackathon 2nd Place Winner | AI-powered 3D Digital Twin platform for campus energy efficiency. Detecting energy anomalies with Isolation Forest and 3D visualizing them in real-time.": "Hackathon 2.'lik Ödülü | Kampüs enerji verimliliği için yapay zeka destekli 3D Dijital İkiz platformu. İzolasyon Ormanı (Isolation Forest) ile enerji anomalilerini tespit edip gerçek zamanlı 3D görselleştirme sunar.",
    "View Repository": "Projeyi İncele",
    "NLP-powered intelligent resume analysis and career strategy platform. Resumise analyzes CVs semantically using BERT and LLMs to provide real-time matching scores and AI-driven career advice.": "NLP destekli akıllı özgeçmiş analizi ve kariyer stratejisi platformu. Resumise, BERT ve LLM'leri kullanarak CV'leri anlamsal olarak analiz eder ve gerçek zamanlı eşleşme skorları ile yapay zeka destekli kariyer tavsiyeleri sunar.",
    "A modern film platform leveraging artificial intelligence to deliver personalized recommendations based on user mood, preferences, and context. Features include deep-dive AI-powered film analysis and interactive, engagement-focused cinematic tests.": "Kullanıcı ruh hali, tercihleri ve bağlamına göre kişiselleştirilmiş öneriler sunmak için yapay zekayı kullanan modern bir film platformu. Derinlemesine yapay zeka destekli film analizi ve etkileşim odaklı sinematik testler içerir.",
    "Go To Website": "Web Sitesine Git",
    "A smart mobile application designed to automatically scan and extract structured data from receipts. It leverages Machine Learning models for Optical Character Recognition (OCR) combined with Regex pattern matching to accurately parse prices, dates, and purchased items.": "Fişlerden yapılandırılmış verileri otomatik olarak taramak ve çıkarmak için tasarlanmış akıllı bir mobil uygulama. Fiyatları, tarihleri ve satın alınan ürünleri doğru bir şekilde ayrıştırmak için Regex desen eşleştirme ile birlikte Optik Karakter Tanıma (OCR) makine öğrenimi modellerini kullanır.",
    "A comprehensive Android application developed for task management and agenda organization. It features reliable notifications to help users efficiently track important events, daily chores, and long-term goals.": "Görev yönetimi ve ajanda organizasyonu için geliştirilmiş kapsamlı bir Android uygulaması. Kullanıcıların önemli etkinlikleri, günlük işleri ve uzun vadeli hedefleri etkili bir şekilde takip etmelerine yardımcı olacak güvenilir bildirimler sunar.",
    "Capabilities": "Yetenekler",
    "Languages": "Diller",
    "Python (Data & AI focus)": "Python (Veri ve AI Odaklı)",
    "Kotlin & Dart (Mobile focus)": "Kotlin ve Dart (Mobil Odaklı)",
    "JavaScript & PHP": "JavaScript ve PHP",
    "AI & Web Dev": "Yapay Zeka ve Web",
    "LLM & NLP Integration": "LLM ve NLP Entegrasyonu",
    "Data Analysis": "Veri Analizi",
    "React & Tailwind CSS": "React ve Tailwind CSS",
    "Machine Learning": "Makine Öğrenmesi",
    "Mobile & Backend": "Mobil ve Backend",
    "Flutter & Jetpack Compose": "Flutter ve Jetpack Compose",
    "MVVM & MVC Architecture": "MVVM ve MVC Mimarisi",
    "RESTful API Design": "RESTful API Tasarımı",
    "Room & SQL (T-SQL)": "Room ve SQL (T-SQL)",
    "Tools & Infrastructure": "Araçlar ve Altyapı",
    "Docker & Git": "Docker ve Git",
    "Team Collaboration": "Takım Çalışması",
    "MySQL & MSSQL": "MySQL ve MSSQL",
    "Agile Development": "Çevik (Agile) Geliştirme",
    "BACK TO HOME": "ANA SAYFAYA DÖN",
    "DOWNLOAD CV": "CV İNDİR",
    "Curriculum Vitae": "Özgeçmiş",
    "Download PDF": "PDF İndir",
    "SALIH KARAKUŞ": "SALIH KARAKUŞ",
    "MACHINE LEARNING": "MAKİNE ÖĞRENMESİ",
    "3D VISUALIZATION": "3D GÖRSELLEŞTİRME",
    "AI": "YAPAY ZEKA",
    "LLMS": "LLM'LER",
    "AI RECOMMENDATION ENGINES": "YAPAY ZEKA ÖNERİ SİSTEMLERİ",
    "COMPUTER VISION": "BİLGİSAYARLI GÖRÜ",
    "PUSH NOTIFICATIONS": "ANLIK BİLDİRİMLER"
};

let currentLang = sessionStorage.getItem('lang') || 'en';
const originalTexts = new Map();

function translateNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        let text = node.nodeValue;
        let trimmed = text.trim();
        
        if (trimmed && trimmed !== "© 2026 SALIH KARAKUS    v2.0" && trimmed !== "v2.0" && trimmed !== "LINKEDIN" && trimmed !== "GITHUB" && trimmed !== "SALIH KARAKUŞ") {
            if (!originalTexts.has(node)) {
                originalTexts.set(node, text);
            }
            
            let engText = originalTexts.get(node);
            let engTrimmed = engText.trim();
            let normalized = engTrimmed.replace(/\s+/g, ' ');
            
            if (currentLang === 'tr' && translations[normalized]) {
                node.nodeValue = engText.replace(engTrimmed, translations[normalized]);
            } else if (currentLang === 'en') {
                node.nodeValue = engText;
            }
        }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
            for (let child of node.childNodes) {
                translateNode(child);
            }
        }
    }
}

function applyTranslation() {
    translateNode(document.body);
    document.documentElement.lang = currentLang;
    
    document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
        btn.textContent = currentLang === 'en' ? 'TR' : 'EN';
    });
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'tr' : 'en';
    sessionStorage.setItem('lang', currentLang);
    applyTranslation();
}

document.addEventListener('DOMContentLoaded', () => {
    applyTranslation();
    
    document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
        btn.addEventListener('click', toggleLanguage);
    });
});
