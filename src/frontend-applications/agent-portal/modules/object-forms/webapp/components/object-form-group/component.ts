/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ObjectFormValue } from '../../../model/FormValues/ObjectFormValue';
import { FieldLayout } from '../../../model/layout/FieldLayout';
import { FormLayout } from '../../../model/layout/FormLayout';
import { ObjectFormHandler } from '../../core/ObjectFormHandler';
import { ComponentState } from './ComponentState';
import { ConfigurationType } from '../../../../../model/configuration/ConfigurationType';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormConfigurationObject } from '../../../model/FormConfigurationObject';
import { ObjectFormEvent } from '../../../model/ObjectFormEvent';
import { FormGroupConfiguration } from '../../../../../model/configuration/FormGroupConfiguration';
import { GroupRowLayout } from './GroupRowLayout';
import { RowColumnLayout } from '../../../model/layout/RowColumnLayout';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ObjectFormEventData } from '../../../model/ObjectFormEventData';
import { ObjectFormConfigurationContext } from '../../core/ObjectFormConfigurationContext';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private formhandler: ObjectFormHandler;
    private group: FormGroupConfiguration;

    public onCreate(input: any): void {
        super.onCreate(input, 'object-form-group');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.group = input.group;
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Edit Group', 'Translatable#Add Field'
        ]);

        this.formhandler = await this.context?.getFormManager().getObjectFormHandler();

        await this.prepareRowLayout();

        super.registerEventSubscriber(
            async function (data: ObjectFormEventData, eventId: string): Promise<void> {
                if (this.contextInstanceId === data.contextInstanceId) {
                    if (data?.formConfigurationObject?.groupId === this.group.id) {
                        this.formhandler = await this.context?.getFormManager().getObjectFormHandler();
                        this.state.prepared = false;
                        await this.prepareRowLayout();
                        setTimeout(() => this.state.prepared = true, 0);
                    }
                }
            },
            [
                ObjectFormEvent.GROUP_UPDATED,
                ObjectFormEvent.FIELD_REINITIALIZED,
                ObjectFormEvent.FIELD_DELETED,
                ObjectFormEvent.FIELD_ADDED
            ]
        );

        this.state.prepared = true;
    }

    private async prepareRowLayout(): Promise<void> {
        const groupLayout = this.formhandler?.form?.formLayout?.groupLayout?.find((g) => g.groupId === this.group?.id);
        if (groupLayout?.rowLayout?.length) {
            this.state.rows = this.mapRows(groupLayout.rowLayout);
        } else {
            this.state.rows = [[new GroupRowLayout(this.group.formFields, 12, 12, 12)]];
        }
    }

    private mapRows(groupRowLayout: Array<RowColumnLayout[]>): Array<GroupRowLayout[]> {
        const rows: Array<GroupRowLayout[]> = [];
        const mappedFieldIds: string[] = [];
        for (const columns of groupRowLayout) {
            const rowColumns = [];
            if (columns?.length) {
                for (const col of columns) {
                    const fields = col.formObjectIds?.map((fid) => this.formhandler?.getFormField(fid));
                    mappedFieldIds.push(...col.formObjectIds);
                    rowColumns.push(new GroupRowLayout(fields, col.colSM, col.colMD, col.colLG));
                }
            }

            if (rowColumns.length) {
                rows.push(rowColumns);
            }
        }

        const notMappedFields: FormFieldConfiguration[] = [];
        for (const f of this.group?.formFields) {
            if (!mappedFieldIds.some((fid) => f.id === fid)) {
                notMappedFields.push(f);
            }
        }

        if (notMappedFields.length) {
            rows.push([new GroupRowLayout(notMappedFields, 12, 12, 12)]);
        }

        return rows;
    }

    public getFormValues(pageId: string, groupId: string): ObjectFormValue[] {
        return this.formhandler?.objectFormValueMapper?.getFormValues(pageId, groupId);
    }

    public getFieldLayout(groupId: string): FieldLayout[] {
        const groupLayout = this.formhandler?.form?.formLayout?.groupLayout?.find((g) => g.groupId === groupId);
        return groupLayout?.fieldLayout;
    }

    public getFormLayout(): FormLayout {
        return this.formhandler?.form?.formLayout;
    }

    public getGroupClasses(groupId): string {
        const groupLayout = this.formhandler?.form?.formLayout?.groupLayout?.find((g) => g.groupId === groupId);
        let classes = [];

        if (groupLayout?.colSM > 0) {
            classes.push('col-sm-' + groupLayout.colSM);
        }

        if (groupLayout?.colMD > 0) {
            classes.push('col-md-' + groupLayout.colMD);
        }

        if (groupLayout?.colLG > 0) {
            classes.push('col-lg-' + groupLayout.colLG);
        }

        if (!classes.length) {
            classes.push('col-12');
        }

        return classes.join(' ');
    }

    public editGroup(groupId: string, event: any): void {
        event.preventDefault();
        event.stopPropagation();
        const configObject = new FormConfigurationObject();
        configObject.configurationType = ConfigurationType.FormGroup;
        configObject.groupId = groupId;
        this.publishFieldEvent(event, configObject, ObjectFormEvent.EDIT_GROUP);
    }

    public addField(groupId: string, event: any): void {
        event.preventDefault();
        event.stopPropagation();
        const configObject = new FormConfigurationObject();
        configObject.configurationType = ConfigurationType.FormField;
        configObject.groupId = groupId;
        this.publishFieldEvent(event, configObject, ObjectFormEvent.ADD_FIELD);
    }

    private publishFieldEvent(event: any, configObject: FormConfigurationObject, formEvent: ObjectFormEvent): void {
        event.stopPropagation();
        event.preventDefault();
        EventService.getInstance().publish(formEvent, configObject);
    }


    public onDestroy(): void {
        super.onDestroy();
    }
}

module.exports = Component;