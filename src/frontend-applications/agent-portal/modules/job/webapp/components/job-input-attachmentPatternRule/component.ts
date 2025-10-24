/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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

class Component extends FormInputComponent<[string, string, string], ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    private async update(): Promise<void> {
        this.state.labelPatternFilename = await TranslationService.translate('Translatable#Filename');
        this.state.labelPatternContentType = await TranslationService.translate('Translatable#ContentType');
        this.state.labelPatternDisposition = await TranslationService.translate('Translatable#Disposition');
    }

    public async onMount(): Promise<void> {
        await super.onMount();
    }

    protected async prepareMount(): Promise<void> {
        await super.prepareMount();
    }

    public async setCurrentValue(): Promise<void> {
        const formInstance = await this.context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<string>(this.state.field?.instanceId);
        if (value && Array.isArray(value.value)) {
            this.state.currentPatternFilename = value.value[0];
            this.state.currentPatternContentType = value.value[1];
            this.state.currentPatternDisposition = value.value[2];
        }
    }

    public valueFilenameChanged(event: any): void {
        if (event) {
            this.state.currentPatternFilename = event.target && event.target.value !== '' ? event.target.value : null;
            (this as any).emit(
                'valueChanged',
                [
                    this.state.currentPatternFilename, this.state.currentPatternContentType,
                    this.state.currentPatternDisposition
                ]
            );
            super.provideValue(
                [
                    this.state.currentPatternFilename, this.state.currentPatternContentType,
                    this.state.currentPatternDisposition
                ]
            );
        }
    }

    public valueContentTypeChanged(event: any): void {
        if (event) {
            this.state.currentPatternContentType = event.target && event.target.value !== '' ? event.target.value : null;
            (this as any).emit(
                'valueChanged',
                [
                    this.state.currentPatternFilename, this.state.currentPatternContentType,
                    this.state.currentPatternDisposition
                ]
            );
            super.provideValue(
                [
                    this.state.currentPatternFilename, this.state.currentPatternContentType,
                    this.state.currentPatternDisposition
                ]
            );
        }
    }

    public valueDispositionChanged(event: any): void {
        if (event) {
            this.state.currentPatternDisposition = event.target && event.target.value !== '' ? event.target.value : null;
            (this as any).emit(
                'valueChanged',
                [
                    this.state.currentPatternFilename, this.state.currentPatternContentType,
                    this.state.currentPatternDisposition
                ]
            );
            super.provideValue(
                [
                    this.state.currentPatternFilename, this.state.currentPatternContentType,
                    this.state.currentPatternDisposition
                ]
            );
        }
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

    public onDestroy(): void {
        super.onDestroy();
    }

}

module.exports = Component;
