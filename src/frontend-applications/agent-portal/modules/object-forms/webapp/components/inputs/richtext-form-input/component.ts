/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { FormValueProperty } from '../../../../model/FormValueProperty';
import { ObjectFormValue } from '../../../../model/FormValues/ObjectFormValue';
import { RichTextFormValue } from '../../../../model/FormValues/RichTextFormValue';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    private bindingIds: string[];
    private formValue: RichTextFormValue;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (this.formValue?.instanceId !== input.formValue?.instanceId) {
            this.formValue?.removePropertyBinding(this.bindingIds);
            this.formValue = input.formValue;
            this.update();
        }
    }

    private async update(): Promise<void> {
        this.bindingIds = [];

        this.bindingIds.push(
            this.formValue?.addPropertyBinding(
                FormValueProperty.VALUE, async (formValue: RichTextFormValue) => {
                    this.state.currentValue = formValue.value;
                }
            )
        );

        this.bindingIds.push(
            this.formValue.addPropertyBinding(FormValueProperty.READ_ONLY, (formValue: ObjectFormValue) => {
                this.state.readonly = formValue.readonly;
            })
        );

        this.state.currentValue = this.formValue?.value;
        this.state.readonly = this.formValue?.readonly;
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.state.noImages = this.formValue?.noImages;

        this.state.prepared = true;

        setTimeout(() => {
            const autocompleteOption = this.formValue?.autocompleteOption;
            if (autocompleteOption) {
                const component = (this as any).getComponent(this.state.editorId);
                if (component) {
                    component.setAutocompleteConfiguration(autocompleteOption);
                }
            }
        }, 150);
    }

    public async onDestroy(): Promise<void> {
        if (this.bindingIds?.length && this.formValue) {
            this.formValue.removePropertyBinding(this.bindingIds);
        }
    }

    public valueChanged(value: string): void {
        this.state.currentValue = value;
        if (this.state.currentValue === '') {
            this.state.currentValue = null;
        }
        this.formValue?.setFormValue(this.state.currentValue);
    }

}

module.exports = Component;
