const translations = {
    "HOME": "ANA SAYFA",
    "SELECTED WORKS": "SEÇİLMİŞ ÇALIŞMALAR",
    "CAPABILITIES": "YETENEKLER",
    "VIEW CV": "CV GÖRÜNTÜLE",
    "Software Engineer": "Yazılım Mühendisi",
    "Hi, I'm a Computer Engineering graduate with hands-on experience across all software layers, including backend APIs, cloud/ERP integrations, and cross-platform mobile development. Deeply interested in AI, I actively contribute to on-premise LLM work and have experience in computer vision projects. I aim to deepen my career as an engineer who integrates AI into end-to-end systems — mobile, backend, on-premise LLM, and Computer Vision.": "Merhaba, backend API'ler, bulut/ERP entegrasyonları ve çapraz platform mobil geliştirme dahil olmak üzere tüm yazılım katmanlarında uygulamalı deneyime sahip Bilgisayar Mühendisliği mezunuyum. Yapay zekaya güçlü ilgi duyuyorum; şirket içi on-premise LLM çalışmalarına aktif katkı veriyorum ve görüntü işleme projelerinde deneyim kazandım. Yapay zekayı uçtan uca sistemlere — mobil, backend, on-premise LLM ve Computer Vision — entegre eden bir mühendis olarak kariyerimi bu alanda derinleştirmeyi hedefliyorum.",
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
    "AI & Data": "Yapay Zeka ve Veri",
    "On-Premise LLM Integration": "On-Premise LLM Entegrasyonu",
    "LLMs, BERT & NLP": "LLM'ler, BERT ve NLP",
    "Edge AI, Gemini API & ML Kit": "Edge AI, Gemini API ve ML Kit",
    "Mobile": "Mobil Geliştirme",
    "Flutter & Dart": "Flutter ve Dart",
    "Kotlin & Jetpack Compose": "Kotlin ve Jetpack Compose",
    "Riverpod, MVVM & Clean Architecture": "Riverpod, MVVM ve Clean Architecture",
    "Room, Hilt & Coroutines": "Room, Hilt ve Coroutines",
    "Backend & Cloud": "Backend ve Bulut",
    "Firebase & Supabase": "Firebase ve Supabase",
    "MySQL, MSSQL & SQLite": "MySQL, MSSQL ve SQLite",
    "Testing & Tools": "Test ve Araçlar",
    "Unit, Widget & Integration Testing": "Unit, Widget ve Integration Test",
    "CI/CD & GitHub Actions": "CI/CD ve GitHub Actions",
    "Git & Docker": "Git ve Docker",
    "Postman & Agile/Scrum": "Postman ve Agile/Scrum",
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

const CV_FILES = {
    en: 'Salih_Karakus_CV_EN.pdf',
    tr: 'Salih_Karakus_CV.pdf'
};

function updateCvLinks() {
    const file = CV_FILES[currentLang];
    const preview = file + '#view=FitH';
    document.querySelectorAll('[data-cv-href]').forEach(el => {
        el.setAttribute('href', file);
    });
    document.querySelectorAll('[data-cv-src]').forEach(el => {
        if (el.getAttribute('src') === preview) return;
        el.setAttribute('src', preview);
    });
}

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
    updateCvLinks();
    
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
