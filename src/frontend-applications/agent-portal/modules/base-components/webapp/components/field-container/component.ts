/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { ServiceRegistry } from '../../../../../modules/base-components/webapp/core/ServiceRegistry';
import { KIXObjectFormService } from '../../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { ServiceType } from '../../../../../modules/base-components/webapp/core/ServiceType';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { DynamicFormFieldOption } from '../../../../dynamic-fields/webapp/core';
import { ContextService } from '../../core/ContextService';
import { EventService } from '../../core/EventService';
import { FormEvent } from '../../core/FormEvent';
import { IEventSubscriber } from '../../core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';

class Component {

    private state: ComponentState;
    private formId: string;
    private fields: FormFieldConfiguration[];
    private updateTimeout: any;
    private formSubscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.level = typeof input.level !== 'undefined' ? input.level : 0;
        this.formId = input.formId;
        this.fields = input.fields;
        this.initFields(this.fields);
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Add', 'Translatable#Delete'
        ]);

        this.initFields(this.fields);

        this.formSubscriber = {
            eventSubscriberId: IdService.generateDateBasedId('fields-container-'),
            eventPublished: async (data: any, eventId: string): Promise<void> => {
                const isUpdateEvent = eventId === FormEvent.FIELD_REMOVED
                    || eventId === FormEvent.FIELD_CHILDREN_ADDED;

                if (
                    isUpdateEvent &&
                    (
                        this.state.fields[0]?.parentInstanceId === data?.parent?.instanceId ||
                        this.state.fields[0]?.parentInstanceId === data?.formField?.parentInstanceId
                    )
                ) {
                    (this as any).setStateDirty('fields');
                }
            }
        };

        EventService.getInstance().subscribe(FormEvent.FIELD_CHILDREN_ADDED, this.formSubscriber);
        EventService.getInstance().subscribe(FormEvent.FIELD_REMOVED, this.formSubscriber);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(FormEvent.FIELD_CHILDREN_ADDED, this.formSubscriber);
        EventService.getInstance().unsubscribe(FormEvent.FIELD_REMOVED, this.formSubscriber);
    }

    private async initFields(fields: FormFieldConfiguration[] = []): Promise<void> {
        if (this.updateTimeout) {
            window.clearTimeout(this.updateTimeout);
        }

        this.updateTimeout = setTimeout(async () => {
            if (this.formId) {
                const context = ContextService.getInstance().getActiveContext();
                const formInstance = await context?.getFormManager()?.getFormInstance();
                let availableFields: FormFieldConfiguration[] = fields;

                const formService = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
                    formInstance.getObjectType(), ServiceType.FORM
                );
                if (formService && fields) {
                    const fieldsWithPermission = [];
                    for (const field of fields) {
                        if (await formService.hasPermissions(field)) {
                            fieldsWithPermission.push(field);
                        }
                    }
                    availableFields = fieldsWithPermission;
                }
                this.state.fields = availableFields;
            }
        }, 50);
    }

    public canRemove(field: FormFieldConfiguration): boolean {
        let propertyFields = this.state.fields.filter((ff) => ff.property === field.property);

        if (field.property === KIXObjectProperty.DYNAMIC_FIELDS) {
            propertyFields = this.filterDynamicFields(field, propertyFields);
        }

        if (propertyFields.length === 1 && field.empty && !field.asStructure) {
            return false;
        }
        return field.countMin !== null && field.countMin < propertyFields.length;
    }

    public async removeField(field: FormFieldConfiguration): Promise<void> {
        let propertyFields = this.state.fields.filter((ff) => ff.property === field.property);

        if (field.property === KIXObjectProperty.DYNAMIC_FIELDS) {
            propertyFields = this.filterDynamicFields(field, propertyFields);
        }

        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        if (propertyFields.length === 1) {
            formInstance.setFieldEmptyState(field, true);
        } else {
            formInstance.removeFormField(field);
        }
        (this as any).setStateDirty('fields');
    }

    public canAdd(field: FormFieldConfiguration): boolean {
        let propertyFields = this.state.fields.filter((ff) => ff.property === field.property);

        if (field.property === KIXObjectProperty.DYNAMIC_FIELDS) {
            propertyFields = this.filterDynamicFields(field, propertyFields);
        }

        if (propertyFields.length === 1 && field.empty && !field.asStructure) {
            return true;
        }

        const index = propertyFields.findIndex((f) => f.instanceId === field.instanceId);

        return field.countMax !== null
            && field.countMax > propertyFields.length
            && index !== -1 && index === propertyFields.length - 1;
    }

    private filterDynamicFields(
        field: FormFieldConfiguration, fields: FormFieldConfiguration[]
    ): FormFieldConfiguration[] {
        const nameOption = field.options.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
        if (nameOption) {
            const dfName = nameOption.value;
            return fields.filter((pf) => {
                const pfNameOption = pf.options.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
                if (pfNameOption) {
                    return pfNameOption.value === dfName;
                }
                return false;
            });
        }

        return [];
    }

    public async addField(field: FormFieldConfiguration): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        if (field.empty) {
            formInstance.setFieldEmptyState(field, false);
        } else {
            formInstance.duplicateAndAddNewField(field);
        }
        (this as any).setStateDirty('fields');
    }

    public dragStart(fieldInstanceId: string): void {
        if (fieldInstanceId) {
            this.state.dragStartIndex = this.state.fields.findIndex((f) => f.instanceId === fieldInstanceId);
            this.state.dragStartInstanceId = fieldInstanceId;
        }
    }

    public dragEnd(): void {
        this.state.dragStartIndex = null;
        this.state.dragStartInstanceId = null;
    }

    public allowDrop(event): boolean {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'move';
        return false;
    }

    public handleDragEnter(event): void {
        event.preventDefault();
        event.stopPropagation();
        event.target.classList.add('drag-over');
    }

    public handleDragLeave(event): void {
        event.preventDefault();
        event.stopPropagation();
        event.target.classList.remove('drag-over');
    }

    public async handleDrop(index: number, event): Promise<void> {
        event.stopPropagation();
        event.preventDefault();

        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        if (formInstance && this.state.dragStartInstanceId) {
            const fieldComponent = (this as any).getComponent(this.state.dragStartInstanceId);
            let wasMinimized = false;
            if (fieldComponent) {
                wasMinimized = fieldComponent.state.minimized;
                fieldComponent.state.minimized = true;
            }

            formInstance.changeFieldOrder(this.state.dragStartInstanceId, index);

            setTimeout(() => {
                if (fieldComponent) {
                    fieldComponent.state.minimized = wasMinimized;
                }
                this.state.dragStartIndex = null;
                this.state.dragStartInstanceId = null;
            }, 100);
        }
    }

}

module.exports = Component;
