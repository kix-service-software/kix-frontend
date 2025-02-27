/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { CKEditor5Configuration } from '../../model/CKEditor5Configuration';
import { CKEditor5 } from './CKEditor5';
import { CKEditor5Classes } from './CKEditor5Classes';

export class ResizePlugin {

    public static setEditorConfig(editorConfig: CKEditor5Configuration): void {
        return;
    }

    public static getPlugin(): any {
        const Plugin = CKEditor5.getCKEditorClass(CKEditor5Classes.Plugin);

        class Resize extends Plugin {

            init(): void {
                const editor = this.editor;
                this.editor.on('ready', () => {
                    const editorMainElement = editor.ui.view.element.querySelector('.ck-editor__main');
                    const height = editor.sourceElement.getAttribute('data-height') || editor.config.get('ResizableHeight.height');
                    const resize = editor.config.get('ResizableHeight.resize');

                    editor.editing.view.document.on('focus', () => {
                        editorMainElement.classList.add('ck-focused');
                        editorMainElement.classList.remove('ck-blurred');
                    });

                    editor.editing.view.document.on('blur', () => {
                        editorMainElement.classList.remove('ck-focused');
                        editorMainElement.classList.add('ck-blurred');
                    });

                    if (height) {
                        editorMainElement.style.height = height;
                    }

                    if (resize === undefined || resize === true) {
                        const minHeight = '15rem';
                        const maxHeight = editor.sourceElement.getAttribute('data-maxheight') || editor.config.get('ResizableHeight.maxHeight');
                        if (maxHeight === undefined || minHeight !== maxHeight) {
                            editor.ui.view.element.classList.add('resizable-mode');
                        }
                        if (maxHeight) {
                            editorMainElement.style.maxHeight = maxHeight;
                        }
                    }
                });

                this.editor.on('change:isReadOnly', (eventInfo, name, value) => {
                    const resize = editor.config.get('ResizableHeight.resize');
                    if ((resize === undefined || resize === true) && !value) {
                        const minHeight = '15rem';
                        const maxHeight = editor.sourceElement.getAttribute('data-maxheight') || editor.config.get('ResizableHeight.maxHeight');
                        if (maxHeight === undefined || minHeight !== maxHeight) {
                            editor.ui.view.element.classList.add('resizable-mode');
                        }
                        if (maxHeight) {
                            const editorMainElement = editor.ui.view.element.querySelector('.ck-editor__main');
                            editorMainElement.style.maxHeight = maxHeight;
                        }
                    } else {
                        editor.ui.view.element.classList.remove('resizable-mode');
                        const editorMainElement = editor.ui.view.element.querySelector('.ck-editor__main');
                        editorMainElement.style.maxHeight = '';
                    }
                });

            }

        }

        return Resize;
    }

}