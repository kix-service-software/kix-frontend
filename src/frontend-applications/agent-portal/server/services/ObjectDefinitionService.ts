/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from "./KIXObjectAPIService";
import { KIXObjectType } from "../../model/kix/KIXObjectType";
import { KIXObjectServiceRegistry } from "./KIXObjectServiceRegistry";
import { ObjectDefinition } from "../../model/kix/ObjectDefinition";
import { Error } from "../../../../server/model/Error";
import { ObjectDefinitionsResponse } from "../model/ObjectDefinitionsResponse";


export class ObjectDefinitionService extends KIXObjectAPIService {

    protected RESOURCE_URI: string = this.buildUri('system', 'objectdefinitions');

    protected objectType: KIXObjectType = KIXObjectType.OBJECT_DEFINITION;

    private static INSTANCE: ObjectDefinitionService;

    public static getInstance(): ObjectDefinitionService {
        if (!ObjectDefinitionService.INSTANCE) {
            ObjectDefinitionService.INSTANCE = new ObjectDefinitionService();
        }
        return ObjectDefinitionService.INSTANCE;
    }

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(type: KIXObjectType): boolean {
        return type === KIXObjectType.OBJECT_DEFINITION;
    }

    public async getObjectDefinitions(token: string): Promise<ObjectDefinition[]> {
        const response = await this.getObjects<ObjectDefinitionsResponse>(token);
        return response.ObjectDefinition;
    }

    public createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, string]>
    ): Promise<string | number> {
        throw new Error('', "Method not implemented.");
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        throw new Error('', "Method not implemented.");
    }
}
