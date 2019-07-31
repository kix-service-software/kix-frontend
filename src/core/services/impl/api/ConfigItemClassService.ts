/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from "./KIXObjectService";
import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, ConfigItemClass, ConfigItemClassFactory,
    ConfigItemClassProperty, ObjectIcon, Error, CreatePermissionDescription
} from "../../../model";
import {
    ConfigItemClassesResponse, ConfigItemClassResponse,
    CreateConfigItemClass, CreateConfigItemClassResponse, CreateConfigItemClassRequest,
    UpdateConfigItemClassResponse, UpdateConfigItemClassRequest, UpdateConfigItemClass
} from "../../../api";
import { KIXObjectServiceRegistry } from "../../KIXObjectServiceRegistry";
import { AppUtil } from "../../../common";
import { LoggingService } from "../LoggingService";

export class ConfigItemClassService extends KIXObjectService {

    protected RESOURCE_URI: string = this.buildUri('system', 'cmdb', 'classes');

    protected objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS;

    private static INSTANCE: ConfigItemClassService;

    public static getInstance(): ConfigItemClassService {
        if (!ConfigItemClassService.INSTANCE) {
            ConfigItemClassService.INSTANCE = new ConfigItemClassService();
        }
        return ConfigItemClassService.INSTANCE;
    }

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CONFIG_ITEM_CLASS;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {
        let objects = [];

        switch (objectType) {
            case KIXObjectType.CONFIG_ITEM_CLASS:
                objects = await this.getConfigItemClasses(token, objectIds, loadingOptions);
                break;
            default:
        }
        return objects;
    }

    private async getConfigItemClasses(
        token: string, configItemClassIds: Array<number | string>, loadingOptions: KIXObjectLoadingOptions
    ): Promise<ConfigItemClass[]> {
        if (loadingOptions) {
            if (loadingOptions.includes) {
                if (!loadingOptions.includes.some((i) => i === ConfigItemClassProperty.CURRENT_DEFINITION)) {
                    loadingOptions.includes.push(ConfigItemClassProperty.CURRENT_DEFINITION);
                }
            } else {
                loadingOptions.includes = [ConfigItemClassProperty.CURRENT_DEFINITION];
            }
        } else {
            loadingOptions = new KIXObjectLoadingOptions(null, null, null, [
                ConfigItemClassProperty.CURRENT_DEFINITION
            ]);
        }

        loadingOptions.sortOrder = 'ConfigItemClass.Name';

        const query = this.prepareQuery(loadingOptions);

        let configItemClasses: ConfigItemClass[] = [];

        if (configItemClassIds && configItemClassIds.length) {
            configItemClassIds = configItemClassIds.filter(
                (id) => typeof id !== 'undefined' && id.toString() !== '' && id !== null
            );

            const uri = this.buildUri('system', 'cmdb', 'classes', configItemClassIds.join(','));
            const response = await this.getObjectByUri<ConfigItemClassesResponse | ConfigItemClassResponse>(
                token, uri, query
            );

            if (configItemClassIds.length === 1) {
                configItemClasses = [(response as ConfigItemClassResponse).ConfigItemClass];
            } else {
                configItemClasses = (response as ConfigItemClassesResponse).ConfigItemClass;
            }

        } else if (loadingOptions.filter) {
            const uri = this.buildUri('system', 'cmdb', 'classes');
            await this.buildFilter(loadingOptions.filter, 'ConfigItemClass', token, query);
            const response = await this.getObjectByUri<ConfigItemClassesResponse>(token, uri, query);
            configItemClasses = response.ConfigItemClass;
        } else {
            const uri = this.buildUri('system', 'cmdb', 'classes');
            const response = await this.getObjectByUri<ConfigItemClassesResponse>(token, uri, query);
            configItemClasses = response.ConfigItemClass;
        }

        return configItemClasses.map((configItemClass) => ConfigItemClassFactory.create(configItemClass));
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
                icon.Object = 'ConfigItemClass';
                icon.ObjectID = response.ConfigItemClassID;
                await this.createIcons(token, clientRequestId, icon);
            }

            await AppUtil.updateFormConfigurations(true, clientRequestId, true);

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
                icon.Object = 'ConfigItemClass';
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

            await AppUtil.updateFormConfigurations(true, clientRequestId, true);

            return response.ConfigItemClassID;
        }
    }

}
