/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextMode } from '../../../../../model/ContextMode';
import { IdService } from '../../../../../model/IdService';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { FormValuesChangedEventData } from '../../../../base-components/webapp/core/FormValuesChangedEventData';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { Cell } from '../../../../base-components/webapp/core/table';
import { DynamicFormFieldOption } from '../../../../dynamic-fields/webapp/core';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ConfigItem } from '../../../model/ConfigItem';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    private configItemId: number;
    private formSubscriber: IEventSubscriber;

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
        const formInstance = context?.descriptor?.contextMode !== ContextMode.DETAILS ?
            await context?.getFormManager().getFormInstance() : null;
        const affectedAssettField = await formInstance?.getFormFieldByProperty(
            'DynamicField.AffectedAsset'
        );

        if (affectedAssettField) {
            this.addFormListener();
        } else {
            this.state.readonly = true;
        }

        // set inital state by object (details) / formObject ("dialog")
        const object = await context?.getObject();
        const affectedAssetsDF = object?.DynamicFields.find((df) => df.Name === 'AffectedAsset');
        if (affectedAssetsDF) {
            this.setStates(affectedAssetsDF.Value);
        }
    }

    private addFormListener(): void {
        this.formSubscriber = {
            eventSubscriberId: IdService.generateDateBasedId('add-to-affected-asset-cell'),
            eventPublished: (data: FormValuesChangedEventData, eventId: string): void => {
                const affectedAssetsValue = data.changedValues.find((cv) =>
                    cv[0]?.property === KIXObjectProperty.DYNAMIC_FIELDS &&
                    cv[0]?.options?.some((o) =>
                        o.option === DynamicFormFieldOption.FIELD_NAME &&
                        o.value === 'AffectedAsset'
                    )
                );
                if (affectedAssetsValue && affectedAssetsValue[1]) {
                    this.setStates(affectedAssetsValue[1].value);
                }
            }
        };
        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
    }

    private async setStates(value: any): Promise<void> {
        this.state.checked = Array.isArray(value) ?
            value.some((v) => Number(v) === this.configItemId) :
            false;
        this.state.title = await TranslationService.translate(
            this.state.readonly ?
                'Translatable#Contained in Affected Assets' :
                this.state.checked ?
                    'Translatable#Remove from Affected Assets' :
                    'Translatable#Add to Affected Assets'
        );
    }

    public onDestroy(): void {
        if (this.formSubscriber) {
            EventService.getInstance().unsubscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
        }
    }

    public async addChanged(event: any): Promise<void> {
        event.stopPropagation();
        event.preventDefault();

        this.state.checked = !this.state.checked;

        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager().getFormInstance();
        if (formInstance) {
            const currentFieldValue = await formInstance.getFormFieldValueByProperty<number[]>(
                'DynamicField.AffectedAsset'
            );
            let currentValue: number[] = [];
            if (Array.isArray(currentFieldValue?.value)) {
                currentValue = currentFieldValue.value;
            }
            const idIndex = currentValue.findIndex((id) => Number(id) === this.configItemId);
            if (this.state.checked && idIndex === -1) {
                currentValue.push(this.configItemId);
                formInstance.provideFormFieldValuesForProperties(
                    [['DynamicField.AffectedAsset', currentValue]], null
                );
            } else if (!this.state.checked && idIndex !== -1) {
                currentValue.splice(idIndex, 1);
                formInstance.provideFormFieldValuesForProperties(
                    [['DynamicField.AffectedAsset', currentValue]], null
                );
            }
        }
    }

}

module.exports = Component;
