/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { GraphInstance } from '../../core/GraphInstance';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { GraphEvents } from '../../../model/GraphEvents';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';
import { GraphContextOptions } from '../../../model/GraphContextOptions';
import { GraphOption } from '../../../model/GraphOption';
import { WidgetService } from '../../../../base-components/webapp/core/WidgetService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';

declare let d3;

class Component extends AbstractMarkoComponent<ComponentState> {

    private context: GraphContext;
    private d3Graph: GraphInstance;
    private subscriber: IEventSubscriber;

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

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (finished?: boolean): void => {
                this.state.prepared = Boolean(finished);
            }
        };
        EventService.getInstance().subscribe(GraphEvents.GRAPH_LOADING, this.subscriber);

        this.createD3Graph();
    }

    public onDestroy(): void {
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

        WidgetService.getInstance().setWidgetClasses(this.state.instanceId, widgetClasses);
        WidgetService.getInstance().setWidgetTitle(this.state.instanceId, title);
    }

    private removeD3Graph(): void {
        d3.select('#chartdiv').selectAll('svg').remove();
    }
}
module.exports = Component;
