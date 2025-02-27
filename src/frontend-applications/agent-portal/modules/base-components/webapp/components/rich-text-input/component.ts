/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { ContextService } from '../../core/ContextService';

class Component extends FormInputComponent<string, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);

        if (!this.state.noImages) {
            const noImagesOption = this.state.field?.options.find((o) => o.option === 'NO_IMAGES');
            if (noImagesOption) {
                this.state.noImages = Boolean(noImagesOption.value);
            }
        }
    }

    public async onMount(): Promise<void> {
        await super.onMount();
    }

    public async setCurrentValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = context?.getFormManager()?.getFormInstance();
        const value = (await formInstance).getFormFieldValue<string>(this.state.field?.instanceId);
        if (value) {
            this.state.currentValue = value.value;
        }
    }

    public valueChanged(value: string): void {
        this.state.currentValue = value;
        if (this.state.currentValue === '') {
            this.state.currentValue = null;
        }
        super.provideValue(this.state.currentValue);
    }

}

module.exports = Component;
