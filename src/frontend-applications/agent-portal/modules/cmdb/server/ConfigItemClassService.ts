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
import { ObjectIcon } from '../../icon/model/ObjectIcon';
import { CreateConfigItemClass } from './api/CreateConfigItemClass';
import { CreateConfigItemClassResponse } from './api/CreateConfigItemClassResponse';
import { CreateConfigItemClassRequest } from './api/CreateConfigItemClassRequest';
import { UpdateConfigItemClass } from './api/UpdateConfigItemClass';
import { ConfigItemClassProperty } from '../model/ConfigItemClassProperty';
import { UpdateConfigItemClassResponse } from './api/UpdateConfigItemClassResponse';
import { UpdateConfigItemClassRequest } from './api/UpdateConfigItemClassRequest';
import { Error } from '../../../../../server/model/Error';
import { ConfigItemClass } from '../model/ConfigItemClass';
import { KIXObjectProperty } from '../../../model/kix/KIXObjectProperty';


export class ConfigItemAPIClassService extends KIXObjectAPIService {

    protected RESOURCE_URI: string = this.buildUri('system', 'cmdb', 'classes');

    protected objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS;

    private static INSTANCE: ConfigItemAPIClassService;

    public static getInstance(): ConfigItemAPIClassService {
        if (!ConfigItemAPIClassService.INSTANCE) {
            ConfigItemAPIClassService.INSTANCE = new ConfigItemAPIClassService();
        }
        return ConfigItemAPIClassService.INSTANCE;
    }

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CONFIG_ITEM_CLASS;
    }

    public async preloadObjects(token: string): Promise<void> {
        const promises = [];

        const loadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.includes = ['ConfigItemStats'];
        loadingOptions.cacheType = `${KIXObjectType.CONFIG_ITEM_CLASS}_STATS`;
        promises.push(
            await this.loadObjects<ConfigItemClass>(
                token, '', KIXObjectType.CONFIG_ITEM_CLASS, null, loadingOptions, null
            )
        );

        promises.push(
            await this.loadObjects<ConfigItemClass>(
                token, '', KIXObjectType.CONFIG_ITEM_CLASS, null, loadingOptions, null
            )
        );

        await Promise.all(promises);
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {
        let objects = [];

        const cacheTypes = [
            `${KIXObjectType.CONFIG_ITEM_CLASS}_STATS`,
            `${KIXObjectType.CONFIG_ITEM_CLASS}_DEFINITION`
        ];

        if (cacheTypes.some((ct) => ct === (loadingOptions?.cacheType))) {
            objects = await super.load(
                token, objectType, this.RESOURCE_URI, loadingOptions, objectIds, 'ConfigItemClass',
                clientRequestId, ConfigItemClass
            );
        } else {
            objects = await super.load(
                token, objectType, this.RESOURCE_URI, null, null, 'ConfigItemClass',
                clientRequestId, ConfigItemClass
            );

            const hasValidFilter = loadingOptions?.filter?.length === 1 &&
                loadingOptions.filter[0].property === KIXObjectProperty.VALID_ID;

            if (hasValidFilter) {
                objects = objects.filter((o) => o.ValidID === loadingOptions.filter[0].value);
            }

            if (objectIds && objectIds.length) {
                objects = objects.filter((t) => objectIds.some((oid) => oid === t.ID));
            }
        }

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, string]>,
        createOptions: KIXObjectSpecificCreateOptions, cacheKeyPrefix: string
    ): Promise<string | number> {
        if (objectType === KIXObjectType.CONFIG_ITEM_CLASS) {

            const createConfigItemClass = new CreateConfigItemClass(parameter.filter(
                (p) => p[0] !== 'ICON' && p[0] !== 'OBJECT_PERMISSION' && p[0] !== 'PROPERTY_VALUE_PERMISSION')
            );

            const uri = this.buildUri('system', 'cmdb', 'classes');

            const response = await this.sendCreateRequest<CreateConfigItemClassResponse, CreateConfigItemClassRequest>(
                token, clientRequestId, uri, new CreateConfigItemClassRequest(createConfigItemClass), this.objectType
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });

            const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
            if (icon) {
                icon.Object = KIXObjectType.GENERAL_CATALOG_ITEM;
                icon.ObjectID = response.ConfigItemClassID;
                await this.createIcon(token, clientRequestId, icon);
            }

            return response.ConfigItemClassID;
        }
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        if (objectType === KIXObjectType.CONFIG_ITEM_CLASS) {
            const updateConfigItemClass = new UpdateConfigItemClass(
                parameter.filter(
                    (p) => p[0] !== 'ICON' && p[0] !== ConfigItemClassProperty.DEFINITION_STRING
                        && p[0] !== 'OBJECT_PERMISSION' && p[0] !== 'PROPERTY_VALUE_PERMISSION'
                )
            );

            const response = await this.sendUpdateRequest<UpdateConfigItemClassResponse, UpdateConfigItemClassRequest>(
                token, clientRequestId, this.buildUri('system', 'cmdb', 'classes', objectId),
                new UpdateConfigItemClassRequest(updateConfigItemClass), this.objectType
            ).catch((error) => {
                throw error;
            });

            const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
            if (icon) {
                icon.Object = KIXObjectType.GENERAL_CATALOG_ITEM;
                icon.ObjectID = response.ConfigItemClassID;
                await this.updateIcon(token, clientRequestId, icon);
            }

            const definitionParameter = parameter.find((p) => p[0] === ConfigItemClassProperty.DEFINITION_STRING);
            if (definitionParameter) {
                const uri = this.buildUri('system', 'cmdb', 'classes', objectId, 'definitions');
                await this.sendCreateRequest(token, clientRequestId, uri, {
                    ConfigItemClassDefinition: {
                        DefinitionString: definitionParameter[1]
                    }
                }, this.objectType).catch((error: Error) => {
                    if (error.StatusCode === 409) {
                        LoggingService.getInstance().warning(
                            `Could not create new definition of Config Item Class ${objectId}.`, error
                        );
                    } else {
                        throw new Error(error.Code, error.Message);
                    }
                });
            }

            return response.ConfigItemClassID;
        }
    }

}
