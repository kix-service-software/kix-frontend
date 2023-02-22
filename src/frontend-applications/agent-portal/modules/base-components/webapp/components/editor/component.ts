/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AutocompleteFormFieldOption } from '../../../../../model/AutocompleteFormFieldOption';
import { IKIXObjectService } from '../../../../../modules/base-components/webapp/core/IKIXObjectService';
import { PlaceholderService } from '../../../../../modules/base-components/webapp/core/PlaceholderService';
import { ServiceRegistry } from '../../../../../modules/base-components/webapp/core/ServiceRegistry';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { SysConfigKey } from '../../../../sysconfig/model/SysConfigKey';
import { SysConfigService } from '../../../../sysconfig/webapp/core';
import { TextModule } from '../../../../textmodule/model/TextModule';
import { BrowserUtil } from '../../core/BrowserUtil';
import { ComponentState } from './ComponentState';

declare let CKEDITOR: any;

class EditorComponent {

    public state: ComponentState;
    private editor: any;
    private autoCompletePlugins: any[] = [];
    private useReadonlyStyle: boolean = false;
    private changeTimeout: any;
    private createTimeout: any;
    private maxReadyTries: number;

    private handleOnInputChange: boolean = false;

    public onCreate(input: any): void {
        this.state = new ComponentState(
            input.inline,
            input.simple,
            input.readOnly,
            input.invalid,
            input.noImages,
            input.resize,
            input.resizeDir
        );
    }

    public onInput(input: any): void {
        this.update(input);
        const maxTries = input.maxReadyTries ? Number(input.maxReadyTries) : 10;
        this.maxReadyTries = !isNaN(maxTries) && maxTries > 10
            ? maxTries : 10;
    }

    private async update(input: any): Promise<void> {
        this.useReadonlyStyle = typeof input.useReadonlyStyle !== 'undefined' ? input.useReadonlyStyle : false;
        if (await this.isEditorReady()) {
            if (input.addValue) {
                this.editor.insertHtml(input.addValue);
            }

            // if editor has no value or is not focused, set "new" value
            if (
                input.value !== null
                && (
                    (this.editor.focusManager && !this.editor.focusManager.hasFocus)
                    || !this.editor.getData()
                )
            ) {
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
                    this.editor.setData(contentString, () => {
                        this.editor.updateElement();
                        this.handleOnInputChange = false;
                    });
                }
            }

            if (typeof input.readOnly !== 'undefined' && this.state.readOnly !== input.readOnly) {
                this.state.readOnly = input.readOnly;
                this.editor.setReadOnly(this.state.readOnly);
            }

            if (this.useReadonlyStyle) {
                if (await this.isEditorReady()) {
                    setTimeout(() => {
                        const element = document.getElementById('cke_' + this.state.id);
                        if (element) {
                            const iframe = element.getElementsByTagName('iframe')[0];
                            iframe.contentWindow.document.body.style.backgroundColor = 'transparent';
                            iframe.classList.remove('cke_wysiwyg_frame', 'cke_reset');
                            iframe.classList.add('readonly-ck-editor');
                        }
                    }, 500);
                }
            }
        }
        this.state.invalid = typeof input.invalid !== 'undefined' ? input.invalid : false;
    }

    public async onMount(): Promise<void> {
        this.autoCompletePlugins = [];

        if (!this.instanceExists()) {
            if (this.createTimeout) {
                window.clearTimeout(this.createTimeout);
                this.createTimeout = null;
            }

            CKEDITOR.on('instanceCreated', async function () {
                const configValue = await SysConfigService.getInstance().getSysConfigOptionValue(
                    SysConfigKey.FRONTEND_RICHTEXT_DEFAULT_CSS
                );

                let defaultCSS = '';
                let jsonOptions: any[];
                try {
                    jsonOptions = JSON.parse(configValue);
                } catch (e) {
                    jsonOptions = [];
                }
                for (const css of jsonOptions) {
                    if (
                        css?.Selector
                        && css?.Value
                    ) {
                        defaultCSS += css.Selector + '{' + css.Value + '}';
                    }
                }
                if (defaultCSS) {
                    CKEDITOR.addCss(defaultCSS);
                }
            });

            this.createTimeout = setTimeout(async () => {
                if (!this.state.readOnly) {
                    const userLanguage = await TranslationService.getUserLanguage();
                    if (userLanguage) {
                        this.state.config['language'] = userLanguage;
                    }
                }

                if (this.state.inline) {
                    this.editor = CKEDITOR.inline(this.state.id, {
                        ...this.state.config
                    });
                } else {
                    this.editor = CKEDITOR.replace(this.state.id, {
                        ...this.state.config
                    });
                }

                const changeListener = (): void => {
                    if (!this.handleOnInputChange) {
                        if (this.changeTimeout) {
                            window.clearTimeout(this.changeTimeout);
                            this.changeTimeout = null;
                        }

                        this.changeTimeout = setTimeout(() => {
                            const value = this.editor.getData();
                            (this as any).emit('valueChanged', value);
                            this.changeTimeout = null;
                        }, 200);
                    }
                };

                this.editor.on('change', changeListener);
                this.editor.on('mode', () => {
                    const editable = this.editor.editable();
                    if (editable) {
                        if (this.editor.mode === 'source') {
                            editable.attachListener(editable, 'input', changeListener);
                        } else {
                            editable.removeListener('input', changeListener);
                        }
                    }
                });

                if (this.state.readOnly) {
                    this.editor.on('contentDom', () => {
                        const editable = this.editor.editable();
                        editable.attachListener(editable, 'click', (evt) => {
                            const link = new CKEDITOR.dom.elementPath(evt.data.getTarget(), this).contains('a');
                            if (link && evt.data.$.button !== 2 && link.isReadOnly()) {
                                window.open(link.getAttribute('href'));
                            }
                        });
                    });
                }

                if (await this.isEditorReady()) {
                    if (this.state.noImages && this.editor.pasteFilter) {
                        this.editor.pasteFilter.disallow('img');
                    }
                }
            }, 50);
        }
    }

    public async setAutocompleteConfiguration(autocompleteOption: AutocompleteFormFieldOption): Promise<void> {
        if (await this.isEditorReady()) {
            for (const ao of autocompleteOption.autocompleteObjects) {
                const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(ao.objectType);
                if (service) {
                    const config = await service.getAutoFillConfiguration(
                        CKEDITOR.plugins.textMatch, ao.placeholder
                    );
                    if (config) {
                        const plugin = new CKEDITOR.plugins.autocomplete(this.editor, config);
                        // overwrite plugin commit function
                        plugin.commit = async function (itemId): Promise<void> {
                            if (!this.model.isActive) {
                                return;
                            }

                            this.close();

                            // edit: check also for undefined
                            // if ( itemId == null ) {
                            if (itemId === null || typeof itemId === 'undefined') {
                                itemId = this.model.selectedItemId;

                                // If non item is selected abort commit.
                                if (itemId === null) {
                                    return;
                                }
                            }

                            const item = this.model.getItemById(itemId);
                            const editor = this.editor;

                            editor.fire('saveSnapshot');
                            editor.getSelection().selectRanges([this.model.range]);

                            // edit: handle text placeholder
                            // editor.insertHtml( this.getHtmlToInsert( item ), 'text' );
                            const text = this.outputTemplate ? this.outputTemplate.output(item) : item.name;
                            const preparedText = await PlaceholderService.getInstance().replacePlaceholders(
                                text, null, (item as TextModule).Language
                            );
                            editor.insertHtml(preparedText, 'text');
                            editor.fire('saveSnapshot');
                        };
                        this.autoCompletePlugins.push(plugin);
                    }
                }
            }
        }
    }

    // TODO: bessere Lösung finden (im Moment gibt es warnings im Log, ...->
    // weil der Editor schon kurz nach Instanziierung wieder zerstört wird)
    public async onDestroy(): Promise<void> {
        if (this.createTimeout) {
            window.clearTimeout(this.createTimeout);
            this.createTimeout = null;
        }
        if (this.instanceExists()) {
            this.autoCompletePlugins.forEach((p) => p.close());
            this.editor.destroy();
        }
    }

    /**
     * Checks if editor is ready (with timeout recursion), stops after 10 attempts
     *
     * @param retryCount optional - number of attempts (default: starts with 1)
     *
     * @return boolean (promise)
     */
    private async isEditorReady(retryCount: number = 1): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            if (
                this.instanceExists() &&
                this.editor.status === 'ready'
            ) {
                resolve(true);
            } else if (retryCount < (this.maxReadyTries || 10)) {
                setTimeout(() => {
                    resolve(this.isEditorReady(++retryCount));
                }, 200);
            } else {
                resolve(false);
            }
        });
    }

    /**
     * Checks if an instance exists
     *
     * @return boolean
     */
    private instanceExists(): boolean {
        return Boolean(CKEDITOR?.instances && CKEDITOR.instances[this.state.id]);
    }

}

module.exports = EditorComponent;

