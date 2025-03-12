/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { CKEditor5Configuration } from '../../model/CKEditor5Configuration';
import { CKEditor5Classes } from './CKEditor5Classes';
import { CKEditorService } from './CKEditorService';
import { ResizePlugin } from './ResizePlugin';
import { TextmodulePlugin } from './TextmodulePlugin';

export class CKEditor5 {

    public static editorTimeout = 2000;

    private editor: any;

    private handleOnInputChange: boolean = false;
    private updateTimeout: any;

    private heightSet: boolean = false;

    private readOnly: boolean = false;

    private changeListener: Array<() => null> = [];
    private focusListener: Array<(value: string) => null> = [];

    public constructor(public elementId: string) { }

    public addChangeListener(listener: () => null): void {
        this.changeListener.push(listener);
    }

    public addFocusListener(listener: (value: string) => null): void {
        this.focusListener.push(listener);
    }

    public async update(input: any): Promise<void> {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }

        this.updateTimeout = setTimeout(async () => {
            if (await this.waitForEditor()) {
                if (input.addValue) {
                    const viewFragment = this.editor.data.processor.toView(input.addValue);
                    const modelFragment = this.editor.data.toModel(viewFragment);
                    this.editor.model.insertContent(modelFragment);
                }

                const isFocused = (this.editor.focusManager && !this.editor.focusManager.hasFocus);
                // if editor has no value or is not focused, set 'new' value
                if (input.value !== null && (isFocused || !this.editor.getData())) {
                    let contentString = BrowserUtil.replaceInlineContent(
                        input.value ? input.value : '', input.inlineContent
                    );

                    const plainText: string = input.plainText;
                    const matches = plainText?.match(/(<.*?>)/g);
                    if (matches) {
                        for (const m of matches) {
                            let replacedString = m.replace(/>/g, '&gt;');
                            replacedString = replacedString.replace(/</g, '&lt;');
                            contentString = contentString.replace(m, replacedString);
                        }
                    }

                    if (this.editor.getData() !== contentString) {
                        this.handleOnInputChange = true;
                        const viewFragment = this.editor.data.processor.toView(contentString);
                        const modelFragment = this.editor.data.toModel(viewFragment);
                        this.editor.model.insertContent(modelFragment);
                        // this.editor.setData(contentString);
                        this.handleOnInputChange = false;
                    }
                    this.adjustEditorHeight();
                }

                if (typeof input.readOnly !== 'undefined' && input.readOnly !== null) {
                    this.readOnly = input.readOnly;
                    this.setReadOnlyMode();
                }
            }
        }, 50);
    }

    private setReadOnlyMode(): void {
        const toolbarElement = this.editor.ui.view.toolbar?.element;
        const menubarElement = this.editor.ui.view.menuBarView?.element;
        if (this.readOnly) {
            if (toolbarElement) {
                toolbarElement.style.display = 'none';
            }
            if (menubarElement) {
                menubarElement.style.display = 'none';
            }
            this.editor.enableReadOnlyMode(this.elementId);
        }
    }

    private async adjustEditorHeight(): Promise<void> {
        // adjust height only after initial insert, so check if already done
        if (!this.heightSet) {
            setTimeout(() => {
                const editorContentElement = this.getElementByXpath(
                    `//div[@id="${this.elementId}"]/following-sibling::div//div[contains(@class, "ck ck-content")]`
                );
                if (editorContentElement) {
                    const currentStyle = editorContentElement.getAttribute('style');
                    editorContentElement.setAttribute(
                        'style', `${currentStyle ? currentStyle : ''} height: ${editorContentElement.scrollHeight + 2}px;`
                    );
                }
            }, 100);
        }
    }

    private getElementByXpath(path: string): HTMLElement {
        return document.evaluate(
            path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
        ).singleNodeValue as HTMLElement;
    }

    public async create(): Promise<void> {
        const ClassicEditor = (window as any).KIX_CKEDITOR;
        const plugins = (window as any).KIX_CKEDITOR_PLUGINS;

        const editorConfig = await CKEditorService.getCKEditorConfiguration();
        editorConfig.plugins = [...plugins]; // don't overwrite initial list

        this.addPlugins(editorConfig);

        if (editorConfig.htmlSupport) {
            if (!Array.isArray(editorConfig.htmlSupport.allow)) {
                editorConfig.htmlSupport.allow = [];
            }

            editorConfig.htmlSupport.allow.push(
                {
                    name: /^(b|span|h1|h2|h3|ul|li|div|img|col|table|tr|td|blockquote)$/,
                    attributes: true,
                    classes: true,
                    styles: true
                }
            );
        }

        this.editor = await ClassicEditor.create(document.querySelector(`#${this.elementId}`), editorConfig);

        const success = await this.waitForEditor();

        if (success) {
            const changeListener = (): void => {
                if (!this.handleOnInputChange) {
                    this.changeListener.forEach((l) => l());
                }
            };

            if (this.editor) {
                this.editor.model.document.on('change:data', changeListener);
                this.editor.ui.focusTracker.on('change:isFocused', (evt, name, isFocused) => {
                    if (!isFocused) {
                        const value = this.editor.getData();
                        this.focusListener.forEach((fl) => fl(value));
                    }
                });
            }
        }
    }

    public waitForEditor(retryCount: number = 1): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            if (this.editor?.state === 'ready') {
                resolve(true);
            } else if (retryCount < (10)) {
                setTimeout(() => {
                    resolve(this.waitForEditor(++retryCount));
                }, 200);
            } else {
                resolve(false);
            }
        });
    }

    public getValue(): string {
        let value: string;
        if (this.editor) {
            value = this.editor.getData();
        }
        return value;
    }

    public destroy(): void {
        return;
    }

    private async addPlugins(editorConfig: CKEditor5Configuration): Promise<void> {
        editorConfig.plugins.push(TextmodulePlugin.getPlugin());
        TextmodulePlugin.setEditorConfig(editorConfig);

        editorConfig.plugins.push(ResizePlugin.getPlugin());
        ResizePlugin.setEditorConfig(editorConfig);
    }

    public static getCKEditorClass(className: CKEditor5Classes): any {
        let ckEditorClass: any;
        if (typeof window !== 'undefined') {
            ckEditorClass = (window as any)?.KIX_CKEDITOR_CLASSES[className];
        }
        return ckEditorClass;
    }

}
