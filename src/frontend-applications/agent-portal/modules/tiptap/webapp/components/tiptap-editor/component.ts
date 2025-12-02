/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH
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
import {
    stylesWereLost,
    stripCkWrapperEverywhere,
    normalizeForTiptap,
    inTextblock,
    moveIntoNewParagraph,
    applyLastUsedMarks,
} from '../../static/utils/helpers';
import { TiptapEditorService } from '../../core/TipTapEditorService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';

declare const Tiptap: any;
function sanitizeTextmoduleHtml(html: string): string {
    if (!html) return html;

    try {
        const container = document.createElement('div');
        container.innerHTML = html;

        const tbodies = Array.from(container.querySelectorAll('tbody'));
        for (const tbody of tbodies) {
            const parent = tbody.parentElement;
            if (!parent || parent.tagName.toLowerCase() !== 'table') {
                const table = document.createElement('table');

                while (tbody.firstChild) {
                    table.appendChild(tbody.firstChild);
                }

                tbody.replaceWith(table);
            }
        }

        container
            .querySelectorAll('tbody')
            .forEach((t) => {
                while (t.firstChild) {
                    t.parentElement?.insertBefore(t.firstChild, t);
                }
                t.remove();
            });

        const result = container.innerHTML;
        const normalized = normalizeForTiptap(result);

        return normalized;
    } catch {
        return html;
    }
}

export class Component extends AbstractMarkoComponent<ComponentState> {
    private editor: any;
    private readOnly: boolean;
    private value: string;
    private changeTimeout: any;
    private editorTimeout = 1000;
    private changeListener: Array<() => null> = [];
    private focusListener: Array<(value: string) => null> = [];

    private focusListenerEnabled = true;

    private _onVisChange?: () => void;
    private _onBeforeUnload?: () => void;
    private _saveRaw?: () => void;

    private _lastRawHtml?: string;
    private _lastCleanHtml?: string;

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
        this.changeListener = [];
        this.focusListener = [];
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.readOnly = input.readOnly ?? false;
        this.value = input.value;
        if (this.editor) {
            this.editor.commands.setContent(this.value);
        }
    }

    public async onMount(): Promise<void> {
        const mountElement =
            document.querySelector(`#${this.state.editorId}`) as HTMLElement | null;
        if (!mountElement || !Tiptap?.Editor || !Tiptap?.StarterKit) {
            return;
        }

        const comp = this;
        (window as any).__currentEditor = (): any => comp.editor;

        mountElement.innerHTML = '';

        const wrapper = createWrapper();
        const initialContent: string = normalizeForTiptap(this.value);

        const createEditor = (content: string, _tag: string): any =>
            new Tiptap.Editor({
                element: wrapper,
                enableContentCheck: false,
                extensions: [
                    Tiptap.StarterKit.configure({ bold: false, paragraph: false }),
                    Tiptap.TextStyle,
                    Tiptap.Color,
                    Tiptap.Underline,
                    Tiptap.Link.configure({
                        openOnClick: true,
                        autolink: true,
                        linkOnPaste: true,
                        HTMLAttributes: {
                            rel: 'noopener noreferrer',
                            target: '_blank',
                            class: 'custom-link-class',
                        },
                    }),
                    Tiptap.Placeholder.configure({
                        placeholder: 'Start writing your ticket...',
                    }),
                    Tiptap.Table.configure({
                        resizable: true,
                        allowTableCellSelection: true,
                    }),
                    Tiptap.TableRow,
                    Tiptap.TableCell,
                    Tiptap.TableHeader,
                    Tiptap.Mention.configure({
                        HTMLAttributes: { class: 'text-suggestion' },
                        suggestion: {
                            char: TextmodulePlugin.TRIGGER,
                            startOfLine: false,
                            items: ({ query }) => TextmodulePlugin.fetchSuggestions(query),
                            render: () => createMentionPopup(),
                            command: async ({ editor, range, props }): Promise<void> => {
                                let resolvedContent: string;
                                try {
                                    resolvedContent = await TextmodulePlugin.prepareTextContent(props);
                                } catch {
                                    return;
                                }

                                const safeContent = sanitizeTextmoduleHtml(resolvedContent);

                                try {
                                    editor
                                        .chain()
                                        .focus()
                                        .deleteRange(range)
                                        .insertContent(safeContent)
                                        .run();
                                } catch {
                                    // swallow Tiptap errors during insertion
                                }
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

                    handleDrop(view: any, event: DragEvent): boolean {
                        const fileList = event.dataTransfer?.files || null;
                        const file = fileList && fileList.length ? fileList.item(0) : null;
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

                    handlePaste(view: any, event: ClipboardEvent): boolean {
                        const cd = event.clipboardData || null;
                        const list = cd?.items;

                        if (list && list.length) {
                            const items: DataTransferItem[] = Array.from(list);

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
                        }

                        const text = cd?.getData('text/plain')?.trim();
                        if (text && /^https?:\/\/.+\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(text)) {
                            const node = view.state.schema.nodes.resizableImage.create({
                                src: text,
                                width: 300,
                                align: 'left',
                                isGif: /\.gif(\?.*)?$/i.test(text),
                            });
                            view.dispatch(view.state.tr.replaceSelectionWith(node));
                            event.preventDefault();
                            return true;
                        }

                        return false;
                    },

                    handleKeyDown(view: any, event: KeyboardEvent): boolean {
                        const { state } = view;
                        if (event.key === 'Enter') {
                            const inside = !!state.selection.$from?.parent?.isTextblock;
                            if (!inside) {
                                moveIntoNewParagraph(comp.editor);
                                applyLastUsedMarks(comp.editor);
                                event.preventDefault();
                                return true;
                            }
                        }

                        if (event.key === 'Enter') {
                            const { selection } = state;
                            const marks = state.storedMarks || selection.$from.marks();
                            setTimeout((): void => {
                                const newPos = comp.editor.state.selection.$from;
                                const currentNode = newPos.parent;

                                if (currentNode.type.name === 'paragraph') {
                                    let chain = comp.editor.chain().focus();
                                    let appliedFont = false;
                                    let appliedSize = false;
                                    let appliedColor = false;

                                    const ms = Array.isArray(marks) ? marks : Array.from(marks ?? []);
                                    for (const mark of ms) {
                                        if (mark.type.name === 'bold') chain.setMark('bold');
                                        if (mark.type.name === 'italic') chain.setMark('italic');
                                        if (mark.type.name === 'underline') {
                                            chain.setMark('underline');
                                        }

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
                                        if (mark.type.name === 'highlight') {
                                            const c = mark.attrs?.color;
                                            if (c) chain.setHighlight({ color: c });
                                        }
                                        if (mark.type.name === 'strike') chain.setMark('strike');
                                    }

                                    if (!appliedFont && comp.editor.storage.lastFontFamily) {
                                        chain.setFontFamily(comp.editor.storage.lastFontFamily);
                                    }
                                    if (!appliedSize && comp.editor.storage.lastFontSize) {
                                        chain.setFontSize(comp.editor.storage.lastFontSize);
                                    }
                                    if (!appliedColor && comp.editor.storage.lastFontColor) {
                                        chain.setColor(comp.editor.storage.lastFontColor);
                                    }

                                    chain.run();
                                }
                            }, 0);

                            return false;
                        }
                        return false;
                    },

                    handleDOMEvents: {
                        beforeinput: (_view: any, _ev: Event): boolean => {
                            const { state } = comp.editor;
                            const $from = state.selection.$from;
                            const isTB = !!$from?.parent?.isTextblock;

                            if (!isTB) return false;

                            const marks = state.storedMarks || $from.marks();
                            const tsMark = marks?.find((m: any) => m.type?.name === 'textStyle');
                            const hasExplicitTS =
                                !!tsMark &&
                                !!(tsMark.attrs?.fontFamily || tsMark.attrs?.fontSize || tsMark.attrs?.color);
                            if (hasExplicitTS) return false;

                            const isEmptyBlock =
                                $from.parent?.isTextblock && $from.parent.content.size === 0;
                            if (!isEmptyBlock) return false;

                            applyLastUsedMarks(comp.editor);
                            return false;
                        },
                    },

                    handleTextInput(
                        _view: any,
                        _from: number,
                        _to: number,
                        text: string
                    ): boolean {
                        if (!inTextblock(comp.editor)) {
                            moveIntoNewParagraph(comp.editor);
                            applyLastUsedMarks(comp.editor);

                            const chain: any = comp.editor.chain().focus();
                            if (typeof chain.insertText === 'function') {
                                chain.insertText(text).run();
                            } else {
                                chain.insertContent({ type: 'text', text }).run();
                            }
                            return true;
                        }
                        return false;
                    },
                },

                onUpdate: ({ editor }: { editor: any }): void => {
                    const rawHtml = editor.getHTML();
                    comp._lastRawHtml = rawHtml;

                    let cleanedHtml = rawHtml;
                    try {
                        cleanedHtml = prepareHtmlForEmail(rawHtml);
                    } catch {
                        /* noop */
                    }
                    comp._lastCleanHtml = cleanedHtml;

                    if (stylesWereLost(rawHtml, cleanedHtml)) {
                        cleanedHtml = rawHtml;
                    }

                    (comp as any).emit('valueChanged', cleanedHtml);
                },
            });

        try {
            this.editor = createEditor(initialContent, 'E1');
        } catch {
            const strippedOnce = stripCkWrapperEverywhere(this.value);
            const fixed = normalizeForTiptap(strippedOnce);
            this.editor = createEditor(fixed, 'E2');
        }

        Tiptap.Editor.prototype.getValue = (): any => {
            return comp.editor.getHTML();
        };

        Tiptap.Editor.prototype.addFocusListener = (listener: (value: string) => null): void => {
            comp.focusListener.push(listener);
        };

        Tiptap.Editor.prototype.addChangeListener = (listener: () => null): void => {
            comp.changeListener.push(listener);
        };

        Tiptap.Editor.prototype.disableFocusListener = comp.disableFocusListener;

        this.editor.addChangeListener(() => {
            if (this.changeTimeout) {
                clearTimeout(this.changeTimeout);
            } else {
                EventService.getInstance().publish(FormEvent.BLOCK, true);
            }
            this.changeTimeout = setTimeout(() => {
                if (!(this as any).isDestroyed()) {
                    const value = this.editor.getValue();
                    (this as any).emit('valueChanged', value);
                    EventService.getInstance().publish(FormEvent.BLOCK, false);
                }
                this.changeTimeout = null;
            }, this.editorTimeout);
            return null;
        });

        this.editor.addFocusListener(this.focusLostFallback.bind(this));


        const editor = this.editor;
        TiptapEditorService.getInstance().setActiveEditor(editor);

        const applyDefaultsIntoEmptyBlock = (ed: any): void => {
            const { state } = ed;
            const $from = state.selection.$from;

            const isEmptyBlock =
                $from.parent?.isTextblock && $from.parent.content.size === 0;
            if (!isEmptyBlock) return;

            let chain = ed.chain().focus();
            const lastFont = ed.storage.lastFontFamily || null;
            const lastSize = ed.storage.lastFontSize || null;
            const lastColor = ed.storage.lastFontColor || null;

            if (lastFont) chain = chain.setFontFamily(lastFont);
            if (lastSize) chain = chain.setFontSize(lastSize);
            if (lastColor) chain = chain.setColor(lastColor);
            if (ed.storage.lastBold) chain = chain.setMark('bold');
            if (ed.storage.lastItalic) chain = chain.setMark('italic');
            if (ed.storage.lastUnderline) chain = chain.setMark('underline');
            if (ed.storage.lastStrike) chain = chain.setMark('strike');
            if (ed.storage.lastHighlightColor) {
                chain = chain.setHighlight({ color: ed.storage.lastHighlightColor });
            }
            chain.run();
        };

        editor.on('transaction', ({ editor: ed, transaction }: any): void => {
            const { state } = ed;
            const $from = state.selection.$from;

            let blockDepth = $from.depth;
            while (blockDepth > 0 && !$from.node(blockDepth).isBlock) {
                blockDepth--;
            }

            const blockNode = $from.node(blockDepth);
            const parentNode = blockDepth > 0 ? $from.node(blockDepth - 1) : null;

            const indexInParent = parentNode ? $from.index(blockDepth - 1) : 0;

            const prevSibling =
                parentNode && indexInParent > 0 ? parentNode.child(indexInParent - 1) : null;

            const nextSibling =
                parentNode && indexInParent + 1 < parentNode.childCount
                    ? parentNode.child(indexInParent + 1)
                    : null;

            const isEmptyTextblock =
                !!blockNode?.isTextblock && blockNode.content.size === 0;

            const justAfterTableEmptyPara =
                isEmptyTextblock &&
                !!prevSibling &&
                prevSibling.type?.name === 'table';

            const justBeforeTableEmptyPara =
                isEmptyTextblock &&
                !!nextSibling &&
                nextSibling.type?.name === 'table';

            if (justAfterTableEmptyPara && prevSibling) {
                try {
                    let lastTextNode: any = null;

                    (prevSibling as any).descendants((node: any) => {
                        if (node.isText && node.marks && node.marks.length) {
                            lastTextNode = node;
                        }
                    });

                    if (lastTextNode) {
                        const marks = lastTextNode.marks || [];

                        ed.storage.lastBold = false;
                        ed.storage.lastItalic = false;
                        ed.storage.lastUnderline = false;
                        ed.storage.lastStrike = false;
                        ed.storage.lastHighlightColor = null;
                        ed.storage.lastFontFamily = null;
                        ed.storage.lastFontSize = null;
                        ed.storage.lastFontColor = null;

                        for (const mark of marks) {
                            switch (mark.type.name) {
                                case 'bold':
                                    ed.storage.lastBold = true;
                                    break;
                                case 'italic':
                                    ed.storage.lastItalic = true;
                                    break;
                                case 'underline':
                                    ed.storage.lastUnderline = true;
                                    break;
                                case 'strike':
                                    ed.storage.lastStrike = true;
                                    break;
                                case 'highlight':
                                    ed.storage.lastHighlightColor = mark.attrs?.color ?? null;
                                    break;
                                case 'textStyle':
                                    if (mark.attrs?.fontFamily) {
                                        ed.storage.lastFontFamily = mark.attrs.fontFamily;
                                    }
                                    if (mark.attrs?.fontSize) {
                                        ed.storage.lastFontSize = mark.attrs.fontSize;
                                    }
                                    if (typeof mark.attrs?.color !== 'undefined') {
                                        ed.storage.lastFontColor = mark.attrs.color ?? null;
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                } catch (e) {
                    console.warn(
                        '[Tiptap] Could not derive styles from table for paragraph after table:',
                        e,
                    );
                }
            }

            let inTable = false;
            for (let d = $from.depth; d > 0; d--) {
                const node = $from.node(d);
                if (!node) continue;
                if (node.type && (node.type.name === 'tableCell' || node.type.name === 'tableHeader')) {
                    inTable = true;
                    break;
                }
            }

            const inFormattingRegion =
                inTable || justAfterTableEmptyPara || justBeforeTableEmptyPara;

            if (transaction.docChanged && !justAfterTableEmptyPara) {
                const ts = ed.getAttributes('textStyle') || {};

                if (ts.fontFamily) {
                    ed.storage.lastFontFamily = ts.fontFamily;
                }
                if (ts.fontSize) {
                    ed.storage.lastFontSize = ts.fontSize;
                }

                ed.storage.lastFontColor = typeof ts.color !== 'undefined' ? ts.color : null;
            }

            if (inFormattingRegion) {
                if (ed.isActive('bold')) ed.storage.lastBold = true;
                if (ed.isActive('italic')) ed.storage.lastItalic = true;
                if (ed.isActive('underline')) ed.storage.lastUnderline = true;
                if (ed.isActive('strike')) ed.storage.lastStrike = true;

                const hl = ed.getAttributes('highlight')?.color;
                if (hl) ed.storage.lastHighlightColor = hl;
            } else {
                ed.storage.lastBold = ed.isActive('bold');
                ed.storage.lastItalic = ed.isActive('italic');
                ed.storage.lastUnderline = ed.isActive('underline');
                ed.storage.lastStrike = ed.isActive('strike');
                ed.storage.lastHighlightColor =
                    ed.getAttributes('highlight')?.color ?? null;
            }
        });

        editor.on('selectionUpdate', (): void => applyDefaultsIntoEmptyBlock(editor));

        const toolbar: HTMLDivElement = createToolbar(this.editor);
        mountElement.appendChild(toolbar);
        mountElement.appendChild(wrapper);

        function setPlainTypingDefaults(ed: any): void {
            const { state, view } = ed;
            const wantFamily = 'Arial';
            const wantSize = '14';
            const m = state.schema.marks as any;

            const stored: any[] = [];
            if (m.textStyle) {
                stored.push(m.textStyle.create({ fontFamily: wantFamily, fontSize: wantSize }));
            } else {
                if (m.fontFamily) stored.push(m.fontFamily.create({ fontFamily: wantFamily }));
                if (m.fontSize) stored.push(m.fontSize.create({ fontSize: wantSize }));
            }

            view.dispatch(state.tr.setStoredMarks(stored));

            ed.storage.lastFontFamily = wantFamily;
            ed.storage.lastFontSize = wantSize;
            ed.storage.lastFontColor = null;
            ed.storage.lastHighlightColor = null;
            ed.storage.lastBold = false;
            ed.storage.lastItalic = false;
            ed.storage.lastUnderline = false;
            ed.storage.lastStrike = false;
        }

        (function installEmptyDocDefaultReset(ed: any, toolbarEl: HTMLElement): void {
            const isOnlyEmptyParagraph = (): boolean => {
                const doc = ed.state.doc;
                return (
                    doc.childCount === 1 &&
                    doc.firstChild?.type?.name === 'paragraph' &&
                    doc.firstChild.content.size === 0
                );
            };

            const setToolbarUIToDefaults = (): void => {
                const hi = toolbarEl.querySelector('.highlight-icon') as HTMLElement | null;
                if (hi) hi.style.backgroundColor = 'transparent';
                const cp = toolbarEl.querySelector('.color-picker-wrapper') as HTMLElement | null;
                if (cp) cp.style.backgroundColor = 'transparent';
                const fontBtn = toolbarEl.querySelector('.tiptap-font-dropdown-button') as HTMLElement | null;
                if (fontBtn?.childNodes?.[0]) (fontBtn.childNodes[0] as any).textContent = 'Arial';
                const sizeBtn = toolbarEl.querySelector('.tiptap-fontsize-dropdown-button') as HTMLElement | null;
                if (sizeBtn?.childNodes?.[0]) (sizeBtn.childNodes[0] as any).textContent = '14px';
            };

            const ensureDefaultsIfEmpty = (): void => {
                if (!isOnlyEmptyParagraph()) return;

                setPlainTypingDefaults(ed);
                setToolbarUIToDefaults();

                try {
                    const pos = Math.max(1, ed.state.doc.content.size - 1);
                    ed.chain().setTextSelection(pos).run();
                } catch {
                    /* noop */
                }
            };

            ed.on('update', ensureDefaultsIfEmpty);
            ed.on('transaction', ({ transaction }: any) => {
                if (transaction.docChanged) ensureDefaultsIfEmpty();
            });

            ensureDefaultsIfEmpty();
        })(editor, toolbar);

        const saveRaw = (): void => {
            if (!this.editor) return;
            try {
                void this.editor.getHTML();
            } catch {
                /* noop */
            }
        };
        const onVisChange = (): void => {
            if (document.visibilityState === 'hidden') saveRaw();
        };
        const onBeforeUnload = (): void => {
            saveRaw();
        };

        document.addEventListener('visibilitychange', onVisChange);
        window.addEventListener('beforeunload', onBeforeUnload);

        this._onVisChange = onVisChange;
        this._onBeforeUnload = onBeforeUnload;
        this._saveRaw = saveRaw;
    }

    private focusLostFallback(): any {
        if (!(this as any).isDestroyed() && this.editor?.isFocusListenerEnabled()) {
            const editorValue = this.editor.getValue();
            (this as any).emit('focusLost', editorValue);
        }
    }

    public disableFocusListener(disableTimeout: number = 1000): void {
        this.focusListenerEnabled = false;
        setTimeout(() => {
            this.focusListenerEnabled = true;
        }, disableTimeout);
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
            try {
                void this.editor.getHTML().length;
            } catch {
                /* noop */
            }
            this.editor.destroy();
            this.editor = null;
        }
    }
}

module.exports = Component;