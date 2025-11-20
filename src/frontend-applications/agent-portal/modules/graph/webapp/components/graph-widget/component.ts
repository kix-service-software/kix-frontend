/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { GraphContext } from '../../core/GraphContext';
import { ComponentState } from './ComponentState';
import { GraphInstance } from '../../core/GraphInstance';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { GraphEvents } from '../../../model/GraphEvents';
import { GraphContextOptions } from '../../../model/GraphContextOptions';
import { GraphOption } from '../../../model/GraphOption';
import { WidgetService } from '../../../../base-components/webapp/core/WidgetService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';

declare let d3;

class Component extends AbstractMarkoComponent<ComponentState, GraphContext> {

    private d3Graph: GraphInstance;

    public onCreate(input: any): void {
        super.onCreate(input, 'graph-widget');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        await this.loadGraph();

        this.context?.registerListener('graph-widget', {
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

        super.registerEventSubscriber(
            function (finished?: boolean): void {
                this.state.prepared = Boolean(finished);
            },
            [GraphEvents.GRAPH_LOADING]
        );

        this.createD3Graph();
    }

    public onDestroy(): void {
        super.onDestroy();
        this.removeD3Graph();
        this.context.unregisterListener('graph-widget');
    }

    private async loadGraph(): Promise<void> {
        this.d3Graph = await this.context.getObject<GraphInstance>(KIXObjectType.GRAPH_INSTANCE);
    }

    private async createD3Graph(): Promise<void> {
        this.state.prepared = false;

        await this.setSimulationMode();

        this.removeD3Graph();
        if (this.d3Graph) {
            setTimeout(() => {
                this.state.prepared = true;
                setTimeout(() => this.d3Graph.createGraph('#graphdiv'), 250);
            }, 50);
        }

    }

    private async setSimulationMode(): Promise<void> {
        const graphOptions: Array<GraphOption> = this.context.getAdditionalInformation(
            GraphContextOptions.GRAPH_OPTIONS
        );

        let title = await TranslationService.translate('Translatable#Graph');
        const widgetClasses = [];
        if (graphOptions.some((go) => go.key === 'Simulate')) {
            title = await TranslationService.translate('Translatable#Graph (simulation active)');
            widgetClasses.push('simulation-active');
        }

        this.context.widgetService.setWidgetClasses(this.state.instanceId, widgetClasses);
        this.context.widgetService.setWidgetTitle(this.state.instanceId, title);
    }

    private removeD3Graph(): void {
        d3.select('#chartdiv').selectAll('svg').remove();
        this.d3Graph.removeListener();
    }
}
module.exports = Component;
