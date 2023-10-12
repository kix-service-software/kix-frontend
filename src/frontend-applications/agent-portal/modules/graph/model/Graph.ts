/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { GraphLink } from './GraphLink';
import { GraphNode } from './GraphNode';

export class Graph<T extends any = any> extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: string = KIXObjectType.GRAPH;

    public Config: any;

    public CreateTimUnix: number;

    public NodeLinks: GraphLink[];

    public Nodes: GraphNode<T>[];

    public Type: string;

    public UserID: number;

    public constructor(graph?: Graph) {
        super(graph);

        if (graph) {
            this.Config = graph.Config;
            this.CreateTimUnix = graph.CreateTimUnix;
            this.NodeLinks = graph.Links as any[];
            this.Nodes = graph.Nodes;
            this.Type = graph.Type;
            this.UserID = graph.UserID;
        }
    }

}
