/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { Error } from '../../../../../server/model/Error';
import { CacheService } from '../../../server/services/cache';
import { ObjectResponse } from '../../../server/services/ObjectResponse';
import { KIXObjectSpecificDeleteOptions } from '../../../model/KIXObjectSpecificDeleteOptions';
import { Macro } from '../model/Macro';
import { MacroActionType } from '../model/MacroActionType';
import { MacroType } from '../model/MacroType';
import { MacroProperty } from '../model/MacroProperty';
import { MacroAction } from '../model/MacroAction';

export class MacroAPIService extends KIXObjectAPIService {

    private static INSTANCE: MacroAPIService;

    public static getInstance(): MacroAPIService {
        if (!MacroAPIService.INSTANCE) {
            MacroAPIService.INSTANCE = new MacroAPIService();
        }
        return MacroAPIService.INSTANCE;
    }

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'automation', 'macros');
    protected RESOURCE_URI_MACRO_TYPE: string = this.buildUri('system', 'automation', 'macros', 'types');

    public objectType: KIXObjectType = KIXObjectType.JOB;

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.MACRO
            || kixObjectType === KIXObjectType.MACRO_ACTION_TYPE
            || kixObjectType === KIXObjectType.MACRO_TYPE;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {

        let objectResponse = new ObjectResponse();
        if (objectType === KIXObjectType.MACRO) {
            objectResponse = await super.load<Macro>(
                token, KIXObjectType.MACRO, this.RESOURCE_URI, loadingOptions, objectIds, 'Macro', clientRequestId, Macro
            );
        } else if (objectType === KIXObjectType.MACRO_ACTION_TYPE) {
            if (objectLoadingOptions) {
                const uri = this.buildUri(
                    'system', 'automation', 'macros', 'types',
                    objectLoadingOptions.id,
                    'actiontypes'
                );
                objectResponse = await super.load<MacroActionType>(
                    token, KIXObjectType.MACRO_ACTION_TYPE, uri, loadingOptions, objectIds, 'MacroActionType',
                    clientRequestId, MacroActionType
                );
            }
        } else if (objectType === KIXObjectType.MACRO_TYPE) {
            objectResponse = await super.load<MacroType>(
                token, KIXObjectType.MACRO_TYPE, this.RESOURCE_URI_MACRO_TYPE, loadingOptions,
                null, 'MacroType', clientRequestId, MacroType
            );
        }

        return objectResponse as ObjectResponse<T>;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        let id;

        if (objectType === KIXObjectType.MACRO) {
            const result = await this.createOrUpdateMacros(token, clientRequestId, parameter, false)
                .catch((error: Error) => {
                    LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                    throw new Error(error.Code, error.Message);
                });

            if (result?.length) {
                id = result[0];
            }
        }

        return id;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        objectId: number | string, updateOptions: KIXObjectSpecificCreateOptions, cacheKeyPrefix: string
    ): Promise<string | number> {
        let id;

        if (objectType === KIXObjectType.MACRO) {
            const result = await this.createOrUpdateMacros(token, clientRequestId, parameter, false)
                .catch((error: Error) => {
                    LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                    throw new Error(error.Code, error.Message);
                });

            if (result?.length) {
                id = result[0];
            }

            const execParameter = this.getParameterValue(parameter, MacroProperty.EXEC);
            if (execParameter) {
                const uri = this.buildUri(this.RESOURCE_URI, objectId);
                id = await super.executeUpdateOrCreateRequest(
                    token, clientRequestId, [[MacroProperty.EXEC, execParameter]], uri, KIXObjectType.MACRO, 'MacroID'
                ).catch((error: Error) => {
                    LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                    throw new Error(error.Code, error.Message);
                });

                CacheService.getInstance().deleteKeys(KIXObjectType.TICKET);
            }
        }

        return id;
    }

    public async deleteObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectId: string | number,
        deleteOptions: KIXObjectSpecificDeleteOptions, cacheKeyPrefix: string, ressourceUri: string = this.RESOURCE_URI
    ): Promise<Error[]> {
        if (objectType === KIXObjectType.MACRO) {
            await this.deleteMacro(
                token, objectId as number,
            ).catch((error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
        }
        else {
            return super.deleteObject(token, clientRequestId, objectType, objectId,
                deleteOptions, cacheKeyPrefix, ressourceUri);
        }
    }

    public async deleteMacro(token: string, macroId: number): Promise<void> {
        await this.deleteMacroActions(token, macroId);
        const macroUri = this.buildUri(this.RESOURCE_URI);
        await super.deleteObject(
            token, 'MacroAPIService', KIXObjectType.MACRO, macroId,
            null, KIXObjectType.MACRO, macroUri
        );
    }
    public async deleteMacroActions(token: string, macroId: number): Promise<void> {
        const objectResponse = await this.loadObjects<Macro>(
            token, 'MacroAPIService', KIXObjectType.MACRO, [macroId],
            new KIXObjectLoadingOptions([], null, null, [MacroProperty.ACTIONS]), null);
        const macros = objectResponse?.objects || [];
        if (macros && macros.length) {
            for (const macroAction of macros[0].Actions) {
                const actionUri = this.buildUri(this.RESOURCE_URI, macroId, 'actions');
                await super.deleteObject(
                    token, 'MacroAPIService', KIXObjectType.MACRO_ACTION, macroAction.ID,
                    null, KIXObjectType.MACRO_ACTION, actionUri
                );
            }
        }
    }

    public async createOrUpdateMacros(
        token: string, clientRequestId: string, parameter: Array<[string, any]>, update?: boolean
    ): Promise<number[]> {
        const macroIds = [];
        const macroParameter = parameter.filter((p) => p[0] === 'Macros');
        for (const mp of macroParameter) {
            if (!mp[1]) {
                continue;
            }

            const macro: Macro = mp[1];
            const macroId = await this.createOrUpdateMacro(token, clientRequestId, macro, update)
                .catch(async (e) => {
                    if (!update) {
                        for (const mid of macroIds) {
                            await this.deleteMacro(token, mid).catch(() => null);
                        }
                    }
                    throw e;
                });

            if (macroId) {
                macroIds.push(macroId);
            }
        }
        return macroIds;
    }

    private async createOrUpdateMacro(
        token: string, requestId: string, macro: Macro, update?: boolean
    ): Promise<number> {
        if (!Array.isArray(macro.Actions) || !macro.Actions.length) {
            return null;
        }

        let create = true;
        let uri = this.buildUri(this.RESOURCE_URI);
        if (macro.ID) {
            create = false;
            uri = this.buildUri(uri, macro.ID);
        }

        const parameter = [];
        for (const key in macro) {
            if (key === MacroProperty.ID && create) {
                continue;
            }

            if (key !== MacroProperty.ACTIONS) {
                parameter.push([key, macro[key]]);
            }
        }
        const macroId = await super.executeUpdateOrCreateRequest(
            token, requestId, parameter, uri, KIXObjectType.MACRO, 'MacroID', create
        );

        macro.ID = macroId;

        if (macroId && Array.isArray(macro.Actions)) {
            const actionsUri = this.buildUri(this.RESOURCE_URI, macroId, 'actions');
            const objectResponse = await super.load<Macro>(
                token, KIXObjectType.MACRO_ACTION, actionsUri, null, null, KIXObjectType.MACRO_ACTION, 'MacroAPIService'
            );

            const existingActions = objectResponse?.objects || [];
            const actionsToDelete = existingActions
                .filter((a) => !macro.Actions.some((ma) => ma.ID && ma.ID === a.ID))
                .map((a) => a.ID);

            if (actionsToDelete.length) {
                await super.sendDeleteRequest(
                    token, requestId,
                    actionsToDelete.map((id) => this.buildUri(actionsUri, id)),
                    KIXObjectType.MACRO_ACTION
                );
            }

            const execOrder = [];
            for (const action of macro.Actions) {
                const actionId = await this.createOrUpdateAction(token, requestId, macroId, action, update)
                    .catch(async (e) => {
                        if (!update) {
                            await this.deleteMacro(token, macroId);
                        }
                        throw e;
                    });
                execOrder.push(actionId);
            }

            const updateUri = this.buildUri(this.RESOURCE_URI, macro.ID);
            await super.executeUpdateOrCreateRequest(
                token, requestId, [[MacroProperty.EXEC_ORDER, execOrder]], updateUri, KIXObjectType.MACRO, 'MacroID'
            );
        }

        return macroId;
    }

    private async createOrUpdateAction(
        token: string, requestId: string, macroId: number, action: MacroAction, update?: boolean
    ): Promise<number> {
        const parameter = [];
        for (const key in action) {
            if (action[key]) {
                parameter.push([key, action[key]]);
            }
        }

        let create = true;
        let uri = this.buildUri(this.RESOURCE_URI, macroId, 'actions');
        if (action.ID) {
            create = false;
            uri = this.buildUri(uri, action.ID);
        }

        if (action.Parameters['MacroID']) {
            let macro = action.Parameters['MacroID'];
            if (Array.isArray(macro) && macro.length) {
                macro = macro[0];
            }

            const subMacroId = await this.createOrUpdateMacro(token, requestId, macro, update);
            action.Parameters['MacroID'] = subMacroId;
        }

        const actionId = await super.executeUpdateOrCreateRequest(
            token, requestId, parameter, uri, KIXObjectType.MACRO_ACTION, 'MacroActionID', create
        );

        action.ID = actionId;

        return actionId;
    }
}
