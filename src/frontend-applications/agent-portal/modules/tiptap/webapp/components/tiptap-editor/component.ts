/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { createMentionPopup } from '../../static/utils/mentionPopup';
import { createToolbar } from '../../static/utils/toolbar';
import { ComponentState } from './ComponentState';
import { createWrapper } from '../../static/utils/editorDom';
import { TextmodulePlugin } from '../../core/TextmodulePlugin';
import { prepareHtmlForEmail } from '../../static/utils/prepareHtmlForEmail';

declare const Tiptap: any;
let applyingDefaults = false;

function stylesWereLost(raw: string, cleaned: string): boolean {
    const keys = ['font-family', 'font-size', 'color:'];
    return keys.some((k) => raw.includes(k) && !cleaned.includes(k));
}

function stripCkWrapperEverywhere(html: string | undefined | null): string {
    if (!html) return '<p></p>';
    try {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;

        const ck = tmp.querySelector('[class~="ck"][class~="ck-content"]') as HTMLElement | null;
        if (ck) {
            return ck.innerHTML || '<p></p>';
        }

        const all = tmp.querySelectorAll('[class]');
        for (const el of Array.from(all)) {
            const cls = (el as HTMLElement).getAttribute('class') || '';
            const hasCk = /\bck\b/.test(cls);
            const hasCkContent = /\bck-content\b/.test(cls);
            if (hasCk && hasCkContent) {
                return (el as HTMLElement).innerHTML || '<p></p>';
            }
        }

        return html;
    } catch {
        return html || '<p></p>';
    }
}

function extractEditorFragment(html: string | undefined | null): string {
    if (!html) return '<p></p>';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;

    const stripped = stripCkWrapperEverywhere(html);
    if (stripped !== html) {
        return stripped;
    }

    const ck = tmp.querySelector('.ck.ck-content');
    if (ck) {
        return (ck as HTMLElement).innerHTML;
    }

    const body = tmp.querySelector('body');
    if (body) {
        return (body as HTMLElement).innerHTML;
    }

    const out = tmp.innerHTML || '<p></p>';
    return out;
}

function unwrapNeutralSpans(root: HTMLElement): void {
    const spans = Array.from(root.querySelectorAll('span'));
    for (const span of spans) {
        const attrCount = span.attributes?.length ?? 0;
        const style = (span as HTMLElement).getAttribute('style')?.trim() || '';

        const hasUsefulStyle = /(?:^|;)\s*(font-(family|size)|color|text-decoration|font-weight|font-style|vertical-align)\s*:/i.test(style);
        const hasOtherAttrs = Array.from(span.attributes).some((a) => a.name.toLowerCase() !== 'style');

        const isNeutral = (attrCount === 0) || (!hasUsefulStyle && !hasOtherAttrs);

        if (isNeutral) {
            const parent = span.parentNode;
            if (!parent) continue;
            while (span.firstChild) parent.insertBefore(span.firstChild, span);
            parent.removeChild(span);
        }
    }
}

function normalizeForTiptap(html: string | undefined | null): string {
    const fragment = extractEditorFragment(html);
    const tmp = document.createElement('div');
    tmp.innerHTML = (fragment || '').trim();

    unwrapNeutralSpans(tmp);

    const blockTag = /^(address|article|aside|blockquote|div|dl|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|main|nav|ol|p|pre|section|table|ul)$/i;

    let firstMeaningful: ChildNode | null = null;
    for (const n of Array.from(tmp.childNodes)) {
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

function withContentCheckDisabled(editor: any, fn: () => void): void {
    const hadOption = typeof editor?.setOptions === 'function'
        && Object.prototype.hasOwnProperty.call(editor?.options ?? {}, 'enableContentCheck');

    const prev = hadOption ? !!editor.options.enableContentCheck : undefined;

    try {
        if (hadOption) editor.setOptions({ enableContentCheck: false });
        fn();
    } finally {
        if (hadOption && prev !== undefined) editor.setOptions({ enableContentCheck: prev });
    }
}

export class Component extends AbstractMarkoComponent<ComponentState> {
    private editor: any;
    private readOnly: boolean;
    private value: string;



    private _onVisChange?: () => void;
    private _onBeforeUnload?: () => void;
    private _saveRaw?: () => void;

    private _lastRawHtml?: string;
    private _lastCleanHtml?: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.readOnly = input.readOnly ?? false;
        this.value = input.value;
    }

    public async onMount(): Promise<void> {
        const mountElement = document.querySelector(`#${this.state.editorId}`) as HTMLElement | null;
        if (!mountElement || !Tiptap?.Editor || !Tiptap?.StarterKit) {
            return;
        }

        const comp = this;
        (window as any).__currentEditor = (): any => comp.editor;

        mountElement.innerHTML = '';

        const wrapper = createWrapper();
        let initialContent = normalizeForTiptap(this.value);

        const createEditor = (content: string, _tag: string): any =>
            new Tiptap.Editor({
                element: wrapper,
                enableContentCheck: true,
                onContentError: (_error): void => {
                    try {
                        const cleaned = normalizeForTiptap(comp.value);
                        comp.editor?.commands.setContent(cleaned, false);
                    } catch { }
                },
                extensions: [
                    Tiptap.StarterKit.configure({ bold: false, paragraph: false }),
                    Tiptap.TextStyle,
                    Tiptap.Color,
                    Tiptap.Underline,
                    Tiptap.Link.configure({
                        openOnClick: true,
                        autolink: true,
                        linkOnPaste: true,
                        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank', class: 'custom-link-class' },
                    }),
                    Tiptap.Placeholder.configure({ placeholder: 'Start writing your ticket...' }),
                    Tiptap.Table.configure({ resizable: true, allowTableCellSelection: true }),
                    Tiptap.TableRow,
                    Tiptap.TableCell,
                    Tiptap.TableHeader,

                    Tiptap.Mention.configure({
                        HTMLAttributes: { class: 'text-suggestion' },
                        suggestion: {
                            char: TextmodulePlugin.TRIGGER,
                            startOfLine: false,
                            items: async ({ query }) => {
                                return await TextmodulePlugin.fetchSuggestions(query);
                            },
                            render: () => {
                                return createMentionPopup();
                            },
                            command: async ({ editor, range, props }) => {
                                const content2 = await TextmodulePlugin.prepareTextContent(props);
                                editor.chain().focus().deleteRange(range).insertContent(content2).run();
                            },
                        },
                    }),
                    Tiptap.ResizableImage,
                    Tiptap.Highlight.configure({ multicolor: true }),
                    Tiptap.TextAlign.configure({ types: ['heading', 'paragraph'] }),
                    Tiptap.CustomParagraph,
                    Tiptap.Bold,
                    Tiptap.Subscript,
                    Tiptap.Superscript,
                ],

                content: content || '<p></p>',
                editable: !comp.readOnly,

                editorProps: {
                    attributes: { class: 'tiptap-editor-body' },

                    handleDrop(view, event): boolean {
                        const file = event.dataTransfer?.files?.[0];
                        if (file && file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = (): void => {
                                const src = reader.result as string;
                                const node = view.state.schema.nodes.resizableImage.create({
                                    src,
                                    width: 300,
                                    isGif: file.type === 'image/gif',
                                });
                                view.dispatch(view.state.tr.replaceSelectionWith(node));
                            };
                            reader.readAsDataURL(file);
                            event.preventDefault();
                            return true;
                        }
                        return false;
                    },

                    handlePaste(view, event): boolean {
                        const cd = event.clipboardData;
                        const items = cd?.items || [];
                        for (const item of items) {
                            if (item.kind === 'file' && item.type.startsWith('image/')) {
                                const file = item.getAsFile();
                                if (!file) continue;
                                const reader = new FileReader();
                                reader.onload = (): void => {
                                    const src = reader.result as string;
                                    const node = view.state.schema.nodes.resizableImage.create({
                                        src,
                                        width: 300,
                                        align: 'left',
                                        isGif: file.type === 'image/gif',
                                    });
                                    view.dispatch(view.state.tr.replaceSelectionWith(node));
                                };
                                reader.readAsDataURL(file);
                                event.preventDefault();
                                return true;
                            }
                        }

                        const text = cd?.getData('text/plain')?.trim();
                        if (text && /^https?:\/\/.+\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(text)) {
                            const node = view.state.schema.nodes.resizableImage.create({
                                src: text,
                                width: 300,
                                align: 'left',
                                isGif: /\.gif(\?.*)?$/i.test(text),
                            });
                            comp.editor.commands.insertContent(node);;
                            event.preventDefault();
                            return true;
                        }

                        const html = cd?.getData('text/html') || '';
                        if (html) {
                            const fragment = normalizeForTiptap(html);
                            if (fragment) {
                                event.preventDefault();
                                try {
                                    if (typeof withContentCheckDisabled === 'function') {
                                        withContentCheckDisabled(comp.editor, () => {
                                            comp.editor?.chain().focus().insertContent(fragment).run();
                                        });
                                    } else {
                                        comp.editor?.chain().focus().insertContent(fragment).run();
                                    }
                                    return true;
                                } catch (_e) {
                                    try {
                                        comp.editor?.chain().focus().setContent(fragment, false).run();
                                        return true;
                                    } catch {
                                        const plain = cd?.getData('text/plain') || '';
                                        if (plain) {
                                            comp.editor?.chain().focus().insertContent(`<p>${plain}</p>`).run();
                                            return true;
                                        }
                                        return false;
                                    }
                                }
                            }
                        }

                        return false;
                    },

                    handleKeyDown(view, event): boolean {
                        const { state } = view;
                        if (event.key === 'Enter') {
                            const { selection } = state;
                            const marks = state.storedMarks || selection.$from.marks();

                            setTimeout(() => {
                                const newPos = comp.editor.state.selection.$from;
                                const currentNode = newPos.parent;

                                if (currentNode.type.name === 'paragraph') {
                                    let chain = comp.editor.chain().focus();

                                    let appliedFont = false;
                                    let appliedSize = false;
                                    let appliedColor = false;

                                    for (const mark of marks) {
                                        if (mark.type.name === 'bold') chain.setMark('bold');
                                        if (mark.type.name === 'italic') chain.setMark('italic');
                                        if (mark.type.name === 'underline') chain.setMark('underline');

                                        if (mark.type.name === 'textStyle') {
                                            if (mark.attrs?.color) {
                                                chain.setColor(mark.attrs.color);
                                                appliedColor = true;
                                            }
                                            if (mark.attrs?.fontSize) {
                                                chain.setFontSize(mark.attrs.fontSize);
                                                appliedSize = true;
                                            }
                                            if (mark.attrs?.fontFamily) {
                                                chain.setFontFamily(mark.attrs.fontFamily);
                                                appliedFont = true;
                                            }
                                        }
                                    }

                                    if (!appliedFont && comp.editor.storage.lastFontFamily)
                                        chain.setFontFamily(comp.editor.storage.lastFontFamily);
                                    if (!appliedSize && comp.editor.storage.lastFontSize)
                                        chain.setFontSize(comp.editor.storage.lastFontSize);
                                    if (!appliedColor && comp.editor.storage.lastFontColor)
                                        chain.setColor(comp.editor.storage.lastFontColor);

                                    chain.run();
                                }
                            }, 0);

                            return false;
                        }
                        return false;
                    },

                    handleDOMEvents: {
                        beforeinput: (_view, _event): boolean => {
                            const { state } = comp.editor;
                            const $from = state.selection.$from;

                            const marks = state.storedMarks || $from.marks();
                            const tsMark = marks?.find((m) => m.type?.name === 'textStyle');
                            const hasExplicitTS =
                                !!tsMark && !!(tsMark.attrs?.fontFamily ||
                                    tsMark.attrs?.fontSize || tsMark.attrs?.color);
                            if (hasExplicitTS) return false;

                            const isEmptyBlock =
                                $from.parent?.isTextblock && $from.parent.content.size === 0;

                            if (!isEmptyBlock) return false;

                            const chain = comp.editor.chain().focus();
                            const lastFont = comp.editor.storage.lastFontFamily || null;
                            const lastSize = comp.editor.storage.lastFontSize || null;
                            const lastColor = comp.editor.storage.lastFontColor || null;

                            if (lastFont) chain.setFontFamily(lastFont);
                            if (lastSize) chain.setFontSize(lastSize);
                            if (lastColor) chain.setColor(lastColor);

                            chain.run();
                            return false;
                        },
                    },
                },

                onUpdate: ({ editor }: { editor: any }): void => {
                    const rawHtml = editor.getHTML();
                    comp._lastRawHtml = rawHtml;

                    let cleanedHtml = rawHtml;
                    try {
                        cleanedHtml = prepareHtmlForEmail(rawHtml);
                    } catch { }
                    comp._lastCleanHtml = cleanedHtml;

                    if (stylesWereLost(rawHtml, cleanedHtml)) {
                        cleanedHtml = rawHtml;
                    }

                    (comp as any).emit('valueChanged', cleanedHtml);

                    if (applyingDefaults) return;

                    const { state } = editor;
                    const { doc, selection } = state;

                    let imageCount = 0;
                    let textChars = 0;
                    doc.descendants((node: any) => {
                        if (node.type && node.type.name === 'resizableImage') imageCount += 1;
                        if (node.isText && node.text) textChars += node.text.trim().length;
                    });
                    const onlyImages = imageCount > 0 && textChars === 0;

                    if (onlyImages) return;

                    const $from = selection.$from;
                    const inEmptyParagraph =
                        $from.parent?.type?.name === 'paragraph' &&
                        $from.parent.isTextblock &&
                        $from.parent.content.size === 0;

                    if (inEmptyParagraph) {
                        const wantFont = 'Arial';
                        const wantSize = '14';
                        const ts = editor.getAttributes('textStyle') || {};
                        const needFont = ts.fontFamily !== wantFont;
                        const needSize = String(ts.fontSize || '') !== wantSize;

                        if (needFont || needSize) {
                            applyingDefaults = true;
                            editor.chain().setFontFamily(wantFont).setFontSize(wantSize).run();
                            editor.storage.lastFontFamily = wantFont;
                            editor.storage.lastFontSize = wantSize;
                            applyingDefaults = false;
                        }
                    }
                },
            });

        try {
            this.editor = createEditor(initialContent, 'E1');
        } catch {
            const strippedOnce = stripCkWrapperEverywhere(this.value);
            const fixed = normalizeForTiptap(strippedOnce);
            this.editor = createEditor(fixed, 'E2');
        }

        const editor = this.editor;

        editor.on('transaction', ({ editor: ed }: any) => {
            const ts = ed.getAttributes('textStyle') || {};
            const font = ts.fontFamily;
            const size = ts.fontSize;
            const color = ts.color;
            if (font) ed.storage.lastFontFamily = font;
            if (size) ed.storage.lastFontSize = size;
            if (color) ed.storage.lastFontColor = color;
        });

        const toolbar: HTMLDivElement = createToolbar(this.editor);
        mountElement.appendChild(toolbar);
        mountElement.appendChild(wrapper);

        const saveRaw = (): void => {
            if (!this.editor) return;
            try {
                void this.editor.getHTML();
            } catch { }
        };
        const onVisChange = (): void => { if (document.visibilityState === 'hidden') saveRaw(); };
        const onBeforeUnload = (): void => { saveRaw(); };

        document.addEventListener('visibilitychange', onVisChange);
        window.addEventListener('beforeunload', onBeforeUnload);

        this._onVisChange = onVisChange;
        this._onBeforeUnload = onBeforeUnload;
        this._saveRaw = saveRaw;
    }

    public onDestroy(): void {
        if (this._onVisChange) {
            document.removeEventListener('visibilitychange', this._onVisChange);
            this._onVisChange = undefined;
        }
        if (this._onBeforeUnload) {
            window.removeEventListener('beforeunload', this._onBeforeUnload);
            this._onBeforeUnload = undefined;
        }

        if (this.editor) {
            try { void this.editor.getHTML().length; } catch { }
            this.editor.destroy();
            this.editor = null;
        }
    }
}

module.exports = Component;