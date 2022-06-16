/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { KIXObjectProperty } from '../../../model/kix/KIXObjectProperty';
import { Error } from '../../../../../server/model/Error';
import { Notification } from '../model/Notification';
import { NotificationProperty } from '../model/NotificationProperty';
import { NotificationMessage } from '../model/NotificationMessage';


export class NotificationAPIService extends KIXObjectAPIService {

    private static INSTANCE: NotificationAPIService;

    public static getInstance(): NotificationAPIService {
        if (!NotificationAPIService.INSTANCE) {
            NotificationAPIService.INSTANCE = new NotificationAPIService();
        }
        return NotificationAPIService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'communication', 'notifications');

    public objectType: KIXObjectType = KIXObjectType.NOTIFICATION;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.NOTIFICATION;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.NOTIFICATION) {
            objects = await super.load<Notification>(
                token, KIXObjectType.NOTIFICATION, this.RESOURCE_URI, loadingOptions, objectIds, 'Notification',
                clientRequestId, Notification
            );
        }

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        const createParameter = this.prepareParameter(parameter);
        const id = super.executeUpdateOrCreateRequest(
            token, clientRequestId, createParameter, this.RESOURCE_URI, KIXObjectType.NOTIFICATION,
            'NotificationID', true
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const uri = this.buildUri(this.RESOURCE_URI, objectId);
        const updateParameter = this.prepareParameter(parameter);
        const id = super.executeUpdateOrCreateRequest(
            token, clientRequestId, updateParameter, uri, KIXObjectType.NOTIFICATION, 'NotificationID'
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }

    private prepareParameter(parameter: Array<[string, any]>): Array<[string, any]> {
        const newParameter: Array<[string, any]> = [];
        const dataProperties = {};
        const messageProperties = {};

        const messageRegEx = new RegExp(
            `^(${NotificationProperty.MESSAGE_BODY}|${NotificationProperty.MESSAGE_SUBJECT})###(.+)$`
        );
        parameter.forEach((p) => {
            if (p[0] === NotificationProperty.NAME ||
                p[0] === KIXObjectProperty.VALID_ID ||
                p[0] === KIXObjectProperty.COMMENT
            ) {
                newParameter.push(p);
            } else if (p[0].match(messageRegEx)) {
                const property = p[0].replace(messageRegEx, '$1');
                const language = p[0].replace(messageRegEx, '$2');
                if (!messageProperties[language]) {
                    messageProperties[language] = new NotificationMessage();
                }
                messageProperties[language][property] = p[1];
            } else if (p[0] === NotificationProperty.FILTER) {
                if (Array.isArray(p[1])) {
                    const filter = this.prepareObjectFilter(p[1]);
                    newParameter.push([NotificationProperty.FILTER, filter]);
                }
            } else {
                // handle Data properties
                if (Array.isArray(p[1])) {
                    dataProperties[p[0]] = p[1].filter((v) => v !== null);
                } else if (typeof p[1] !== 'undefined' && p[1] !== null) {
                    dataProperties[p[0]] = [p[1]];
                }
            }
        });

        newParameter.push([NotificationProperty.DATA, dataProperties]);
        newParameter.push([NotificationProperty.MESSAGE, messageProperties]);
        return newParameter;
    }
}
