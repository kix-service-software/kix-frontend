/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { ContextService } from '../../core/ContextService';
import { FormFieldOptions } from '../../../../../model/configuration/FormFieldOptions';

declare let CodeMirror: any;

class Component extends FormInputComponent<string, ComponentState> {

    private codeMirror: any;

    private createEditorTimeout: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);

        this.initCodeEditor();
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        const placeholderText = this.state.field?.placeholder
            ? this.state.field?.placeholder
            : this.state.field?.required ? this.state.field?.label : '';

        this.state.placeholder = await TranslationService.translate(placeholderText);
        if (this.state.field && this.state.field?.options) {
            const rowOption = this.state.field?.options.find(
                (o) => o.option === 'ROWS'
            );
            if (rowOption && !isNaN(Number(rowOption.value)) && rowOption.value > 0) {
                this.state.rows = Number(rowOption.value);
            } else {
                this.state.rows = 5;
            }

            this.state.prepared = true;

            this.initCodeEditor();
        }
    }

    private initCodeEditor(): void {
        const languageOption = this.state.field?.options?.find(
            (o) => o.option === FormFieldOptions.LANGUAGE
        );

        if (languageOption?.value) {
            this.state.useEditor = true;

            if (this.codeMirror) {
                this.codeMirror.options.mode = languageOption.value;
                this.codeMirror.refresh();
                return;
            }

            if (this.createEditorTimeout) {
                window.clearTimeout(this.createEditorTimeout);
            }
            this.createEditorTimeout = setTimeout(() => {
                const textareaElement = (this as any).getEl(this.state.field?.instanceId);
                if (textareaElement) {
                    this.codeMirror = CodeMirror.fromTextArea(
                        textareaElement,
                        {
                            value: this.state.currentValue,
                            lineNumbers: true,
                            mode: languageOption.value,
                            readOnly: this.state.field?.readonly,
                            lineWrapping: true,
                            foldGutter: true,
                            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
                            extraKeys: {
                                'Ctrl-Space': 'autocomplete'
                            }
                        }
                    );

                    this.codeMirror.on('blur', (instance: any, changeObject: any) => {
                        this.handleValueChanged(instance.getValue());
                    });

                    CodeMirror.commands.autocomplete = (cm): void => {
                        CodeMirror.showHint(cm, CodeMirror.hint.sql, {
                            tables: {
                                'table1': ['col_A', 'col_B', 'col_C'],
                                'table2': ['other_columns1', 'other_columns2']
                            }
                        });
                    };

                    this.createEditorTimeout = null;
                }
            }, 500);
        }
    }

    public async onDestroy(): Promise<void> {
        super.onDestroy();
    }

    public async setCurrentValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<string>(this.state.field?.instanceId);
        if (value) {
            this.state.currentValue = value.value;
        }
    }

    public valueChanged(event: any): void {
        if (event) {
            this.handleValueChanged(event.target && event.target.value !== '' ? event.target.value : null);
        }
    }

    private handleValueChanged(value: string): void {
        if (!this.codeMirror) {
            this.state.currentValue = value;
        }

        (this as any).emit('valueChanged', value);
        super.provideValue(value);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

}

module.exports = Component;
