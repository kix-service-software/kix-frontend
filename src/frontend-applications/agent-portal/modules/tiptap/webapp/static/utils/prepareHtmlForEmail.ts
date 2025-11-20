/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export function prepareHtmlForEmail(rawHtml: string): string {
    let html = rawHtml;

    html = html.replace(/<p><br><\/p>/g, '');
    html = html.replace(/ class="[^"]*tiptap-editor-body[^"]*"/g, '');

    html = html.replace(
        /<table([^>]*)>([\s\S]*?)<\/table>/gi,
        (_match, attrs, innerHtml) => {
            const cleanedAttrs = attrs.replace(/\s*style="[^"]*"/gi, '');

            const classMatch = attrs.match(/class="([^"]*)"/i);
            const originalClasses = classMatch?.[1] ?? '';
            const keptClasses = originalClasses
                .split(/\s+/)
                .filter((c) => !['table', 'table-bordered', 'w-100', 'align-middle'].includes(c));

            const allCells = Array.from(innerHtml.matchAll(/<(td|th)([^>]*)>/gi));
            const totalCount = allCells.length;
            const borderlessCount = allCells.filter(([, , cellAttrs]) =>
                /style="[^"]*border\s*:\s*none/i.test(cellAttrs)
            ).length;

            const isFullyBorderless = borderlessCount === totalCount;
            const hasAnyBorderless = borderlessCount > 0 && borderlessCount < totalCount;

            let tableClasses = ['table', 'w-100', 'align-middle'];
            if (!isFullyBorderless && !hasAnyBorderless) {
                tableClasses.splice(1, 0, 'table-bordered');
            }

            let newInner = innerHtml;
            if (hasAnyBorderless) {
                newInner = innerHtml.replace(
                    /<(td|th)([^>]*)>/gi,
                    (_cellMatch, tag, cellAttrs) => {
                        const styleMatch = cellAttrs.match(/style="([^"]*)"/i);
                        const style = styleMatch?.[1] ?? '';

                        const hasBorderNone = /border\s*:\s*none/i.test(style);
                        const hasWidth = /width\s*:/i.test(style);

                        if (hasBorderNone || hasWidth) {
                            return `<${tag}${cellAttrs}>`;
                        } else {
                            const cleanedCellAttrs = cellAttrs.replace(/\s*style="[^"]*"/gi, '');
                            const extraStyle = tag.toLowerCase() === 'th' ? 'text-align: left; ' : '';
                            return `<${tag}${cleanedCellAttrs} style="${extraStyle}border:1px solid #bfbfbf;">`;
                        }
                    }
                );
            } else if (!isFullyBorderless) {
                newInner = innerHtml.replace(
                    /<(td|th)([^>]*)>/gi,
                    (_cellMatch, tag, cellAttrs) => {
                        const cleanedCellAttrs = cellAttrs.replace(/\s*style="[^"]*"/gi, '');
                        const extraStyle = tag.toLowerCase() === 'th' ? 'text-align: left; ' : '';
                        return `<${tag}${cleanedCellAttrs} style="${extraStyle}border:1px solid #bfbfbf;">`;
                    }
                );
            }

            const inlineStyles =
                'border-collapse: collapse; border-spacing: 0;' +
                ' border: 0 !important; border-top: 0 !important;' +
                ' border-right: 0 !important; border-bottom: 0 !important; border-left: 0 !important;' +
                ' height: 0 !important;';

            return `<table frame="void" rules="none" class="${[...tableClasses, ...keptClasses].join(' ')}" cellpadding="6" cellspacing="0" width="100%" height="0 !important" style="${inlineStyles}">${newInner}</table>`;
        }
    );

    html = html.replace(
        /<table([^>]*)style="([^\"]*?)height\s*:\s*100%;?([^\"]*?)"/gi,
        (_m, before, left, right): string => `<table${before}style="${left}${right}"`
    );

    html = html.replace(/<blockquote([^>]*)>/gi, (_match, attrs) => {
        const styleMatch = attrs.match(/style="([^"]*)"/i);
        let style = 'border-left: 3px solid #ccc; padding-left: 10px; margin: 10px 0; font-style: italic;';
        if (styleMatch) {
            const existingStyle = styleMatch[1];
            const cleaned = existingStyle
                .split(';')
                .map((s) => s.trim())
                .filter((s) => s)
                .concat(style)
                .join('; ');
            return `<blockquote style="${cleaned}">`;
        } else {
            return `<blockquote style="${style}">`;
        }
    });

    html = html.replace(
        /<pre([^>]*)>([\s\S]*?)<\/pre>/gi,
        (_match, preAttrs, content) => {
            const style = 'background-color: #f4f4f4; font-family: monospace; padding: 10px; border-radius: 4px; white-space: pre-wrap; word-break: break-word;';
            let updatedAttrs = preAttrs;
            if (/style="/i.test(updatedAttrs)) {
                updatedAttrs = updatedAttrs.replace(/style="([^"]*)"/i, (_m, val) => {
                    return `style="${val}; ${style}"`;
                });
            } else {
                updatedAttrs += ` style="${style}"`;
            }

            const wrappedContent = content.match(/<code[^>]*>[\s\S]*<\/code>/i)
                ? content
                : `<code style="${style}">${content}</code>`;

            return `<pre${updatedAttrs}>${wrappedContent}</pre>`;
        }
    );

    html = html.replace(
        /<a([^>]*)href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi,
        (_match, beforeHref, href, afterHref, content) => {
            let finalHref = href.trim().replace(/"/g, '&quot;');

            if (!/^https?:\/\//i.test(finalHref)) {
                finalHref = 'https://' + finalHref;
            }

            try {
                const urlObj = new URL(finalHref);

                const parts = urlObj.hostname.split('.');
                if (!urlObj.hostname.startsWith('www.') && parts.length === 2) {
                    urlObj.hostname = 'www.' + urlObj.hostname;
                    finalHref = urlObj.toString();
                } else {
                    finalHref = urlObj.toString();
                }

            } catch {
                // If it's not a valid URL, keep it as-is
            }

            const hasTarget = /target\s*=\s*"_blank"/i.test(beforeHref + afterHref);
            const hasRel = /rel\s*=\s*"/i.test(beforeHref + afterHref);
            const classMatch = (beforeHref + afterHref).match(/class="([^"]*)"/i);
            const existingClasses = classMatch?.[1] ?? '';

            const classList = existingClasses
                .split(/\s+/)
                .filter((c) => !!c && c !== 'custom-link-class');

            classList.push('custom-link-class');

            let attrs = `href="${finalHref}" class="${classList.join(' ')}"`;

            if (!hasTarget) {
                attrs += ' target="_blank"';
            }

            if (!hasRel) {
                attrs += ' rel="noopener noreferrer"';
            }

            return `<a ${attrs}>${content}</a>`;
        }
    );


    html = html.replace(/<p([^>]*)>/gi, (_m, attrs) => {
        const styleMatch = attrs.match(/style="([^"]*)"/i);
        let cleanedStyle = '';

        if (styleMatch) {
            const styleVal = styleMatch[1];
            cleanedStyle = styleVal
                .split(';')
                .map((s) => s.trim())
                .filter((s) => s && !/^padding\s*:/i.test(s) && !/^margin\s*:/i.test(s))
                .join('; ');

            const cleanedAttrs = attrs.replace(/style="[^"]*"/i, '');
            return `<p${cleanedAttrs} style="${cleanedStyle}">`;
        }

        return `<p${attrs}>`;
    });

    html = html.replace(/<span[^>]*>\s*<\/span>/gi, '');

    html = html.replace(
        /<(td|th)([^>]*)>([\s\S]*?)<\/\1>/gi,
        (_match, tag, attrs, content) => {
            let newAttrs = attrs;

            const widthMatchInline = attrs.match(/style="[^"]*width\s*:\s*(\d+)px[^"]*"/i);
            const widthMatchAttr = attrs.match(/width\s*=\s*"(\d+)"/i);
            const widthFromAttr = widthMatchInline?.[1] || widthMatchAttr?.[1];

            if (widthFromAttr) {
                if (/style\s*=\s*"/i.test(newAttrs)) {
                    newAttrs = newAttrs.replace(/style="([^"]*)"/i, (_s, styleVal) => {
                        const newStyle = styleVal
                            .split(';')
                            .map((s) => s.trim())
                            .filter((s) => s && !/^width\s*:/i.test(s))
                            .concat(`width: ${widthFromAttr}px`)
                            .join('; ');
                        return `style="${newStyle}"`;
                    });
                } else {
                    newAttrs += ` style="width: ${widthFromAttr}px"`;
                }
            }

            if (tag.toLowerCase() === 'th') {
                if (/style\s*=\s*"/i.test(newAttrs)) {
                    newAttrs = newAttrs.replace(/style="([^"]*)"/i, (_s, styleVal) => {
                        const newStyle = styleVal
                            .split(';')
                            .map((s) => s.trim())
                            .filter((s) => s && !/^text-align\s*:/i.test(s))
                            .concat('text-align: left')
                            .join('; ');
                        return `style="${newStyle}"`;
                    });
                } else {
                    newAttrs += 'style="text-align: left"';
                }
            }

            const updatedContent = content.replace(
                /<p([^>]*)>/gi,
                (_pMatch, pAttrs) => {
                    const hasStyle = /style\s*=\s*"/i.test(pAttrs);
                    if (hasStyle) {
                        return `<p${pAttrs.replace(/style="([^"]*)"/i, (_s, styleVal) => {
                            const newStyle = styleVal
                                .split(';')
                                .filter((s) => s.trim() && !/^padding\s*:/.test(s.trim()) && !/^margin\s*:/.test(s.trim()))
                                .concat('padding: 0', 'margin: 0')
                                .join('; ');
                            return `style="${newStyle}"`;
                        })}>`;
                    } else {
                        return `<p${pAttrs} style="padding: 0; margin: 0;">`;
                    }
                }
            );

            return `<${tag}${newAttrs}>${updatedContent}</${tag}>`;
        }
    );

    html = html.replace(
        /<img([^>]*)>/gi,
        (_match, attrs, offset: number) => {
            let newAttrs = attrs;

            const srcMatch = attrs.match(/\s(src)\s*=\s*"([^"]*)"/i);
            let src = srcMatch?.[2] || '';
            if (src) {
                const isData = /^data:image\//i.test(src);
                const isCid = /^cid:/i.test(src);
                if (!isData && !isCid) {
                    if (/^\/\//.test(src)) src = 'https:' + src;
                    else if (/^https?:\/\//i.test(src)) {/* ok */ }
                    else if (/^[\w.-]+\.[a-z]{2,}/i.test(src)) src = 'https://' + src;
                }
                if (srcMatch) {
                    newAttrs = newAttrs.replace(srcMatch[0], ` src="${src}"`);
                } else {
                    newAttrs += ` src="${src}"`;
                }
            }

            const widthMatch = newAttrs.match(/(?:style="[^"]*?\bwidth\s*:\s*(\d+)px[^"]*"|width\s*=\s*"(\d+)"|data-width\s*=\s*"(\d+)")/i);
            const width = widthMatch?.[1] || widthMatch?.[2] || widthMatch?.[3];

            const styleMatch = newAttrs.match(/style="([^"]*)"/i);
            let styleVal = styleMatch?.[1] || '';
            let styles = styleVal
                .split(';')
                .map((s) => s.trim())
                .filter((s) => s && !/^(width|display|margin(-left|-right)?|float)\s*:/i.test(s));

            if (width) styles.push(`width: ${width}px`);
            styles.push('display: block', 'margin-bottom: 2px');

            let align = (newAttrs.match(/\bdata-align="(center|left|right)"/i)?.[1]) || null;

            if (!align) {
                const before = html.slice(0, offset);
                const lastOpenSpan = before.lastIndexOf('<span');
                const lastCloseSpan = before.lastIndexOf('</span>');
                if (lastOpenSpan > lastCloseSpan && lastOpenSpan !== -1) {
                    const windowStart = Math.max(0, lastOpenSpan - 400);
                    const chunk = before.slice(windowStart, offset);
                    const m = chunk.match(
                        /data-type="resizable-image-wrapper"[^>]*\bdata-align="(center|left|right)"/i
                    );
                    if (m) align = m[1];
                }
            }

            if (align === 'center') {
                styles.push('margin-left: auto', 'margin-right: auto', 'float: none');
            } else if (align === 'right') {
                styles.push('margin-left: auto', 'margin-right: 0', 'float: none');
            } else if (align === 'left') {
                styles.push('margin-left: 0', 'margin-right: auto', 'float: none');
            }

            const finalStyle = styles.join('; ');

            if (styleMatch) {
                newAttrs = newAttrs.replace(/style="[^"]*"/i, `style="${finalStyle}"`);
            } else {
                newAttrs += ` style="${finalStyle}"`;
            }

            if (width) {
                if (/\bwidth\s*=\s*"/i.test(newAttrs)) {
                    newAttrs = newAttrs.replace(/\bwidth\s*=\s*"\d*"/i, `width="${width}"`);
                } else {
                    newAttrs += ` width="${width}"`;
                }
            }

            return `<img${newAttrs}>`;
        }
    );

    return html;
}