// Terminal-style UI: scroll progress bar and a Ctrl+K / ⌘K command palette.
(() => {
    // ---- Scroll progress bar: a thin accent line across the top that fills as you scroll.
    const bar = document.createElement('div');
    bar.setAttribute('aria-hidden', 'true');
    bar.className = 'fixed top-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-accent z-[60] pointer-events-none';
    document.body.appendChild(bar);

    let ticking = false;
    const updateProgress = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
        bar.style.transform = `scaleX(${ratio})`;
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
    }, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();

    // ---- Command palette
    const COMMANDS = [
        { label: 'Ana sayfa', hint: '#about', run: () => go('#about') },
        { label: 'Projeler', hint: '#work', run: () => go('#work') },
        { label: 'Yetenekler', hint: '#capabilities', run: () => go('#capabilities') },
        { label: 'CV', hint: 'cv.html', run: () => go('cv.html') },
        { label: 'GitHub', hint: 'github.com/salihkkus', run: () => open('https://github.com/salihkkus') },
        { label: 'LinkedIn', hint: 'linkedin.com/in/salihkarakus', run: () => open('https://www.linkedin.com/in/salihkarakus') },
    ];

    const go = target => {
        if (target.startsWith('#')) {
            document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
            history.replaceState(null, '', target);
        } else {
            location.href = target;
        }
    };
    const open = url => window.open(url, '_blank', 'noopener');

    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[70] hidden items-start justify-center bg-black/60 backdrop-blur-sm px-4 pt-[15vh]';
    overlay.innerHTML = `
        <div role="dialog" aria-modal="true" aria-label="Komut paleti"
            class="w-full max-w-lg bg-stone-950 border border-zinc-800 shadow-2xl font-mono text-sm">
            <div class="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
                <span class="text-accent">&gt;</span>
                <input id="palette-input" type="text" autocomplete="off" spellcheck="false"
                    placeholder="bir komut yaz..."
                    class="flex-1 bg-transparent text-zinc-100 placeholder:text-zinc-600 outline-none" />
            </div>
            <ul id="palette-list" class="max-h-80 overflow-auto py-2"></ul>
            <div class="px-4 py-2 border-t border-zinc-800 text-[11px] text-zinc-600 flex justify-between">
                <span>↑↓ seç · Enter aç</span>
                <span>Esc kapat</span>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('#palette-input');
    const list = overlay.querySelector('#palette-list');
    let items = [];
    let active = 0;
    let lastFocus = null;

    const render = () => {
        const q = input.value.trim().toLowerCase();
        items = COMMANDS.filter(c => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q));
        active = Math.min(active, Math.max(0, items.length - 1));
        list.innerHTML = items.length
            ? items.map((c, i) => `
                <li data-index="${i}" class="flex justify-between gap-4 px-4 py-2 cursor-pointer ${i === active ? 'bg-zinc-900 text-accent' : 'text-zinc-400'}">
                    <span>${c.label}</span>
                    <span class="text-zinc-600 truncate">${c.hint}</span>
                </li>`).join('')
            : '<li class="px-4 py-2 text-zinc-600">eşleşen komut yok</li>';
    };

    const openPalette = () => {
        lastFocus = document.activeElement;
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        input.value = '';
        active = 0;
        render();
        input.focus();
    };
    const closePalette = () => {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
        lastFocus?.focus?.();
    };
    const runActive = () => {
        const cmd = items[active];
        if (!cmd) return;
        closePalette();
        cmd.run();
    };

    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            overlay.classList.contains('hidden') ? openPalette() : closePalette();
        }
    });

    input.addEventListener('input', () => { active = 0; render(); });
    input.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % Math.max(1, items.length); render(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + items.length) % Math.max(1, items.length); render(); }
        if (e.key === 'Enter') { e.preventDefault(); runActive(); }
        if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
    });
    list.addEventListener('click', e => {
        const li = e.target.closest('li[data-index]');
        if (!li) return;
        active = Number(li.dataset.index);
        runActive();
    });
    list.addEventListener('mousemove', e => {
        const li = e.target.closest('li[data-index]');
        if (li && Number(li.dataset.index) !== active) { active = Number(li.dataset.index); render(); }
    });
    overlay.addEventListener('click', e => { if (e.target === overlay) closePalette(); });

    // Nav buttons: desktop shows the shortcut, touch users tap the terminal icon.
    document.getElementById('palette-open')?.addEventListener('click', openPalette);
    document.getElementById('palette-open-mobile')?.addEventListener('click', openPalette);

    // Show the right modifier key for the visitor's OS.
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
    document.querySelectorAll('.palette-kbd').forEach(k => { k.textContent = isMac ? '⌘ K' : 'Ctrl K'; });
})();
