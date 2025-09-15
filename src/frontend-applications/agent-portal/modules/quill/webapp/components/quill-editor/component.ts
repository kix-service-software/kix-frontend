/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { TextmodulePlugin } from '../../core/TextmodulePlugin';

const { setupAutocomplete } = require('../../static/utils/quillAutocomplete');
const { createImageBubbleMenu } = require('../../static/utils/imageBubbleMenu');
const { prepareHtmlForOutput } = require('../../static/utils/prepareHtmlForOutput');

declare const Quill: any;

export class Component extends AbstractMarkoComponent<ComponentState> {
    private quill: any;
    private readOnly: boolean = false;
    private value: string = '';
    private autocompleteContainer: HTMLElement;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (!input) return;
        this.readOnly = input?.readOnly ?? false;
        this.value = input?.value ?? '';
    }

    public async onMount(): Promise<void> {
        const editorContainer = document.getElementById(this.state.editorId);
        if (!editorContainer) {
            console.error(`[❌] Editor container with ID "${this.state.editorId}" not found.`);
            return;
        }

        editorContainer.innerHTML = '';
        const editorElement = document.createElement('div');
        editorElement.classList.add('quill-editor-body');
        editorContainer.appendChild(editorElement);

        const toolbarOptions = [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            ['link', 'image', 'video', 'formula'],
            [{ header: 1 }, { header: 2 }],
            [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ direction: 'rtl' }],
            [{ size: ['small', false, 'large', 'huge'] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ['clean'],
            ['table']
        ];

        const styledHTML = prepareHtmlForOutput(this.value || '');

        if (this.readOnly) {
            editorElement.innerHTML = styledHTML;
            return;
        }

        try {
            const customEnterHandler = (range: any): boolean => {
                const currentFormat = this.quill.getFormat(range);
                this.quill.insertText(range.index, '\n', 'user');
                this.quill.setSelection(range.index + 1, 0, 'silent');
                Object.entries(currentFormat).forEach(([format, value]) => {
                    this.quill.format(format, value, 'user');
                });
                return false;
            };

            const Keyboard = Quill.import('modules/keyboard');
            Keyboard.DEFAULTS.bindings['blockquote empty enter'] = {
                key: 'Enter',
                handler: (range: any): boolean => customEnterHandler(range),
            };

            Keyboard.DEFAULTS.bindings['shift enter'] = {
                key: 'Enter',
                shiftKey: true,
                handler: (range: any): boolean => customEnterHandler(range),
            };

            const Font = Quill.import('formats/font');
            Font.whitelist = ['serif', 'monospace', 'arial', 'times-new-roman'];
            Quill.register(Font, true);

            this.quill = new Quill(editorElement, {
                theme: 'snow',
                readOnly: false,
                modules: {
                    toolbar: toolbarOptions,
                    'better-table': {
                        operationMenu: {
                            items: {
                                unmergeCells: { text: 'Unmerge cells' }
                            },
                            color: {
                                colors: ['red', 'green', 'yellow', 'blue', 'white'],
                                text: 'Background Colors'
                            }
                        }
                    },
                    clipboard: {
                        matchVisual: false,
                        keepSelection: true,
                        substituteBlockElements: false,
                        magicPasteLinks: false,
                        allowed: {
                            tags: ['table', 'thead', 'tbody', 'tr', 'td', 'th', 'p', 'br', 'div', 'span'],
                            attributes: ['style', 'colspan', 'rowspan', 'class']
                        }
                    }
                }
            });

            const toolbar = this.quill.getModule('toolbar');
            toolbar.addHandler('table', () => {
                const tableModule = this.quill.getModule('better-table');
                if (tableModule) {
                    tableModule.insertTable(3, 3);
                }
            });
        } catch (e) {
            console.error('❌ Failed to initialize Quill:', e);
            return;
        }

        try {
            this.autocompleteContainer = setupAutocomplete({
                quill: this.quill,
                container: editorContainer,
                getSuggestions: async (query: string) => {
                    return await TextmodulePlugin.fetchSuggestions(query);
                }
            });

            createImageBubbleMenu(this.quill);

            this.quill.clipboard.dangerouslyPasteHTML(0, styledHTML, 'silent');

            console.log('🚀 Quill onMount complete.');
            this.quill.on('text-change', (): void => {
                (this as any).emit('valueChanged', this.quill.getSemanticHTML());
            });
        } catch (e) {
            console.error('❌ Error during autocomplete/image bubble menu init:', e);
        }
    }

    public onDestroy(): void {
        if (this.quill) {
            this.quill.off('text-change');
            this.quill = null;
        }

        if (this.autocompleteContainer) {
            this.autocompleteContainer.remove();
        }

        const editorContainer = document.getElementById(this.state.editorId);
        if (editorContainer) {
            editorContainer.innerHTML = '';
        }

        const bubble = document.querySelector('.image-bubble-menu');
        if (bubble) {
            bubble.remove();
        }
    }
}

module.exports = Component;