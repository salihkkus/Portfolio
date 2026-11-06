/*
 * Yeşil piksel maskot. Ekranın altında dolaşır, zıplar, konuşur (TR/EN),
 * uyuklar, tıklanabilir ve sürüklenebilir. Komut paleti (Ctrl+K) açılınca
 * kutunun üstüne çıkar. Palette "Maskot: ..." komutları var: dans, renk,
 * sev, arkadaş. Sayfa bölümlerine tepki verir, saate göre selam
 * verir, boşta kalan fareyi bulur, bir süre sonra küçük bir arkadaşı gelir.
 * Telefonda sallanınca başı döner. Linklere ve hızlı kaydırmaya tepki verir,
 * tekrar gelenleri ve seçilen rengi hatırlar, isteğe bağlı 8-bit ses çıkarır.
 * Palete yazı yazılırken klavyeye basıyormuş gibi hareket eder.
 * "Hareketi azalt" tercihi açık olan kullanıcılar için yerinde durur.
 */
(function () {
    'use strict';

    var PX = 4;          // bir pikselin ekrandaki boyutu (px)
    var GROUND = 12;     // ekranın altından boşluk (px)
    var COLS = 14, ROWS = 11;
    var WIDTH = COLS * PX, HEIGHT = ROWS * PX;

    // Renk temaları; ilki varsayılan (site accent rengi). "renk" komutu sırayla değiştirir.
    var THEMES = [
        { B: '#10b981', S: '#047857', E: '#0e0e0e', L: '#34d399', T: '#065f46', glow: '16,185,129' },
        { B: '#38bdf8', S: '#0369a1', E: '#0e0e0e', L: '#7dd3fc', T: '#075985', glow: '56,189,248' },
        { B: '#f472b6', S: '#be185d', E: '#0e0e0e', L: '#f9a8d4', T: '#9d174d', glow: '244,114,182' },
        { B: '#facc15', S: '#a16207', E: '#0e0e0e', L: '#fde68a', T: '#854d0e', glow: '250,204,21' },
        { B: '#a78bfa', S: '#6d28d9', E: '#0e0e0e', L: '#c4b5fd', T: '#5b21b6', glow: '167,139,250' }
    ];
    var BUDDY_THEME = { B: '#84cc16', S: '#4d7c0f', E: '#0e0e0e', L: '#bef264', T: '#3f6212', glow: '132,204,22' };

    // 14x11 piksellik çizim; üstteki kısım her karede aynı, bacaklar değişir.
    var TOP = [
        '........LL....',
        '.......LLL....',
        '.......T......',
        '..BBBBBBBBBB..',
        '..BBBBBBBBBB..',
        '..BEBBBBBBEB..',
        'BBBEBBBBBBEBBB',
        '..BBBBBBBBBB..',
        '..SSSSSSSSSS..'
    ];
    var TOP_BLINK = TOP.slice();
    TOP_BLINK[5] = '..BBBBBBBBBB..';
    TOP_BLINK[6] = 'BBBSBBBBBBSBBB';
    var TOP_DANCE = TOP.slice(); // kollar havada
    TOP_DANCE[4] = 'B.BBBBBBBBBB.B';
    TOP_DANCE[5] = 'BBBEBBBBBBEBBB';
    TOP_DANCE[6] = '..BEBBBBBBEB..';

    var LEGS = {
        a: ['..S.S....S.S..', '..S.S....S.S..'],
        b: ['...S.S..S.S...', '...S.S..S.S...'],
        up: ['..S.S....S.S..', '..............']
    };

    function frameSvg(top, legs, colors, px) {
        var rows = top.concat(legs);
        var rects = '';
        for (var y = 0; y < rows.length; y++) {
            for (var x = 0; x < rows[y].length; x++) {
                var c = colors[rows[y][x]];
                if (c) rects += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + c + '"/>';
            }
        }
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + COLS + ' ' + ROWS +
            '" width="' + COLS * px + '" height="' + ROWS * px + '" shape-rendering="crispEdges">' + rects + '</svg>';
    }
    function buildFrames(colors, px) {
        return {
            walk1: frameSvg(TOP, LEGS.a, colors, px),
            walk2: frameSvg(TOP, LEGS.b, colors, px),
            blink: frameSvg(TOP_BLINK, LEGS.a, colors, px),
            jump: frameSvg(TOP, LEGS.up, colors, px),
            dance: frameSvg(TOP_DANCE, LEGS.up, colors, px)
        };
    }

    // ---- Konuşma metinleri; sayfanın diline (i18n.js -> <html lang>) göre seçilir.
    var LINES = {
        tr: {
            morning: ['Günaydın!', 'Günaydın, kahve içtin mi?'],
            day: ['Merhaba!', 'Hoş geldin!', 'Selam!'],
            evening: ['İyi akşamlar!', 'Akşam akşam hoş geldin!'],
            night: ['İyi geceler...', 'Bu saatte mi? Hoş geldin!'],
            random: ['Projelere göz attın mı?', 'Bana tıkla!', 'Ctrl+K\'ya bas!', 'Bugün hava çok piksel.', 'CV\'ye de bak!', 'Paletten "dans" yaz!'],
            nightRandom: ['Uykum geldi...', 'Esniyorum...'],
            drag: ['Uçuyorum!', 'Yavaaaş!', 'Wiii!'],
            land: ['Oh be!', 'Hop!', 'Sağ salim!'],
            terminal: ['Ne arıyoruz?', 'Bir komut yaz!', 'Ben de bakayım!'],
            wake: ['Uyandım!', 'Uyumuyordum!'],
            pet: ['Hihi!', 'Bir daha!', 'Gıdıklanıyorum!'],
            found: ['Buldum!', 'İşte buradasın!', 'Ce-eee!'],
            dance: ['Dans zamanı!', 'Müzik!'],
            color: ['Yeni renk!', 'Nasıl oldum?'],
            friend: ['Arkadaşım geldi!', 'Bak kim geldi!'],
            dizzy: ['Başım dönüyor!', 'Dur, sallama!'],
            about: ['Hoş geldin, ben buranın maskotuyum!'],
            work: ['Bunlar benim favorilerim!', 'Projelere bak!'],
            capabilities: ['Bunların hepsini biliyor!', 'Yetenekler!'],
            contact: ['Yazmayı unutma!', 'Bir merhaba de!'],
            github: ['GitHub\'ı kesin incele!', 'Kodlar orada!'],
            linkedin: ['Bağlantı kuralım mı?', 'LinkedIn\'e bak!'],
            cv: ['CV\'ye bak!', 'Oraya bak!'],
            link: ['Oraya bak!', 'Bu güzel bir proje!'],
            whoa: ['Ooo, yavaş!', 'Başım döndü!', 'Hızlı gidiyorsun!'],
            bottom: ['Sonuna geldin!', 'Buraya kadar okudun, helal!'],
            back: ['Yine geldin!', 'Seni özlemiştim!', 'Tekrar hoş geldin!'],
            soundOn: ['Ses açık!'],
            soundOff: ['Ses kapalı.']
        },
        en: {
            morning: ['Good morning!', 'Morning! Had your coffee?'],
            day: ['Hi!', 'Welcome!', 'Hello there!'],
            evening: ['Good evening!', 'Evening! Welcome!'],
            night: ['Good night...', 'At this hour? Welcome!'],
            random: ['Seen the projects?', 'Click me!', 'Try Ctrl+K!', 'Very pixel weather today.', 'Check out the CV!', 'Type "dance" in the palette!'],
            nightRandom: ['So sleepy...', '*yawn*'],
            drag: ['I\'m flying!', 'Easy now!', 'Wheee!'],
            land: ['Phew!', 'Hop!', 'Safe and sound!'],
            terminal: ['What are we looking for?', 'Type a command!', 'Let me see!'],
            wake: ['I\'m awake!', 'I wasn\'t sleeping!'],
            pet: ['Hehe!', 'Again!', 'That tickles!'],
            found: ['Found you!', 'There you are!', 'Peekaboo!'],
            dance: ['Dance time!', 'Music!'],
            color: ['New color!', 'How do I look?'],
            friend: ['My friend is here!', 'Look who came!'],
            dizzy: ['I\'m dizzy!', 'Stop shaking!'],
            about: ['Hi, I\'m the mascot here!'],
            work: ['These are my favorites!', 'Check the projects!'],
            capabilities: ['So many skills!', 'Skills!'],
            contact: ['Don\'t forget to say hi!', 'Drop a message!'],
            github: ['Check out the GitHub!', 'The code is there!'],
            linkedin: ['Let\'s connect!', 'Look at LinkedIn!'],
            cv: ['Check the CV!', 'Look there!'],
            link: ['Look there!', 'That\'s a cool project!'],
            whoa: ['Whoa, slow down!', 'I\'m dizzy!', 'You\'re fast!'],
            bottom: ['You made it to the end!', 'You read it all, nice!'],
            back: ['You\'re back!', 'I missed you!', 'Welcome back!'],
            soundOn: ['Sound on!'],
            soundOff: ['Sound off.']
        }
    };
    function line(kind) {
        var lang = (document.documentElement.lang || 'en').slice(0, 2);
        var list = (LINES[lang] || LINES.en)[kind];
        return list[Math.floor(Math.random() * list.length)];
    }
    function timeOfDay() {
        var h = new Date().getHours();
        if (h >= 5 && h < 11) return 'morning';
        if (h >= 11 && h < 18) return 'day';
        if (h >= 18 && h < 23) return 'evening';
        return 'night';
    }

    var Z = { base: 40, top: 71 }; // komut paleti açıkken (z-70) onun üstüne çıkar
    var zNow = Z.base;

    // Yükselip kaybolan küçük yazı/emoji (kalp, zzz, nota vb.)
    function pop(text, x, y, color, rise) {
        var p = document.createElement('span');
        p.textContent = text;
        p.setAttribute('aria-hidden', 'true');
        p.style.cssText = 'position:fixed;left:' + x + 'px;top:' + y + 'px;z-index:' + (zNow + 1) + ';' +
            'pointer-events:none;font:bold 14px monospace;color:' + color + ';' +
            'text-shadow:0 0 6px rgba(16,185,129,.6)';
        document.body.appendChild(p);
        var dx = (Math.random() - 0.5) * 20;
        var anim = p.animate([
            { transform: 'translate(0,0) scale(.8)', opacity: 1 },
            { transform: 'translate(' + dx + 'px,-' + (rise || 40) + 'px) scale(1.1)', opacity: 0 }
        ], { duration: 1100, easing: 'ease-out' });
        anim.onfinish = function () { p.remove(); };
    }

    // ---- Hafıza: bu tarayıcıda kaç kez gelindi, seçilen renk, ses tercihi (localStorage)
    var store = (function () {
        var KEY = 'pixelMascot', data = {};
        try { data = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { data = {}; }
        return {
            get: function (k) { return data[k]; },
            set: function (k, v) {
                data[k] = v;
                try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* gizli sekme vb. */ }
            }
        };
    })();

    // ---- 8-bit sesler (Web Audio). Varsayılan kapalı; palette "Maskot: sesi aç/kapat".
    var sound = (function () {
        var ctx = null, on = store.get('sound') === true;
        function tone(f1, f2, ms, type, delay) {
            if (!on) return;
            try {
                if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
                if (ctx.state === 'suspended') ctx.resume();
                var t = ctx.currentTime + (delay || 0) / 1000, d = ms / 1000;
                var o = ctx.createOscillator(), g = ctx.createGain();
                o.type = type || 'square';
                o.frequency.setValueAtTime(f1, t);
                if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
                g.gain.setValueAtTime(0.05, t);
                g.gain.exponentialRampToValueAtTime(0.0001, t + d);
                o.connect(g);
                g.connect(ctx.destination);
                o.start(t);
                o.stop(t + d + 0.02);
            } catch (e) { /* ses desteklenmiyor */ }
        }
        var NOTES = [523, 587, 659, 784, 880];
        return {
            toggle: function () { on = !on; store.set('sound', on); return on; },
            jump: function () { tone(320, 640, 120); },
            bigJump: function () { tone(260, 1040, 260); },
            land: function () { tone(180, 80, 100, 'triangle'); },
            blip: function () { tone(880, 1320, 70); tone(1320, 1760, 70, 'square', 80); },
            note: function () { tone(NOTES[Math.floor(Math.random() * NOTES.length)], 0, 150); },
            dizzy: function () { tone(700, 200, 400, 'sawtooth'); },
            key: function () { tone(1400 + Math.random() * 400, 0, 25); },
            color: function () { tone(523, 0, 80); tone(659, 0, 80, 'square', 90); tone(784, 0, 120, 'square', 180); }
        };
    })();

    function makeSprite(z) {
        var el = document.createElement('div');
        el.setAttribute('aria-hidden', 'true');
        el.style.cssText = [
            'position:fixed', 'left:0', 'bottom:' + GROUND + 'px', 'z-index:' + z,
            'user-select:none', 'touch-action:none', 'will-change:transform',
            '-webkit-tap-highlight-color:transparent'
        ].join(';');
        var inner = document.createElement('div');
        el.appendChild(inner);
        document.body.appendChild(el);
        var current = '', frames = null;
        return {
            el: el,
            setFrames: function (f, glow) {
                frames = f; current = '';
                el.style.filter = 'drop-shadow(0 0 6px rgba(' + glow + ',.35))';
            },
            show: function (name) {
                if (name !== current) { inner.innerHTML = frames[name]; current = name; }
            }
        };
    }

    function start() {
        var savedTheme = store.get('theme');
        var themeIndex = (typeof savedTheme === 'number' && THEMES[savedTheme]) ? savedTheme : 0;
        var visits = store.get('visits') || 0;
        store.set('visits', visits + 1);
        var sprite = makeSprite(Z.base);
        var el = sprite.el;
        el.id = 'pixel-mascot';
        el.style.cursor = 'grab';
        function applyTheme() {
            var t = THEMES[themeIndex];
            sprite.setFrames(buildFrames(t, PX), t.glow);
            bubble.style.borderColor = t.B;
            tail.style.borderColor = t.B;
        }

        // ---- Konuşma balonu
        var bubble = document.createElement('div');
        bubble.setAttribute('aria-hidden', 'true');
        bubble.style.cssText = 'position:fixed;left:0;top:0;z-index:' + (Z.base + 1) + ';pointer-events:none;' +
            'font:12px/1.3 ui-monospace,monospace;color:#d1fae5;background:#0e0e0e;border:2px solid #10b981;' +
            'padding:4px 8px;white-space:nowrap;opacity:0;transition:opacity .2s;box-shadow:3px 3px 0 rgba(0,0,0,.5)';
        var bubbleText = document.createElement('span');
        var tail = document.createElement('span');
        tail.style.cssText = 'position:absolute;left:50%;bottom:-6px;width:8px;height:8px;margin-left:-4px;' +
            'background:#0e0e0e;border-right:2px solid #10b981;border-bottom:2px solid #10b981;transform:rotate(45deg)';
        bubble.appendChild(bubbleText);
        bubble.appendChild(tail);
        document.body.appendChild(bubble);
        var bubbleUntil = 0;
        applyTheme();

        function say(text, ms) {
            bubbleText.textContent = text;
            bubble.style.opacity = '1';
            bubbleUntil = performance.now() + (ms || 2200);
            placeBubble();
        }
        function placeBubble() {
            var r = el.getBoundingClientRect();
            var bw = bubble.offsetWidth, bh = bubble.offsetHeight;
            var left = Math.max(4, Math.min(window.innerWidth - bw - 4, r.left + r.width / 2 - bw / 2));
            var top = Math.max(4, r.top - bh - 10);
            bubble.style.transform = 'translate(' + Math.round(left) + 'px,' + Math.round(top) + 'px)';
            tail.style.left = Math.max(10, Math.min(bw - 10, r.left + r.width / 2 - left)) + 'px';
        }
        function headPos() {
            var r = el.getBoundingClientRect();
            return { x: r.left + r.width / 2 - 6, y: r.top - 6 };
        }
        function setZ(z) {
            zNow = z;
            el.style.zIndex = z;
            bubble.style.zIndex = z + 1;
            if (buddy) buddy.sprite.el.style.zIndex = z - 1;
        }
        function hearts(n, rise) {
            var h = headPos();
            for (var i = 0; i < n; i++) pop('♥', h.x + (i - (n - 1) / 2) * 8, h.y, THEMES[themeIndex].L, rise);
        }

        var night = timeOfDay() === 'night';
        var greeted = false;
        setTimeout(function () { greeted = true; say(line(visits > 0 ? 'back' : timeOfDay())); }, 1500);

        // ---- Bölümlere tepki: bir bölüm ekranın ortasına gelince bir şey söyler
        var lastSectionTalk = 0, seenSections = {};
        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    var id = en.target.id;
                    var now = performance.now();
                    if (!en.isIntersecting || seenSections[id] || !greeted || now - lastSectionTalk < 4000) return;
                    if (now < bubbleUntil) return;
                    seenSections[id] = true;
                    lastSectionTalk = now;
                    say(line(id), 2800);
                });
            }, { rootMargin: '-40% 0px -40% 0px' });
            ['about', 'work', 'capabilities', 'contact'].forEach(function (id) {
                var s = document.getElementById(id);
                if (s) io.observe(s);
            });
        }

        // ---- Komut paleti (terminal-ui.js) ve gizli komutlar
        var paletteInput = document.getElementById('palette-input');
        var paletteOverlay = paletteInput && paletteInput.closest('.fixed');
        var paletteBox = paletteInput && paletteInput.closest('[role="dialog"]');
        function paletteOpen() {
            return !!paletteOverlay && !paletteOverlay.classList.contains('hidden');
        }
        // Komut paletindeki "Maskot: ..." satırları bunları çağırır (terminal-ui.js)
        window.pixelMascot = {
            dance: function () { setTimeout(function () { secret('dance'); }, 650); },
            color: function () { setTimeout(function () { secret('color'); }, 650); },
            pet: function () { setTimeout(function () { secret('pet'); }, 650); },
            friend: function () { setTimeout(function () { secret('friend'); }, 650); },
            // Ses açma tıklamanın içinde olmalı (tarayıcılar sesi ancak kullanıcı etkileşimiyle başlatır)
            sound: function () {
                var on = sound.toggle();
                if (on) sound.blip();
                setTimeout(function () { say(line(on ? 'soundOn' : 'soundOff')); }, 650);
            }
        };

        // ---- Telefon sallama (DeviceMotion). Bazı tarayıcılar (iOS) izni ancak bir dokunuştan
        // sonra verir: önce sessizce denenir, olmazsa maskota ilk dokunuşta tekrar sorulur.
        var onShake = function () {};
        var listening = false;
        function askMotion() {
            var DME = window.DeviceMotionEvent;
            if (listening || !DME) return;
            if (typeof DME.requestPermission !== 'function') { listenMotion(); return; }
            try {
                DME.requestPermission().then(function (s) { if (s === 'granted') listenMotion(); }).catch(function () {});
            } catch (err) { /* izin yok */ }
        }
        function listenMotion() {
            if (listening) return;
            listening = true;
            var lastShake = -Infinity;
            window.addEventListener('devicemotion', function (e) {
                var a = e.acceleration || e.accelerationIncludingGravity;
                if (!a) return;
                var g = e.acceleration ? 0 : 9.8;
                var m = Math.sqrt((a.x || 0) * (a.x || 0) + (a.y || 0) * (a.y || 0) + (a.z || 0) * (a.z || 0)) - g;
                var now = performance.now();
                if (m > 18 && now - lastShake > 3000) { lastShake = now; onShake(now); }
            });
        }
        askMotion();

        var buddy = null;
        var secret, summonBuddy;

        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
        if (reduce && reduce.matches) {
            // Hareket yok: sağ altta durur, tıklanınca kalp çıkarıp konuşur.
            sprite.show('walk1');
            el.style.left = 'auto';
            el.style.right = '16px';
            el.style.cursor = 'pointer';
            el.addEventListener('click', function () { hearts(1); say(line('pet')); });
            secret = function (cmd) {
                if (cmd === 'color') { themeIndex = (themeIndex + 1) % THEMES.length; store.set('theme', themeIndex); applyTheme(); sprite.show('walk1'); }
                if (cmd === 'pet') hearts(5, 60);
                say(line(cmd === 'friend' ? 'pet' : cmd));
            };
            if (paletteOverlay) {
                new MutationObserver(function () {
                    setZ(paletteOpen() ? Z.top : Z.base);
                    if (paletteOpen()) say(line('terminal'));
                }).observe(paletteOverlay, { attributes: true, attributeFilter: ['class'] });
            }
            (function hideLoop() {
                if (performance.now() > bubbleUntil) bubble.style.opacity = '0';
                setTimeout(hideLoop, 300);
            })();
            return;
        }

        var x = Math.random() * Math.max(0, window.innerWidth - WIDTH);
        var y = 0;   // yerden yükseklik (px); 0 = ekranın altı
        var vy = 0;  // düşerken dikey hız
        var dir = Math.random() < 0.5 ? -1 : 1;
        var speed = 40; // px/saniye
        var state = 'walk', stateUntil = 0, stateStart = 0, nextZ = 0, nextChat = 0, nextNote = 0;
        var jump = null; // { t0, ms, fromY, toY, h }
        var clicks = [];
        var mouse = null, mouseMovedAt = performance.now(), chasedFor = -1;
        var drag = null;
        var suppressClick = false;
        var last = performance.now();
        var bornAt = last;

        function setState(s, ms, now) { state = s; stateStart = now; stateUntil = now + ms; }
        function nextWalk(now) { setState('walk', 3000 + Math.random() * 6000, now); }
        function startJump(now, height, ms, toY) {
            setState('jump', ms, now);
            jump = { t0: now, ms: ms, fromY: y, toY: toY == null ? y : toY, h: height };
        }
        function busy() {
            return state === 'drag' || state === 'fall' || state === 'dance' || state === 'dizzy' || state === 'wobble' ||
                state === 'terminal' || state === 'toTerminal';
        }
        nextWalk(last);
        nextChat = last + 20000 + Math.random() * 20000;

        // Palet açıkken maskotun oturacağı yer: kutunun üst kenarı, sağa yakın
        function perch() {
            var r = paletteBox.getBoundingClientRect();
            return {
                x: Math.max(0, Math.min(window.innerWidth - WIDTH, r.right - WIDTH - 24)),
                y: window.innerHeight - GROUND - r.top - 2,
                cx: r.left + r.width / 2
            };
        }

        // ---- Maskot komutları (palet kapanınca önce yere iner, sonra yapar)
        secret = function (cmd) {
            var now = performance.now();
            if (cmd === 'dance') {
                if (y > 0) y = 0;
                setState('dance', 3200, now);
                say(line('dance'), 2500);
            } else if (cmd === 'color') {
                themeIndex = (themeIndex + 1) % THEMES.length;
                store.set('theme', themeIndex);
                applyTheme();
                startJump(now, 30, 600);
                sound.color();
                say(line('color'));
            } else if (cmd === 'pet') {
                startJump(now, 30, 600);
                sound.blip();
                hearts(5, 60);
                say(line('pet'));
            } else if (cmd === 'friend') {
                summonBuddy();
            }
        };

        // ---- Sallanınca başı döner
        onShake = function (now) {
            if (state === 'drag') return;
            if (y > 0 && state !== 'terminal') { state = 'fall'; vy = 0; }
            else setState('dizzy', 2500, now);
            say(line('dizzy'));
            sound.dizzy();
        };

        // ---- Tıklama: zıplar ve kalp çıkarır; hızlı 4 tık = çok yüksek zıplama
        el.addEventListener('click', function () {
            askMotion();
            if (suppressClick) { suppressClick = false; return; }
            if (state === 'fall' || state === 'drag' || state === 'dance') return;
            var now = performance.now();
            clicks = clicks.filter(function (t) { return now - t < 1200; });
            clicks.push(now);
            var h = headPos();
            if (state === 'sleep') {
                pop('!', h.x + 4, h.y, '#fbbf24', 30);
                say(line('wake'));
            }
            var wasTerminal = state === 'terminal' || (state === 'jump' && paletteOpen());
            if (clicks.length >= 4) {
                clicks = [];
                startJump(now, 60, 900);
                sound.bigJump();
                hearts(5, 60);
                say(line('pet'));
            } else {
                startJump(now, 26, 550);
                hearts(1);
                sound.jump();
            }
            jump.keepTerminal = wasTerminal;
            if (buddy) buddy.hop(now);
        });

        // ---- Sürükle bırak (fare ve dokunmatik)
        el.addEventListener('pointerdown', function (e) {
            if (e.button !== 0) return;
            var r = el.getBoundingClientRect();
            drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, moved: false, sx: e.clientX, sy: e.clientY };
            el.setPointerCapture(e.pointerId);
        });
        el.addEventListener('pointermove', function (e) {
            if (!drag) return;
            if (!drag.moved && Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) < 6) return;
            if (!drag.moved) {
                drag.moved = true;
                state = 'drag';
                el.style.cursor = 'grabbing';
                say(line('drag'), 100000);
            }
            x = Math.max(0, Math.min(window.innerWidth - WIDTH, e.clientX - drag.dx));
            y = Math.max(0, window.innerHeight - GROUND - (e.clientY - drag.dy) - HEIGHT);
        });
        function endDrag() {
            if (!drag) return;
            if (drag.moved) {
                suppressClick = true;
                setTimeout(function () { suppressClick = false; }, 0);
                state = 'fall';
                vy = 0;
                bubbleUntil = 0;
            }
            drag = null;
            el.style.cursor = 'grab';
        }
        el.addEventListener('pointerup', endDrag);
        el.addEventListener('pointercancel', endDrag);

        // ---- Fare: yaklaşınca bakar, uzun süre kıpırdamazsa altına koşup "buldum" der
        window.addEventListener('mousemove', function (e) {
            mouse = { x: e.clientX, y: e.clientY };
            mouseMovedAt = performance.now();
        }, { passive: true });
        document.addEventListener('mouseleave', function () { mouse = null; });
        function mouseNear() {
            if (!mouse) return false;
            var cx = x + WIDTH / 2, cy = window.innerHeight - GROUND - y - HEIGHT / 2;
            var dx = mouse.x - cx, dy = mouse.y - cy;
            return dx * dx + dy * dy < 150 * 150;
        }

        // ---- Linklere tepki: fare GitHub / LinkedIn / CV / proje linkine gelince oraya döner, konuşur
        var lastLinkTalk = -Infinity, lastLinkEl = null;
        document.addEventListener('mouseover', function (e) {
            var a = e.target.closest && e.target.closest('a[href]');
            if (!a || a === lastLinkEl) return;
            var now = performance.now();
            if (now - lastLinkTalk < 3000) return;
            if (busy() || state === 'sleep' || state === 'jump' || state === 'chase' || state === 'wobble') return;
            var href = a.getAttribute('href') || '';
            var kind = /github\.com/.test(href) ? 'github' : /linkedin\.com/.test(href) ? 'linkedin' :
                /cv\.html/.test(href) ? 'cv' : a.target === '_blank' ? 'link' : null;
            if (!kind) return;
            lastLinkEl = a;
            lastLinkTalk = now;
            var r = a.getBoundingClientRect();
            dir = (r.left + r.width / 2) < (x + WIDTH / 2) ? -1 : 1;
            setState('look', 1800, now);
            say(line(kind));
        });
        document.addEventListener('mouseout', function (e) {
            if (lastLinkEl && !lastLinkEl.contains(e.relatedTarget)) lastLinkEl = null;
        });

        // ---- Palete yazı yazılırken kutunun üstünde tuşlara basıyormuş gibi hareket eder
        var typingUntil = 0;
        if (paletteInput) {
            paletteInput.addEventListener('input', function (e) {
                var now = performance.now();
                typingUntil = now + 350;
                if (state !== 'terminal') return;
                var ch = e.data ? e.data.slice(-1) : '';
                if (ch && ch.trim()) {
                    var h = headPos();
                    pop(ch, h.x + dir * 14, h.y + 10, THEMES[themeIndex].L, 25);
                }
                sound.key();
            });
        }

        // ---- Kaydırma tepkisi: hızlı kaydırınca sendeler, en alta inince konuşur
        var lastScrollY = window.scrollY, lastScrollT = performance.now();
        var wobbleTalk = -Infinity, saidBottom = false, scrollLean = 1;
        window.addEventListener('scroll', function () {
            var now = performance.now(), sy = window.scrollY;
            var v = (sy - lastScrollY) / Math.max(1, now - lastScrollT); // px/ms
            lastScrollY = sy;
            lastScrollT = now;
            if (Math.abs(v) > 2.5 && y === 0 && (state === 'walk' || state === 'idle' || state === 'look' || state === 'wobble')) {
                scrollLean = v > 0 ? -1 : 1;
                setState('wobble', 900, now);
                if (now - wobbleTalk > 8000) { wobbleTalk = now; say(line('whoa')); }
            }
            var docH = document.documentElement.scrollHeight;
            if (sy + window.innerHeight >= docH - 4) {
                if (!saidBottom && greeted) { saidBottom = true; say(line('bottom'), 2800); }
            } else if (sy + window.innerHeight < docH - 400) {
                saidBottom = false;
            }
        }, { passive: true });

        // ---- Komut paleti açılınca yanına gidip üstüne tüner; kapanınca geri iner
        if (paletteOverlay) {
            new MutationObserver(function () {
                var now = performance.now();
                if (paletteOpen()) {
                    setZ(Z.top);
                    if (state !== 'drag') setState('toTerminal', 15000, now);
                } else {
                    setZ(Z.base);
                    if (state === 'terminal' || state === 'toTerminal') {
                        if (y > 0) startJump(now, 12, 600, 0); else nextWalk(now);
                    }
                }
            }).observe(paletteOverlay, { attributes: true, attributeFilter: ['class'] });
        }

        // ---- Küçük arkadaş: sayfada 45 sn kalınca (ya da "arkadas" komutuyla) gelir, peşinden yürür
        summonBuddy = function () {
            if (buddy) { buddy.hop(performance.now()); say(line('friend')); return; }
            var bs = makeSprite(zNow - 1);
            bs.setFrames(buildFrames(BUDDY_THEME, 2), BUDDY_THEME.glow);
            bs.el.style.pointerEvents = 'none';
            var bw = COLS * 2;
            var b = {
                sprite: bs,
                x: dir > 0 ? -bw : window.innerWidth, dir: dir, hopT: 0,
                hop: function (now) { b.hopT = now; }
            };
            buddy = b;
            say(line('friend'), 2600);
        };
        function tickBuddy(now, dt) {
            var b = buddy;
            var bw = COLS * 2;
            var target = x + (dir > 0 ? -bw - 10 : WIDTH + 10); // arkasında yürür
            if (y > 40 && state === 'terminal') target = Math.min(window.innerWidth - bw, x + WIDTH + 10);
            var d = target - b.x;
            var moving = Math.abs(d) > 3;
            if (moving) {
                b.dir = d < 0 ? -1 : 1;
                b.x += b.dir * Math.min(Math.abs(d), (Math.abs(d) > 120 ? 140 : 50) * dt);
            } else {
                b.dir = (x + WIDTH / 2) < b.x ? -1 : 1; // durunca büyüğe bakar
            }
            var lift = 0;
            if (now - b.hopT < 400) lift = Math.sin(Math.PI * (now - b.hopT) / 400) * 14;
            if (state === 'dance') lift = Math.abs(Math.sin(now / 160)) * 6;
            b.sprite.show(lift > 0 ? 'jump' : moving ? (Math.floor(now / 140) % 2 ? 'walk2' : 'walk1') :
                (state === 'sleep' ? 'blink' : 'walk1'));
            b.sprite.el.style.transform = 'translate(' + Math.round(b.x) + 'px,' + -Math.round(lift) + 'px) scaleX(' + b.dir + ')';
        }

        // ---- Ana döngü
        function tick(now) {
            var dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            var maxX = Math.max(0, window.innerWidth - WIDTH);
            var lift = 0, tilt = 0;
            var open = paletteOpen();

            if (!buddy && now - bornAt > 45000) summonBuddy();

            if ((state === 'walk' || state === 'idle' || state === 'look') && mouseNear() && !open) {
                state = 'look';
                dir = mouse.x < x + WIDTH / 2 ? -1 : 1;
                stateUntil = now + 800;
            }

            // Fare 5 sn kıpırdamazsa altına koşar
            if (mouse && !busy() && state !== 'chase' && state !== 'jump' && state !== 'sleep' && chasedFor !== mouseMovedAt &&
                now - mouseMovedAt > 5000 && Math.abs(mouse.x - (x + WIDTH / 2)) > 60) {
                chasedFor = mouseMovedAt;
                setState('chase', 8000, now);
            }

            if (state === 'toTerminal' || state === 'chase') {
                var tx = state === 'chase' ? Math.max(0, Math.min(maxX, mouse ? mouse.x - WIDTH / 2 : x)) : perch().x;
                var d = tx - x;
                dir = d < 0 ? -1 : 1;
                if (Math.abs(d) < 4 || now > stateUntil) {
                    if (state === 'toTerminal') {
                        startJump(now, 30, 700, perch().y);
                        jump.toTerminal = true;
                    } else {
                        say(line('found'));
                        startJump(now, 20, 500);
                        jump.noMove = true;
                    }
                } else {
                    x += dir * Math.min(Math.abs(d), speed * 4 * dt); // koşarak gider
                }
            } else if (now > stateUntil && (state === 'walk' || state === 'idle' || state === 'look' || state === 'sleep')) {
                if (state === 'walk') {
                    var r = Math.random();
                    var sleepChance = night ? 0.3 : 0.1; // gece daha sık uyur
                    if (r < 0.2) startJump(now, 18, 500);
                    else if (r < 0.45) setState('idle', 1500 + Math.random() * 2500, now);
                    else if (r < 0.45 + sleepChance) { setState('sleep', 6000 + Math.random() * 6000, now); nextZ = now; }
                    else { dir = -dir; nextWalk(now); }
                } else {
                    if (state === 'idle' && Math.random() < 0.4) dir = -dir;
                    nextWalk(now);
                }
            } else if ((state === 'dance' || state === 'dizzy' || state === 'wobble') && now > stateUntil) {
                if (open) setState('toTerminal', 15000, now); else nextWalk(now);
            }

            if (state === 'jump') {
                var t = Math.min(1, (now - jump.t0) / jump.ms);
                y = jump.fromY + (jump.toY - jump.fromY) * t;
                lift = Math.sin(Math.PI * t) * jump.h;
                if (!jump.toTerminal && !jump.keepTerminal && !jump.noMove) x += dir * speed * dt;
                if (t >= 1) {
                    y = jump.toY;
                    if (jump.toTerminal || (jump.keepTerminal && open)) {
                        state = 'terminal';
                        if (jump.toTerminal) say(line('terminal'), 3000);
                    } else if (y > 0) {
                        state = 'fall'; vy = 0;
                    } else if (open) {
                        setState('toTerminal', 15000, now);
                    } else if (jump.noMove) {
                        setState('idle', 2500, now);
                    } else {
                        nextWalk(now);
                    }
                }
            } else if (state === 'fall') {
                vy += 1400 * dt;
                y -= vy * dt;
                var floor = 0;
                if (open) {
                    var pp = perch(), br = paletteBox.getBoundingClientRect();
                    if (x + WIDTH > br.left && x < br.right && y + vy * dt >= pp.y - 2 && y <= pp.y) floor = pp.y;
                }
                if (y <= floor) {
                    y = floor;
                    say(line('land'));
                    sound.land();
                    if (floor > 0) state = 'terminal';
                    else if (open) setState('toTerminal', 15000, now);
                    else startJump(now, 8, 250, 0);
                }
            } else if (state === 'walk') {
                x += dir * speed * dt;
            } else if (state === 'dance') {
                // sağa sola dönerek zıplar, nota saçar
                dir = Math.floor((now - stateStart) / 320) % 2 ? -1 : 1;
                lift = Math.abs(Math.sin((now - stateStart) / 160)) * 14;
                if (now >= nextNote) {
                    var hn = headPos();
                    pop(Math.random() < 0.5 ? '♪' : '♫', hn.x + (Math.random() - 0.5) * 30, hn.y, '#fde68a', 50);
                    nextNote = now + 280;
                    sound.note();
                }
            } else if (state === 'wobble') {
                var wp = Math.min(1, (now - stateStart) / 900);
                tilt = scrollLean * 12 * (1 - wp) + Math.sin((now - stateStart) / 50) * 8 * (1 - wp);
            } else if (state === 'dizzy') {
                tilt = Math.sin((now - stateStart) / 70) * 14;
                if (now >= nextNote) {
                    var hd = headPos();
                    pop('✦', hd.x + (Math.random() - 0.5) * 30, hd.y + 8, '#fbbf24', 20);
                    nextNote = now + 200;
                }
            }

            if (state === 'walk' || state === 'jump') {
                if (x <= 0) { x = 0; dir = 1; }
                if (x >= maxX) { x = maxX; dir = -1; }
            }
            if (x > maxX) x = maxX;

            var typing = state === 'terminal' && now < typingUntil;
            if (typing) lift = Math.floor(now / 70) % 2 ? 3 : 0; // tık tık

            if (state === 'terminal') {
                var pt = perch();
                y = pt.y; // pencere boyutu değişirse kutuyla birlikte kalsın
                if (x < paletteBox.getBoundingClientRect().left) x = pt.x;
                dir = pt.cx < x + WIDTH / 2 ? -1 : 1; // kutunun ortasına bakar
            }

            // Ara sıra kendiliğinden konuşur (gece uykulu cümleler)
            if (state === 'walk' && now > nextChat && now > bubbleUntil) {
                say(line(night && Math.random() < 0.5 ? 'nightRandom' : 'random'), 2600);
                nextChat = now + 25000 + Math.random() * 25000;
            }

            if (typing) {
                sprite.show(Math.floor(now / 70) % 2 ? 'dance' : 'walk1'); // kollar inip kalkar
            } else if (state === 'walk' || state === 'toTerminal' || state === 'chase') {
                sprite.show(Math.floor(now / (state === 'walk' ? 180 : 90)) % 2 ? 'walk2' : 'walk1');
            } else if (state === 'jump' || state === 'fall' || state === 'drag' || state === 'wobble') {
                sprite.show('jump');
            } else if (state === 'dance') {
                sprite.show(Math.floor((now - stateStart) / 160) % 2 ? 'dance' : 'jump');
            } else if (state === 'sleep' || state === 'dizzy') {
                sprite.show('blink');
                if (state === 'sleep' && now >= nextZ) {
                    var h = headPos();
                    pop(Math.random() < 0.5 ? 'z' : 'Z', h.x + dir * 10, h.y, '#a7f3d0', 30);
                    nextZ = now + 900;
                }
            } else {
                sprite.show(now % 2600 < 160 ? 'blink' : 'walk1'); // arada bir göz kırpar
            }

            el.style.transform = 'translate(' + Math.round(x) + 'px,' + -Math.round(y + lift) + 'px) scaleX(' + dir + ')' +
                (tilt ? ' rotate(' + tilt.toFixed(1) + 'deg)' : '');

            if (buddy) tickBuddy(now, dt);

            if (now < bubbleUntil) placeBubble();
            else bubble.style.opacity = '0';

            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
