/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { Webform, WebformProperty } from "../../model/webform";
import {
    KIXObjectType, FormFieldValue, Form, SysConfigOption, SysConfigKey, FormContext, Queue,
    KIXObjectLoadingOptions, FilterCriteria, QueueProperty, FilterDataType, FilterType, TicketPriority,
    TicketPriorityProperty, TicketType, TicketTypeProperty, TicketState, TicketStateProperty
} from "../../model";
import { KIXObjectService } from "../kix";
import { SearchOperator } from "../SearchOperator";

export class WebformFormService extends KIXObjectFormService<Webform> {

    private static INSTANCE: WebformFormService = null;

    public static getInstance(): WebformFormService {
        if (!WebformFormService.INSTANCE) {
            WebformFormService.INSTANCE = new WebformFormService();
        }

        return WebformFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.WEBFORM;
    }

    protected async additionalPreparations(
        form: Form, formFieldValues: Map<string, FormFieldValue<any>>, webform: Webform
    ): Promise<void> {
        const hasConfigPermissions = await this.checkPermissions('system/config');
        if (form && hasConfigPermissions && form.formContext === FormContext.NEW) {
            for (const g of form.groups) {
                for (const f of g.formFields) {
                    let value;
                    switch (f.property) {
                        case WebformProperty.QUEUE_ID:
                            value = await this.getDefaultQueueID();
                            break;
                        case WebformProperty.PRIORITY_ID:
                            value = await this.getDefaultPriorityID();
                            break;
                        case WebformProperty.TYPE_ID:
                            value = await this.getDefaultTypeID();
                            break;
                        case WebformProperty.STATE_ID:
                            value = await this.getDefaultStateID();
                            break;
                        default:
                    }
                    if (value) {
                        formFieldValues.set(f.instanceId, new FormFieldValue(value));
                    }
                }
            }
        }
    }

    private async getDefaultQueueID(): Promise<number> {
        let queueId: number;
        const defaultOptions = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.POSTMASTER_DEFAULT_QUEUE], null, null, true
        );
        if (defaultOptions && !!defaultOptions.length) {
            const name = defaultOptions[0].Value;
            if (name) {
                const queues = await KIXObjectService.loadObjects<Queue>(
                    KIXObjectType.QUEUE, null, new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                QueueProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                                FilterType.AND, name
                            )
                        ]
                    ), null, true
                );
                queueId = queues && !!queues.length ? queues[0].QueueID : null;
            }
        }
        return queueId;
    }

    private async getDefaultPriorityID(): Promise<number> {
        let priorityId: number;
        const defaultOptions = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.POSTMASTER_DEFAULT_PRIORITY], null, null, true
        );
        if (defaultOptions && !!defaultOptions.length) {
            const name = defaultOptions[0].Value;
            if (name) {
                const objects = await KIXObjectService.loadObjects<TicketPriority>(
                    KIXObjectType.TICKET_PRIORITY, null, new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                TicketPriorityProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                                FilterType.AND, name
                            )
                        ]
                    ), null, true
                );
                priorityId = objects && !!objects.length ? objects[0].ID : null;
            }
        }
        return priorityId;
    }

    private async getDefaultTypeID(): Promise<number> {
        let typeId: number;
        const defaultOptions = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.TICKET_TYPE_DEFAULT], null, null, true
        );
        if (defaultOptions && !!defaultOptions.length) {
            const name = defaultOptions[0].Value;
            if (name) {
                const objects = await KIXObjectService.loadObjects<TicketType>(
                    KIXObjectType.TICKET_TYPE, null, new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                TicketTypeProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                                FilterType.AND, name
                            )
                        ]
                    ), null, true
                );
                typeId = objects && !!objects.length ? objects[0].ID : null;
            }
        }
        return typeId;
    }

    private async getDefaultStateID(): Promise<number> {
        let stateId: number;
        const defaultOptions = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.POSTMASTER_DEFAULT_STATE], null, null, true
        );
        if (defaultOptions && !!defaultOptions.length) {
            const name = defaultOptions[0].Value;
            if (name) {
                const objects = await KIXObjectService.loadObjects<TicketState>(
                    KIXObjectType.TICKET_STATE, null, new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                TicketStateProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                                FilterType.AND, name
                            )
                        ]
                    ), null, true
                );
                stateId = objects && !!objects.length ? objects[0].ID : null;
            }
        }
        return stateId;
    }

}
