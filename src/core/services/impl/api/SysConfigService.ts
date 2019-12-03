/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from './KIXObjectService';
import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    SysConfigOption, Error, KIXObjectSpecificCreateOptions, KIXObjectSpecificDeleteOptions, FilterCriteria
} from '../../../model';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { SysConfigOptionFactory } from '../../object-factories/SysConfigOptionFactory';
import { SysConfigOptionDefinition } from '../../../model/kix/sysconfig/SysConfigOptionDefinition';
import { SysConfigOptionDefinitionFactory } from '../../object-factories/SysConfigOptionDefinitionFactory';
import { LoggingService } from '..';
import { ModuleConfigurationService } from '../../../../services';

export class SysConfigService extends KIXObjectService {

    private static INSTANCE: SysConfigService;

    public static getInstance(): SysConfigService {
        if (!SysConfigService.INSTANCE) {
            SysConfigService.INSTANCE = new SysConfigService();
        }
        return SysConfigService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'config');

    public objectType: KIXObjectType = KIXObjectType.SYS_CONFIG_OPTION;

    private constructor() {
        super([new SysConfigOptionFactory(), new SysConfigOptionDefinitionFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.SYS_CONFIG_OPTION
            || kixObjectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION;
    }

    public async loadObjects<O>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects = [];

        if (objectType === KIXObjectType.SYS_CONFIG_OPTION) {
            objects = await super.load<SysConfigOption>(
                token, KIXObjectType.SYS_CONFIG_OPTION, this.RESOURCE_URI, loadingOptions, objectIds, 'SysConfigOption'
            );
        } else if (objectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION) {
            const uri = this.buildUri(this.RESOURCE_URI, 'definitions');
            objects = await super.load<SysConfigOptionDefinition>(
                token, KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, uri,
                loadingOptions, objectIds, 'SysConfigOptionDefinition'
            );
        }

        return objects;
    }
    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: string
    ): Promise<string> {
        if (objectType === KIXObjectType.SYS_CONFIG_OPTION) {
            const uri = this.buildUri(this.RESOURCE_URI, objectId);
            const id = await super.executeUpdateOrCreateRequest<string>(
                token, clientRequestId, parameter, uri, this.objectType, 'Name'
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
            ModuleConfigurationService.getInstance().sysconfigChanged(id);
            return id;
        } else if (objectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION) {
            const uri = this.buildUri(this.RESOURCE_URI, 'definitions', objectId);
            const id = await super.executeUpdateOrCreateRequest<string>(
                token, clientRequestId, parameter, uri, KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, 'Option'
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
            ModuleConfigurationService.getInstance().sysconfigChanged(id);
            return id;
        }
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions: KIXObjectSpecificCreateOptions, cacheKeyPrefix: string
    ): Promise<string | number> {
        if (objectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION) {
            const uri = this.buildUri(this.RESOURCE_URI, 'definitions');
            const id = await super.executeUpdateOrCreateRequest<string>(
                token, clientRequestId, parameter, uri, KIXObjectType.SYS_CONFIG_OPTION_DEFINITION,
                'Option', true
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
            ModuleConfigurationService.getInstance().sysconfigChanged(id);
            return id;
        } else {
            return super.createObject(token, clientRequestId, objectType, parameter, createOptions, cacheKeyPrefix);
        }
    }

    public async deleteObjects(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<string | number>,
        deleteOptions?: KIXObjectSpecificDeleteOptions
    ): Promise<Error[]> {
        if (objectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION) {
            const uris = objectIds.map((id) => this.buildUri(this.RESOURCE_URI, 'definitions', id));
            return await this.sendDeleteRequest<void>(token, clientRequestId, uris, objectType)
                .catch((error: Error) => {
                    LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                    throw new Error(error.Code, error.Message);
                });
        }
    }

    protected prepareAPISearch(criteria: FilterCriteria[]): FilterCriteria[] {
        return [];
    }

}
