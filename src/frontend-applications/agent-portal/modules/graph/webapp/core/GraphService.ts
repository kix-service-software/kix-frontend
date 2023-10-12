/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { Graph } from '../../model/Graph';
import { GraphInstance } from './GraphInstance';

export class GraphService extends KIXObjectService {

    private static INSTANCE: GraphService;

    private graphInstanceConstructor: Map<string, new (graph: Graph, rootObjectId: string | number) => GraphInstance> =
        new Map();

    public static getInstance(): GraphService {
        if (!GraphService.INSTANCE) {
            GraphService.INSTANCE = new GraphService();
        }
        return GraphService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.GRAPH);
        this.objectConstructors.set(KIXObjectType.GRAPH, [Graph]);
    }

    public isServiceFor(type: KIXObjectType | string): boolean {
        return type === KIXObjectType.GRAPH;
    }

    public getLinkObjectName(): string {
        return 'Graph';
    }

    public static registerGraphInstance(
        type: string, graphInstanceConstructor: new (graph: Graph, rootObjectId: string | number) => GraphInstance
    ): void {
        this.getInstance().graphInstanceConstructor.set(type, graphInstanceConstructor);
    }

    public static createGraphInstance(graph: Graph, rootObjectId: string | number): GraphInstance {
        let graphInstance: GraphInstance;
        const graphInstanceConstructor = this.getInstance().graphInstanceConstructor.get(graph?.Type);
        if (graphInstanceConstructor) {
            graphInstance = new graphInstanceConstructor(graph, rootObjectId);
        }
        return graphInstance;
    }

}
