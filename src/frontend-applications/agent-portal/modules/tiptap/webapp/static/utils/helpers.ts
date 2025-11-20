/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export function stylesWereLost(raw: string, cleaned: string): boolean {
    const keys = ['font-family', 'font-size', 'color:'];
    return keys.some((k) => raw.includes(k) && !cleaned.includes(k));
}

export function stripCkWrapperEverywhere(html: string | undefined | null): string {
    if (!html) return '<p></p>';
    try {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;

        const ck = tmp.querySelector('[class~="ck"][class~="ck-content"]') as HTMLElement | null;
        if (ck) return ck.innerHTML || '<p></p>';

        const all = tmp.querySelectorAll('[class]');
        for (let i = 0; i < all.length; i++) {
            const el = all.item(i);
            if (!(el instanceof HTMLElement)) continue;

            const cls = el.getAttribute('class') || '';
            const hasCk = /\bck\b/.test(cls);
            const hasCkContent = /\bck-content\b/.test(cls);
            if (hasCk && hasCkContent) return el.innerHTML || '<p></p>';
        }

        return html;
    } catch {
        return html || '<p></p>';
    }
}

export function extractEditorFragment(html: string | undefined | null): string {
    if (!html) return '<p></p>';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;

    const stripped = stripCkWrapperEverywhere(html);
    if (stripped !== html) return stripped;

    const ck = tmp.querySelector('.ck.ck-content');
    if (ck) return (ck as HTMLElement).innerHTML;

    const body = tmp.querySelector('body');
    if (body) return (body as HTMLElement).innerHTML;

    const out = tmp.innerHTML || '<p></p>';
    return out;
}

export function unwrapNeutralSpans(root: HTMLElement): void {
    const spans = root.querySelectorAll('span');
    for (let i = 0; i < spans.length; i++) {
        const span = spans.item(i) as HTMLElement;
        const attrCount = span.attributes?.length ?? 0;
        const style = span.getAttribute('style')?.trim() || '';

        const hasUsefulStyle =
            /(?:^|;)\s*(font-(family|size)|color|text-decoration|font-weight|font-style|vertical-align)\s*:/i
                .test(style);
        const hasOtherAttrs =
            Array.from(span.attributes).some((a) => a.name.toLowerCase() !== 'style');

        const isNeutral = (attrCount === 0) || (!hasUsefulStyle && !hasOtherAttrs);

        if (isNeutral) {
            const parent = span.parentNode;
            if (!parent) continue;
            while (span.firstChild) parent.insertBefore(span.firstChild, span);
            parent.removeChild(span);
        }
    }
}

export function normalizeForTiptap(html: string | undefined | null): string {
    const fragment = extractEditorFragment(html);
    const tmp = document.createElement('div');
    tmp.innerHTML = (fragment || '').trim();

    unwrapNeutralSpans(tmp);

    const blockTag =
        /^(address|article|aside|blockquote|div|dl|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|main|nav|ol|p|pre|section|table|ul)$/i;

    let firstMeaningful: ChildNode | null = null;
    const children = Array.from(tmp.childNodes) as ChildNode[];

    for (const n of Array.from(children)) {
        if (n.nodeType === 8) continue;
        if (n.nodeType === 3 && !(n.textContent || '').trim()) continue;
        firstMeaningful = n;
        break;
    }

    const needsWrap =
        !firstMeaningful ||
        firstMeaningful.nodeType === 3 ||
        (firstMeaningful?.nodeType === 1 && !blockTag.test((firstMeaningful as Element).tagName));

    if (needsWrap) {
        const p = document.createElement('p');
        while (tmp.firstChild) p.appendChild(tmp.firstChild);
        tmp.appendChild(p);
    }

    unwrapNeutralSpans(tmp);

    const out = tmp.innerHTML.trim() || '<p></p>';
    return out;
}

export function inTextblock(ed: any): boolean {
    return !!ed?.state?.selection?.$from?.parent?.isTextblock;
}

export function moveIntoNewParagraph(ed: any): void {
    ed.chain().focus().insertContent('<p></p>').run();
    try {
        const pos = ed.state.selection.$to.pos;
        ed.chain().setTextSelection(pos).run();
    } catch {
        /* noop */
    }
}

export function applyLastUsedMarks(ed: any): void {
    let ch = ed.chain().focus();
    const s = ed.storage || {};
    if (s.lastFontFamily) ch = ch.setFontFamily(s.lastFontFamily);
    if (s.lastFontSize) ch = ch.setFontSize(s.lastFontSize);
    if (s.lastFontColor) ch = ch.setColor(s.lastFontColor);
    if (s.lastBold) ch = ch.setMark('bold');
    if (s.lastItalic) ch = ch.setMark('italic');
    if (s.lastUnderline) ch = ch.setMark('underline');
    if (s.lastStrike) ch = ch.setMark('strike');
    if (s.lastHighlightColor) ch = ch.setHighlight({ color: s.lastHighlightColor });
    ch.run();
}