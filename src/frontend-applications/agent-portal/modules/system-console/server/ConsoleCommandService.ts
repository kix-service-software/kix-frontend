/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from "../../../server/services/KIXObjectAPIService";
import { KIXObjectServiceRegistry } from "../../../server/services/KIXObjectServiceRegistry";
import { KIXObjectType } from "../../../model/kix/KIXObjectType";
import { KIXObjectLoadingOptions } from "../../../model/KIXObjectLoadingOptions";
import { KIXObjectSpecificLoadingOptions } from "../../../model/KIXObjectSpecificLoadingOptions";
import { ConsoleCommand } from "../model/ConsoleCommand";
import { KIXObjectSpecificCreateOptions } from "../../../model/KIXObjectSpecificCreateOptions";
import { ConsoleExecuteResult } from "../model/ConsoleExecuteResult";
import { LoggingService } from "../../../../../server/services/LoggingService";
import { ConsoleCommandFactory } from "./ConsoleCommandFactory";
import { Error } from "../../../../../server/model/Error";

export class ConsoleCommandService extends KIXObjectAPIService {

    private static INSTANCE: ConsoleCommandService;

    public static getInstance(): ConsoleCommandService {
        if (!ConsoleCommandService.INSTANCE) {
            ConsoleCommandService.INSTANCE = new ConsoleCommandService();
        }
        return ConsoleCommandService.INSTANCE;
    }

    private constructor() {
        super([new ConsoleCommandFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'console');

    public objectType: KIXObjectType = KIXObjectType.CONSOLE_COMMAND;

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CONSOLE_COMMAND;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.CONSOLE_COMMAND) {
            objects = await super.load<ConsoleCommand>(
                token, KIXObjectType.CONSOLE_COMMAND, this.RESOURCE_URI, loadingOptions, objectIds, 'ConsoleCommand'
            );
        }

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<any> {
        const result = await super.executeUpdateOrCreateRequest<ConsoleExecuteResult>(
            token, clientRequestId, parameter, this.RESOURCE_URI, 'ConsoleExecute', null, true
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });
        return result;
    }

}
