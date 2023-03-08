/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../core/FormInputComponent';
import { ContextService } from '../../core/ContextService';

declare const JSONEditor: any;

class Component extends FormInputComponent<string, ComponentState> {

    private editor: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        if (this.state.field && this.state.field?.options) {
            setTimeout(() => {
                this.initCodeEditor();
                if (this.state.currentValue) {
                    this.editor?.setText(this.state.currentValue);
                }
            }, 100);
        }
    }

    private initCodeEditor(): void {
        const container = (this as any).getEl('jsoneditor-' + this.state.field.id);
        if (container) {
            const options = {
                search: false,
                history: false,
                mode: 'code',
                onChange: (): void => {
                    this.handleValueChanged(this.editor.getText());
                }
            };
            this.editor = new JSONEditor(container, options);
            // TODO: schema from field options?
            // this.editor?.setSchema(schema, schemaRefs);
        }
    }

    public async onDestroy(): Promise<void> {
        super.onDestroy();
        if (this.editor) {
            this.editor.destroy();
        }
    }

    public async setCurrentValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<string>(this.state.field?.instanceId);
        if (value) {
            this.state.currentValue = value.value;
        }
    }

    private handleValueChanged(value: string): void {
        this.state.currentValue = value;
        (this as any).emit('valueChanged', this.state.currentValue);
        super.provideValue(this.state.currentValue);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

}

module.exports = Component;
