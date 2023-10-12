/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
import { GraphLoadingOptions } from '../model/GraphLoadingOptions';
import { Graph } from '../model/Graph';
import { ObjectResponse } from '../../../server/services/ObjectResponse';


export class GraphAPIService extends KIXObjectAPIService {

    protected RESOURCE_URI: string;

    protected objectType: KIXObjectType | string = KIXObjectType.GRAPH;

    private static INSTANCE: GraphAPIService;

    public static getInstance(): GraphAPIService {
        if (!GraphAPIService.INSTANCE) {
            GraphAPIService.INSTANCE = new GraphAPIService();
        }
        return GraphAPIService.INSTANCE;
    }

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(type: KIXObjectType | string): boolean {
        return type === KIXObjectType.GRAPH;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, graphLoadingOptions: GraphLoadingOptions
    ): Promise<ObjectResponse<T>> {
        let graph: Graph;

        if (objectType === KIXObjectType.GRAPH && graphLoadingOptions) {
            const graphConfig = {};
            const object = {};
            object['ConfigItemLinkGraphConfig'] = graphConfig;

            if (Array.isArray(graphLoadingOptions.graphOptions)) {
                for (const o of graphLoadingOptions.graphOptions) {
                    if (!o.multiselect && Array.isArray(o.value) && o.value.length) {
                        graphConfig[o.key] = o.value[0];
                    } else {
                        graphConfig[o.key] = o.value;
                    }

                }
            }

            const response = await this.sendRequest(
                token, clientRequestId, graphLoadingOptions.resourceURI, object, KIXObjectType.GRAPH, true
            );
            graph = response[KIXObjectType.GRAPH];
        }

        return new ObjectResponse<T>([graph as any], 1);
    }

}
