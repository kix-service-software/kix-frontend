/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextMode } from '../../../../../model/ContextMode';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { Cell } from '../../../../table/model/Cell';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ConfigItem } from '../../../model/ConfigItem';
import { ComponentState } from './ComponentState';
import { Ticket } from '../../../../ticket/model/Ticket';
import { FormValueProperty } from '../../../../object-forms/model/FormValueProperty';
import { ObjectFormValue } from '../../../../object-forms/model/FormValues/ObjectFormValue';

class Component extends AbstractMarkoComponent<ComponentState> {

    private configItemId: number;
    private formValue: ObjectFormValue;
    private formValueBindingId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        const cell: Cell = input.cell;
        if (cell) {
            const configItemId: ConfigItem = cell.getRow()?.getRowObject()?.getObject();
            this.configItemId = Number(configItemId?.ConfigItemID);
        }
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();

        const ticket = await context?.getObject<Ticket>();
        if (context?.descriptor?.contextMode === ContextMode.DETAILS) {
            this.state.readonly = true;
        } else {
            const formHandler = await context.getFormManager().getObjectFormHandler();
            this.formValue = formHandler?.objectFormValueMapper?.findFormValue('DynamicField.AffectedAsset');
            this.formValueBindingId = this.formValue?.addPropertyBinding(FormValueProperty.VALUE, (value: any) => {
                this.setStates(value?.value);
            });
        }

        const affectedAssetsDF = ticket?.DynamicFields.find((df) => df.Name === 'AffectedAsset');
        if (affectedAssetsDF) {
            this.setStates(affectedAssetsDF.Value);
        }
    }

    private async setStates(value: any): Promise<void> {
        this.state.checked = Array.isArray(value)
            ? value.some((v) => Number(v) === this.configItemId)
            : false;

        let title = 'Translatable#Contained in Affected Assets';
        if (!this.state.readonly) {
            title = this.state.checked
                ? 'Translatable#Remove from Affected Assets'
                : 'Translatable#Add to Affected Assets';
        }

        this.state.title = await TranslationService.translate(title);
    }

    public onDestroy(): void {
        if (this.formValueBindingId) {
            this.formValue?.removePropertyBinding([this.formValueBindingId]);
        }
    }

    public async addChanged(event: any): Promise<void> {
        event.stopPropagation();
        event.preventDefault();

        this.state.checked = !this.state.checked;

        const currentValue: number[] = this.formValue?.value || [];
        const idIndex = currentValue.findIndex((id) => Number(id) === this.configItemId);
        if (this.state.checked && idIndex === -1) {
            currentValue.push(this.configItemId);
            this.formValue?.setFormValue(currentValue);
        } else if (!this.state.checked && idIndex !== -1) {
            currentValue.splice(idIndex, 1);
            this.formValue?.setFormValue(currentValue);
        }
    }

}

module.exports = Component;
