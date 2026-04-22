let popup: HTMLDivElement | null = null;
let arrow: HTMLDivElement | null = null;

let linkTextEl: HTMLDivElement | null = null;
let statusEl: HTMLSpanElement | null = null;
let openEl: HTMLAnchorElement | null = null;
let copyBtn: HTMLButtonElement | null = null;
let removeBtn: HTMLButtonElement | null = null;

let hoveringPopup = false;
let onScrollOrResize: (() => void) | null = null;
let hideTimer: number | null = null;
let statusTimer: number | null = null;
let lastRect: DOMRect | null = null;
let lastHref: string | null = null;

function positionPopup(rect: DOMRect): void {
    if (!popup) return;

    const margin = 8;
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;

    const bbox = popup.getBoundingClientRect();
    const w = bbox.width || 260;
    const h = bbox.height || 46;

    const spaceBelow = vpH - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const placeAbove = h > spaceBelow && spaceAbove >= spaceBelow;

    const top = placeAbove
        ? Math.max(margin, rect.top - h - margin)
        : Math.min(vpH - h - margin, rect.bottom + margin);

    let left = rect.left;
    if (left + w + margin > vpW) left = vpW - w - margin;
    if (left < margin) left = margin;

    popup.style.top = `${Math.max(margin, Math.min(top, vpH - h - margin))}px`;
    popup.style.left = `${left}px`;

    if (arrow) {
        arrow.style.top = '';
        arrow.style.bottom = '';
        if (placeAbove) arrow.style.bottom = '-5px';
        else arrow.style.top = '-5px';

        const caretXInside = rect.left - left;
        const arrowOffset = Math.max(12, Math.min(w - 24, caretXInside));
        arrow.style.left = `${arrowOffset}px`;
    }

    popup.setAttribute('data-placement', placeAbove ? 'top' : 'bottom');
}

function btnStyle(): Partial<CSSStyleDeclaration> {
    return {
        padding: '6px 10px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        background: '#f7f7f7',
        cursor: 'pointer',
        fontSize: '13px',
        lineHeight: '16px',
        fontWeight: '600',
        userSelect: 'none',
    };
}

function setStatus(msg: string, kind: 'info' | 'ok' | 'warn' = 'info'): void {
    if (!statusEl) return;

    if (statusTimer) {
        window.clearTimeout(statusTimer);
        statusTimer = null;
    }

    statusEl.textContent = msg;
    statusEl.style.opacity = '1';

    if (kind === 'ok') statusEl.style.color = '#2b7a2b';
    else if (kind === 'warn') statusEl.style.color = '#b00020';
    else statusEl.style.color = '#666';

    statusTimer = window.setTimeout(() => {
        if (!statusEl) return;
        statusEl.style.opacity = '0';
        statusTimer = null;
    }, 900);
}

function setButtonsDisabled(disabled: boolean): void {
    if (copyBtn) copyBtn.disabled = disabled;
    if (removeBtn) removeBtn.disabled = disabled;

    [copyBtn, removeBtn].forEach((b) => {
        if (!b) return;
        b.style.opacity = disabled ? '0.6' : '1';
        b.style.cursor = disabled ? 'default' : 'pointer';
    });
}

function cancelPendingHide(): void {
    if (hideTimer) {
        window.clearTimeout(hideTimer);
        hideTimer = null;
    }
}

function ensurePopupCreated(args: {
    rect: DOMRect;
    href: string;
    onRemove: () => void;
    onRequestClose?: () => void;
}): void {
    if (popup) return;

    popup = document.createElement('div');
    popup.className = 'link-hover-popup';
    Object.assign(popup.style, {
        position: 'fixed',
        zIndex: '9999',
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: '12px',
        boxShadow: '0 10px 26px rgba(0,0,0,0.16)',
        padding: '8px',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        userSelect: 'none',
        maxWidth: '460px',
        pointerEvents: 'auto',
    } as CSSStyleDeclaration);

    popup.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        cancelPendingHide();
    });

    popup.addEventListener('click', (e) => {
        const t = e.target as Node | null;
        if (openEl && t && (t === openEl || openEl.contains(t))) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
    });

    arrow = document.createElement('div');
    Object.assign(arrow.style, {
        position: 'absolute',
        width: '10px',
        height: '10px',
        background: 'white',
        transform: 'rotate(45deg)',
        boxShadow: '-1px -1px 1px rgba(0,0,0,0.05)',
    } as CSSStyleDeclaration);

    popup.appendChild(arrow);

    linkTextEl = document.createElement('div');
    linkTextEl.className = 'link-text';
    Object.assign(linkTextEl.style, {
        maxWidth: '210px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: '#333',
        padding: '0 8px 0 6px',
        fontSize: '13px',
        borderRight: '1px solid #eee',
        marginRight: '2px',
    } as CSSStyleDeclaration);

    openEl = document.createElement('a');
    openEl.textContent = 'Open';
    openEl.target = '_blank';
    openEl.rel = 'noopener noreferrer';
    Object.assign(openEl.style, {
        ...btnStyle(),
        textDecoration: 'none',
        color: '#111',
        display: 'inline-flex',
        alignItems: 'center',
    } as CSSStyleDeclaration);

    openEl.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        cancelPendingHide();
        if (!lastHref) return;
        window.open(lastHref, '_blank', 'noopener,noreferrer');
    });

    copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.textContent = 'Copy';
    Object.assign(copyBtn.style, btnStyle() as CSSStyleDeclaration);

    copyBtn.addEventListener('pointerdown', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!lastHref) return;

        try {
            await navigator.clipboard.writeText(lastHref);
            setStatus('Copied!', 'ok');
        } catch {
            try {
                const ta = document.createElement('textarea');
                ta.value = lastHref;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                ta.remove();
                setStatus('Copied!', 'ok');
            } catch {
                setStatus('Copy failed', 'warn');
            }
        }
    });

    removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    Object.assign(removeBtn.style, {
        ...btnStyle(),
        border: '1px solid #e3b1b1',
        background: '#fff2f2',
        color: '#7a0b0b',
    } as CSSStyleDeclaration);

    removeBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();

        setButtonsDisabled(true);
        setStatus('Removed', 'ok');

        try {
            args.onRemove();
        } finally {
            window.setTimeout(() => setButtonsDisabled(false), 200);
        }
    });

    statusEl = document.createElement('span');
    statusEl.className = 'link-hover-status';
    statusEl.textContent = '';
    Object.assign(statusEl.style, {
        fontSize: '12px',
        color: '#666',
        opacity: '0',
        transition: 'opacity 160ms ease',
        marginLeft: '2px',
        marginRight: '4px',
        whiteSpace: 'nowrap',
    } as CSSStyleDeclaration);

    popup.appendChild(linkTextEl);
    popup.appendChild(openEl);
    popup.appendChild(copyBtn);
    popup.appendChild(removeBtn);
    popup.appendChild(statusEl);

    document.body.appendChild(popup);

    popup.addEventListener('mouseenter', () => {
        hoveringPopup = true;
        cancelPendingHide();
    });

    popup.addEventListener('mouseleave', () => {
        hoveringPopup = false;
        args.onRequestClose?.();
    });

    onScrollOrResize = (): void => {
        if (lastRect) positionPopup(lastRect);
    };
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
}

export function showLinkHoverPopup(args: {
    rect: DOMRect;
    href: string;
    onRemove: () => void;
    onRequestClose?: () => void;
}): void {
    ensurePopupCreated(args);

    if (!popup || !linkTextEl || !openEl) return;

    cancelPendingHide();

    lastRect = args.rect;
    lastHref = args.href;

    linkTextEl.textContent = args.href;
    openEl.href = args.href;

    const shouldReposition =
        !lastRect ||
        Math.abs((lastRect?.left ?? 0) - args.rect.left) > 1 ||
        Math.abs((lastRect?.top ?? 0) - args.rect.top) > 1;

    if (shouldReposition) positionPopup(args.rect);
    else positionPopup(args.rect);

    if (lastHref !== args.href) {
        if (statusEl) statusEl.style.opacity = '0';
    }
}

export function requestHideLinkHoverPopup(delayMs = 220): void {
    cancelPendingHide();

    hideTimer = window.setTimeout(() => {
        hideTimer = null;
        if (hoveringPopup) return;
        hideLinkHoverPopup();
    }, delayMs);
}

export function hideLinkHoverPopup(): void {
    cancelPendingHide();

    if (statusTimer) {
        window.clearTimeout(statusTimer);
        statusTimer = null;
    }

    if (!popup) return;

    if (onScrollOrResize) {
        window.removeEventListener('scroll', onScrollOrResize, true);
        window.removeEventListener('resize', onScrollOrResize);
        onScrollOrResize = null;
    }

    popup.remove();

    popup = null;
    arrow = null;
    linkTextEl = null;
    statusEl = null;
    openEl = null;
    copyBtn = null;
    removeBtn = null;
    hoveringPopup = false;
    lastRect = null;
    lastHref = null;
}