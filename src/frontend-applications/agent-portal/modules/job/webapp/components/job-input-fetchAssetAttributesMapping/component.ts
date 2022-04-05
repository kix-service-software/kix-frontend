/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../base-components/webapp/core/FormInputComponent';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';

class Component extends FormInputComponent<[string, string], ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    private async update(): Promise<void> {
        this.state.assetLabel = await TranslationService.translate('Translatable#Attribute');
        this.state.dfLabel = await TranslationService.translate('Translatable#DynamicField');
    }

    public async onMount(): Promise<void> {
        await super.onMount();
    }

    public async setCurrentValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<string>(this.state.field?.instanceId);
        if (value && Array.isArray(value.value)) {
            this.state.currentAssetValue = value.value[0];
            this.state.currentDfValue = value.value[1];
        }
    }

    public assetValueChanged(event: any): void {
        if (event) {
            this.state.currentAssetValue = event.target && event.target.value !== '' ? event.target.value : null;
            (this as any).emit('valueChanged', [this.state.currentAssetValue, this.state.currentDfValue]);
            super.provideValue([this.state.currentAssetValue, this.state.currentDfValue]);
        }
    }
    public dfValueChanged(event: any): void {
        if (event) {
            this.state.currentDfValue = event.target && event.target.value !== '' ? event.target.value : null;
            (this as any).emit('valueChanged', [this.state.currentAssetValue, this.state.currentDfValue]);
            super.provideValue([this.state.currentAssetValue, this.state.currentDfValue]);
        }
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

}

module.exports = Component;
