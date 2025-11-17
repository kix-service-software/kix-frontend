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

declare const Tiptap: any;

export class Component extends AbstractMarkoComponent<ComponentState> {
    private editor: any;
    private readOnly: boolean;
    private value: string;

    private _onVisChange?: () => void;
    private _onBeforeUnload?: () => void;
    private _saveRaw?: () => void;

    private _lastRawHtml?: string;
    private _lastCleanHtml?: string;

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.readOnly = input.readOnly ?? false;
        this.value = input.value;
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
                enableContentCheck: true,
                onContentError: (_error): void => {
                    try {
                        const cleaned = normalizeForTiptap(comp.value);
                        comp.editor?.commands.setContent(cleaned, false);
                    } catch {
                        /* noop */
                    }
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
                            items: async ({ query }): Promise<any[]> =>
                                await TextmodulePlugin.fetchSuggestions(query),
                            render: (): any => createMentionPopup(),
                            command: async ({ editor, range, props }): Promise<void> => {
                                const c2 = await TextmodulePlugin.prepareTextContent(props);
                                editor.chain().focus().deleteRange(range).insertContent(c2).run();
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

        const editor = this.editor;

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
            if (!transaction.docChanged) return;

            const ts = ed.getAttributes('textStyle') || {};
            if (ts.fontFamily) ed.storage.lastFontFamily = ts.fontFamily;
            if (ts.fontSize) ed.storage.lastFontSize = ts.fontSize;
            if (ts.color) ed.storage.lastFontColor = ts.color;

            if (ed.isActive('bold')) ed.storage.lastBold = true;
            if (ed.isActive('italic')) ed.storage.lastItalic = true;
            if (ed.isActive('underline')) ed.storage.lastUnderline = true;
            if (ed.isActive('strike')) ed.storage.lastStrike = true;

            const hl = ed.getAttributes('highlight')?.color;
            if (hl) ed.storage.lastHighlightColor = hl;
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