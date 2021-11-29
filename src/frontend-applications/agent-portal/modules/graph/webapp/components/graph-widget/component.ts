/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { GraphContext } from '../../core/GraphContext';
import { ComponentState } from './ComponentState';
import { Graph } from '../../../model/Graph';
import { GraphInstance } from '../../core/GraphInstance';
import { GraphService } from '../../core/GraphService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';

declare let d3;

class Component extends AbstractMarkoComponent<ComponentState> {

    private context: GraphContext;
    private d3Graph: GraphInstance;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext();

        await this.loadGraph();

        this.context.registerListener('graph-widget', {
            additionalInformationChanged: () => null,
            filteredObjectListChanged: () => null,
            objectChanged: (id: string, graphInstance: GraphInstance) => {
                if (this.d3Graph.instanceId !== graphInstance.instanceId) {
                    this.d3Graph = graphInstance;
                    this.createD3Graph();
                }
            },
            objectListChanged: () => null,
            scrollInformationChanged: () => null,
            sidebarLeftToggled: () => null,
            sidebarRightToggled: () => null,
        });

        this.createD3Graph();
    }

    private async loadGraph(): Promise<void> {
        this.d3Graph = await this.context.getObject<GraphInstance>(KIXObjectType.GRAPH_INSTANCE);
    }

    private async createD3Graph(): Promise<void> {
        this.state.prepared = false;
        this.removeD3Graph();
        if (this.d3Graph) {
            setTimeout(() => {
                this.state.prepared = true;
                setTimeout(() => this.d3Graph.createGraph('#graphdiv'), 250);
            }, 50);
        }
    }

    public onDestroy(): void {
        this.removeD3Graph();
        this.context.unregisterListener('graph-widget');
    }

    private removeD3Graph(): void {
        d3.select('#chartdiv').selectAll('svg').remove();
    }
}
module.exports = Component;
