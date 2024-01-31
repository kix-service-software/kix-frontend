/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormConfiguration } from '../../../../../model/configuration/FormConfiguration';
import { FormContext } from '../../../../../model/configuration/FormContext';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { IdService } from '../../../../../model/IdService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificCreateOptions } from '../../../../../model/KIXObjectSpecificCreateOptions';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { FormInstance } from '../../../../base-components/webapp/core/FormInstance';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { KIXObjectFormService } from '../../../../base-components/webapp/core/KIXObjectFormService';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { PermissionProperty } from '../../../../user/model/PermissionProperty';
import { Role } from '../../../../user/model/Role';
import { RoleProperty } from '../../../../user/model/RoleProperty';
import { ReportDefinition } from '../../../model/ReportDefinition';
import { ReportDefinitionProperty } from '../../../model/ReportDefinitionProperty';
import { ReportParameterProperty } from '../../../model/ReportParameterProperty';
import { ReportDefinitionFormCreator } from './ReportDefinitionFormCreator';
import { ReportDefintionObjectCreator } from './ReportDefintionObjectCreator';


export class ReportDefinitionFormService extends KIXObjectFormService {

    private static INSTANCE: ReportDefinitionFormService = null;

    public static getInstance(): ReportDefinitionFormService {
        if (!ReportDefinitionFormService.INSTANCE) {
            ReportDefinitionFormService.INSTANCE = new ReportDefinitionFormService();
        }

        return ReportDefinitionFormService.INSTANCE;
    }

    private subscriber: IEventSubscriber;

    private constructor() {
        super();

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('ReportDefinitionFormService'),
            eventPublished: (data: any, eventId: string): void => {
                if (eventId === FormEvent.FIELD_EMPTY_STATE_CHANGED) {
                    const field: FormFieldConfiguration = data.field;
                    if (field && field.property === ReportDefinitionProperty.PARAMTER) {
                        const formInstance: FormInstance = data.formInstance;
                        if (field.empty) {
                            field.empty = true;
                            formInstance.addFieldChildren(field, [], true);
                        } else {
                            field.empty = false;
                            ReportDefinitionFormCreator.createParameterFields(field, null, formInstance);
                        }
                    }
                }
            }
        };

        EventService.getInstance().subscribe(FormEvent.FIELD_REMOVED, this.subscriber);
        EventService.getInstance().subscribe(FormEvent.FIELD_EMPTY_STATE_CHANGED, this.subscriber);
    }

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.REPORT_DEFINITION;
    }

    protected async prePrepareForm(
        form: FormConfiguration, reportDefinition: ReportDefinition, formInstance: FormInstance
    ): Promise<void> {
        await ReportDefinitionFormCreator.createFormPages(form, reportDefinition, formInstance);
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions: KIXObjectSpecificCreateOptions,
        formContext: FormContext, formInstance: FormInstance
    ): Promise<Array<[string, any]>> {
        parameter = await super.postPrepareValues(parameter, createOptions, formContext, formInstance);

        const roleIds = parameter.find((p) => p[0] === ReportDefinitionProperty.ROLE_IDS);
        const reportDefinition = await ReportDefintionObjectCreator.createReportDefinitionObject(formInstance);
        parameter = [[KIXObjectType.REPORT_DEFINITION, reportDefinition]];
        if (roleIds) {
            parameter.push(roleIds);
        }

        return parameter;
    }

    protected async getValue(
        property: string, value: any, reportDefinition: ReportDefinition,
        formField: FormFieldConfiguration, formContext: FormContext
    ): Promise<any> {
        if (property === ReportDefinitionProperty.ROLE_IDS && reportDefinition) {
            const loadingOptions = new KIXObjectLoadingOptions(
                [
                    new FilterCriteria(
                        `${RoleProperty.PERMISSIONS}.${PermissionProperty.TARGET}`, SearchOperator.EQUALS,
                        FilterDataType.STRING, FilterType.AND, `/reporting/reportdefinitions/${reportDefinition.ID}`
                    ),
                    new FilterCriteria(
                        `${RoleProperty.PERMISSIONS}.${PermissionProperty.TYPE_ID}`, SearchOperator.EQUALS,
                        FilterDataType.NUMERIC, FilterType.AND, 1
                    ),
                    new FilterCriteria(
                        `${RoleProperty.PERMISSIONS}.${PermissionProperty.VALUE}`, SearchOperator.EQUALS,
                        FilterDataType.NUMERIC, FilterType.AND, 2
                    )
                ],
                null, null, [RoleProperty.PERMISSIONS]
            );
            const roles = await KIXObjectService.loadObjects<Role>(KIXObjectType.ROLE, null, loadingOptions);
            if (Array.isArray(roles) && roles.length) {
                return roles
                    .filter((r) => Array.isArray(r.Permissions) && r.Permissions.length)
                    .map((r) => r.ID);
            }
        }

        if (property === ReportDefinitionProperty.MAX_REPORTS && !reportDefinition?.MaxReports) {
            return 0;
        }

        if (formContext === FormContext.EDIT && reportDefinition) {
            return formField.defaultValue ? formField.defaultValue.value : null;
        }

        return super.getValue(property, value, reportDefinition, formField, formContext);
    }

    public async getNewFormField(
        formInstance: FormInstance, f: FormFieldConfiguration,
        parent?: FormFieldConfiguration, withChildren: boolean = true
    ): Promise<FormFieldConfiguration> {
        withChildren = f.property === ReportDefinitionProperty.PARAMTER;
        const field = await super.getNewFormField(formInstance, f, parent, withChildren);

        if (f.property === ReportParameterProperty.POSSIBLE_VALUES || f.property === ReportParameterProperty.DEFAULT) {
            field.inputComponent = null;
        }

        return field;
    }
}