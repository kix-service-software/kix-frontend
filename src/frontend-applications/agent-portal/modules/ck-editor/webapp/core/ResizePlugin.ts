/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { CKEditor5Configuration } from '../../model/CKEditor5Configuration';
import { CKEditor5 } from './CKEditor5';
import { CKEditor5Classes } from './CKEditor5Classes';

export default class ResizePlugin {

    public static setEditorConfig(editorConfig: CKEditor5Configuration): void {
        return;
    }

    public static getPlugin(): any {
        const Plugin = CKEditor5.getCKEditorClass(CKEditor5Classes.Plugin);

        class Resize extends Plugin {

            init(): void {
                const editor = this.editor;
                const css = `
                        .ck.resizable-mode .ck.ck-editor__main {
                            resize: vertical;
                            overflow: scroll;
                            height: 54.8px;
                            min-height: 54.8px;
                            max-height: 100vh;
                        }
                        .ck.resizable-mode .ck.ck-content.ck-editor__editable,
                        .ck.height-mode .ck.ck-content.ck-editor__editable {
                            height: auto !important;
                            min-height: 90%;
                        }
                        .ck .ck.ck-editor__main {
                            border-radius: var(--ck-border-radius);
                            border-top-left-radius: 0;
                            border-top-right-radius: 0;
                            border: 1px solid var(--ck-color-base-border);
                        }
                        .ck .ck.ck-editor__main.ck-focused {
                            border-color: var(--ck-color-focus-border);
                        }
                        .ck .ck.ck-content.ck-editor__editable {
                            border: 0 !important;
                            overflow: visible;
                        }
                    `;
                const head = document.head || document.getElementsByTagName('head')[0];
                const style: any = document.createElement('style');

                style.type = 'text/css';
                if (style.styleSheet) {
                    style.styleSheet.cssText = css;
                } else {
                    style.appendChild(document.createTextNode(css));
                }

                head.appendChild(style);

                this.editor.on('ready', () => {
                    const editorMainElement = editor.ui.view.element.querySelector('.ck.ck-editor__main');
                    const editorContentElement = editorMainElement.querySelector('.ck.ck-content.ck-editor__editable');
                    const height = editor.sourceElement.getAttribute('data-height') || editor.config.get('ResizableHeight.height');
                    const resize = editor.config.get('ResizableHeight.resize');

                    editor.editing.view.document.on('focus', () => {
                        const editorMainElement = editor.ui.view.element.querySelector('.ck-editor__main');
                        editorMainElement.classList.add('ck-focused');
                        editorMainElement.classList.remove('ck-blurred');
                    });

                    editor.editing.view.document.on('blur', () => {
                        const editorMainElement = editor.ui.view.element.querySelector('.ck-editor__main');
                        editorMainElement.classList.remove('ck-focused');
                        editorMainElement.classList.add('ck-blurred');
                    });

                    if (height) {
                        editorMainElement.style.height = height;
                        editor.ui.view.element.classList.add('height-mode');
                    }

                    if (resize === undefined || resize === true) {
                        const minHeight = '15rem';
                        const maxHeight = editor.sourceElement.getAttribute('data-maxheight') || editor.config.get('ResizableHeight.maxHeight');
                        if (minHeight === undefined || maxHeight === undefined || minHeight !== maxHeight) {
                            editor.ui.view.element.classList.add('resizable-mode');
                        }
                        if (minHeight) {
                            editorMainElement.style.minHeight = minHeight;
                        }
                        if (maxHeight) {
                            editorMainElement.style.maxHeight = maxHeight;
                        }
                    }
                });

            }

        }

        return Resize;
    }

}