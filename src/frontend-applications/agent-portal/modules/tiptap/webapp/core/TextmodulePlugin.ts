/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TextModuleService } from '../../../textmodule/webapp/core';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { PlaceholderService } from '../../../base-components/webapp/core/PlaceholderService';

function looksLikeHtml(input: string): boolean {
    return /<\/?[a-z][\s\S]*>/i.test(input);
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function plaintextToHtml(text: string): string {
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    const escaped = escapeHtml(normalized);

    const paragraphs = escaped
        .split(/\n{2,}/g)
        .map((p) => p.replace(/\n/g, '<br />'))
        .map((p) => p.trim())
        .filter(Boolean);

    if (!paragraphs.length) return '<p></p>';
    return paragraphs.map((p) => `<p>${p}</p>`).join('');
}

function ensureHtml(text: string): string {
    if (!text) return '<p></p>';
    if (looksLikeHtml(text)) return text;
    return plaintextToHtml(text);
}

const defaultFontFamily = 'Arial';
const defaultFontSize = '14px';

function extractCss(style: string, prop: string): string | null {
    const m = (style || '').match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, 'i'));
    return m ? m[1].trim() : null;
}

function hasCss(style: string, prop: string): boolean {
    return new RegExp(`(?:^|;)\\s*${prop}\\s*:`, 'i').test(style || '');
}

function setOrAppendStyle(el: HTMLElement, extra: string): void {
    const base = (el.getAttribute('style') || '').trim().replace(/;\s*$/, '');
    el.setAttribute('style', base ? `${base}; ${extra};` : `${extra};`);
}

function isBlockTag(tag: string): boolean {
    const t = tag.toLowerCase();
    return (
        t === 'p' ||
        t === 'div' ||
        t === 'li' ||
        t === 'td' ||
        t === 'th' ||
        t === 'h1' ||
        t === 'h2' ||
        t === 'h3' ||
        t === 'h4' ||
        t === 'h5' ||
        t === 'h6'
    );
}

function promoteFontFamilyToBlocks(html: string): string {
    if (!html) return html;

    try {
        const d = document.createElement('div');
        d.innerHTML = html;

        const blocks = Array.from(
            d.querySelectorAll<HTMLElement>('p, div, li, td, th, h1, h2, h3, h4, h5, h6'),
        );

        for (const block of blocks) {
            const style = block.getAttribute('style') || '';
            const missingFamily = !hasCss(style, 'font-family');
            if (!missingFamily) continue;

            const hasPayload =
                (block.textContent || '').trim().length > 0 || !!block.querySelector('img, table');
            if (!hasPayload) continue;

            let foundFamily: string | null = null;
            const descendants = Array.from(block.querySelectorAll<HTMLElement>('[style]'));
            for (const el of descendants) {
                const s = el.getAttribute('style') || '';
                const fam = extractCss(s, 'font-family');
                if (fam) {
                    foundFamily = fam;
                    break;
                }
            }

            setOrAppendStyle(block, `font-family:${foundFamily || defaultFontFamily}`);
        }

        return d.innerHTML;
    } catch {
        return html;
    }
}

function applyDefaultsToOrphanInlineMarks(html: string): string {
    if (!html) return html;

    try {
        const d = document.createElement('div');
        d.innerHTML = html;

        const targets = Array.from(d.querySelectorAll<HTMLElement>('strong, b, em, i, u, s, strike'));

        const ancestorHasPropUntilBlock = (el: HTMLElement, prop: string): boolean => {
            let p: HTMLElement | null = el.parentElement;
            while (p) {
                const ps = p.getAttribute('style') || '';
                if (hasCss(ps, prop)) return true;
                if (isBlockTag(p.tagName)) break;
                p = p.parentElement;
            }
            return false;
        };

        for (const el of targets) {
            const style = el.getAttribute('style') || '';

            const elHasFamily = hasCss(style, 'font-family');
            const elHasSize = hasCss(style, 'font-size');

            if (elHasFamily && elHasSize) continue;

            const inheritedFamily = ancestorHasPropUntilBlock(el, 'font-family');
            const inheritedSize = ancestorHasPropUntilBlock(el, 'font-size');

            const parts: string[] = [];

            if (!elHasFamily && !inheritedFamily) {
                parts.push(`font-family:${defaultFontFamily}`);
            }

            if (!elHasSize && !inheritedSize) {
                parts.push(`font-size:${defaultFontSize}`);
            }

            if (parts.length) {
                setOrAppendStyle(el, parts.join('; '));
            }
        }

        return d.innerHTML;
    } catch {
        return html;
    }
}

export class TextmodulePlugin {
    public static readonly TRIGGER = '::';

    public static async fetchSuggestions(query: string): Promise<any[]> {
        const service = await TextModuleService.getInstance();
        const modules = await service.searchTextModules(query);

        const results = await Promise.all(
            modules.map(async (mod) => {
                const name = await TranslationService.translate(mod.Name);
                return {
                    id: String(mod.ID),
                    label: name,
                    content: mod.Text,
                    keywords: mod.Keywords?.join(', ') || '',
                    language: mod.Language,
                };
            }),
        );

        return results;
    }

    public static async prepareTextContent(textmodule: any): Promise<string> {
        const raw = String(textmodule?.content ?? '');
        try {
            const placeholderService = await PlaceholderService.getInstance();
            const replaced = await placeholderService.replacePlaceholders(raw, null, textmodule.language, true);

            let html = ensureHtml(String(replaced ?? ''));

            html = promoteFontFamilyToBlocks(html);

            html = applyDefaultsToOrphanInlineMarks(html);

            return html;
        } catch (e) {
            console.error('[TextmodulePlugin] Error preparing text content:', e);

            let html = ensureHtml(raw);
            html = promoteFontFamilyToBlocks(html);
            html = applyDefaultsToOrphanInlineMarks(html);

            return html;
        }
    }
}