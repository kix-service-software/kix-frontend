/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponent } from '../../../../base-components/webapp/core/FormInputComponent';
import { ComponentState } from './ComponentState';
import { FormService } from '../../../../base-components/webapp/core/FormService';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { AdditionalContextInformation } from '../../../../base-components/webapp/core/AdditionalContextInformation';
import { IdService } from '../../../../../model/IdService';
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { DynamicFieldProperty } from '../../../model/DynamicFieldProperty';
import { DynamicFieldService } from '../../core/DynamicFieldService';
import { FormContext } from '../../../../../model/configuration/FormContext';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { FormValuesChangedEventData } from '../../../../base-components/webapp/core/FormValuesChangedEventData';

declare var JSONEditor: any;

class Component extends FormInputComponent<JSON, ComponentState> {

    private schema: JSON = null;
    private editor: any;
    private formSubscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.formSubscriber = {
            eventSubscriberId: this.state.field?.instanceId,
            eventPublished: async (data: FormValuesChangedEventData, eventId: string) => {
                const typeValue = data.changedValues.find(
                    (cv) => cv[0] && cv[0].property === DynamicFieldProperty.FIELD_TYPE
                );
                if (typeValue && typeValue[1]) {
                    if (typeValue[1].value) {
                        if (this.state.formContext === FormContext.NEW) {
                            setTimeout(() => this.createEditor(typeValue[1].value, null), 50);
                        }
                    } else {
                        await this.destroyEditor();
                        this.state.prepared = false;
                    }
                }
            }
        };
        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
    }

    public async setCurrentValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const defaultValue = formInstance.getFormFieldValue<number>(this.state.field?.instanceId);

        const typeValue = await formInstance.getFormFieldValueByProperty<string>(DynamicFieldProperty.FIELD_TYPE);
        if (typeValue && typeValue.value && typeValue.value) {
            await this.createEditor(typeValue.value, defaultValue ? defaultValue.value : null);
        }
    }

    private async createEditor(type: string, value?: any): Promise<void> {
        this.destroyEditor();
        this.schema = await DynamicFieldService.getInstance().getConfigSchema(type);
        if (this.schema) {
            this.state.prepared = true;

            setTimeout(() => {
                const element = document.getElementById(this.state.editorId);
                if (element) {
                    this.editor = new JSONEditor(element, {
                        schema: this.schema,
                        disable_edit_json: true,
                        disable_properties: true,
                        array_controls_top: true,
                        disable_array_delete_last_row: true,
                        disable_array_delete_all_rows: true,
                        disable_array_reorder: true
                    });

                    if (value) {
                        this.editor.setValue(value);
                    }

                    this.editor.on('change', this.valueChanged.bind(this));
                }
            }, 200);
        }
    }

    private valueChanged(): void {
        if (this.editor) {
            const config = this.editor.getValue();
            super.provideValue(config);
        }
    }

    public async onDestroy(): Promise<void> {
        this.destroyEditor();
        EventService.getInstance().unsubscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
    }

    private destroyEditor(): void {
        if (this.editor) {
            this.editor.destroy();
            this.editor = null;
        }
    }

}

module.exports = Component;
