/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../model/Context';
import { ContextPreference } from '../../../../model/ContextPreference';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ApplicationEvent } from '../../../base-components/webapp/core/ApplicationEvent';
import { BrowserCacheService } from '../../../base-components/webapp/core/CacheService';
import { ContextEvents } from '../../../base-components/webapp/core/ContextEvents';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../base-components/webapp/core/IEventSubscriber';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { ConfigItem } from '../../../cmdb/model/ConfigItem';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { Graph } from '../../model/Graph';
import { GraphContextOption } from '../../model/GraphContextOption';
import { GraphContextOptions } from '../../model/GraphContextOptions';
import { GraphEvents } from '../../model/GraphEvents';
import { GraphLoadingOptions } from '../../model/GraphLoadingOptions';
import { GraphService } from './GraphService';

export class GraphContext extends Context {

    public static CONTEXT_ID: string = 'graph-context';

    private subscriber: IEventSubscriber;

    public async initContext(urlParams: URLSearchParams): Promise<void> {
        if (urlParams?.has('requestURI')) {
            this.setAdditionalInformation(GraphContextOptions.GRAPH_REQUEST_URI, decodeURIComponent(urlParams.get('requestURI')));
        }

        if (urlParams?.has('graphOptions')) {
            let options = [];
            const optionsString = decodeURIComponent(urlParams.get('graphOptions'));
            try {
                options = JSON.parse(optionsString);
            } catch (e) {
                options = [];
            }
            this.setAdditionalInformation(GraphContextOptions.GRAPH_OPTIONS, options);
        }

        if (!this.getAdditionalInformation(GraphContextOptions.GRAPH_OPTIONS)) {
            this.setAdditionalInformation(GraphContextOptions.GRAPH_OPTIONS, [new GraphContextOption('MaxDepth', [1], false)]);
        }

        this.subscriber = {
            eventSubscriberId: this.instanceId,
            eventPublished: (prefixes: string[], eventId: string): void => {
                if (prefixes.some((p) => p === KIXObjectType.GRAPH || p === KIXObjectType.GRAPH_INSTANCE)) {
                    EventService.getInstance().publish(ContextEvents.CONTEXT_UPDATE_REQUIRED, this);
                }
            }
        };
        EventService.getInstance().subscribe(ApplicationEvent.CACHE_KEYS_DELETED, this.subscriber);
    }

    public async destroy(): Promise<void> {
        super.destroy();
        this.removeCachedGraph();
        EventService.getInstance().unsubscribe(ApplicationEvent.CACHE_KEYS_DELETED, this.subscriber);
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        let displayText = this.displayText;
        const cis = await KIXObjectService.loadObjects<ConfigItem>(KIXObjectType.CONFIG_ITEM, [this.getObjectId()])
            .catch((): ConfigItem[] => []);

        if (Array.isArray(cis) && cis.length) {
            displayText = await LabelService.getInstance().getObjectText(cis[0]);
        }

        return await TranslationService.translate(displayText);
    }

    public async getObject<O = any>(
        objectType: KIXObjectType | string = null, reload: boolean = false, changedProperties?: string[]
    ): Promise<O> {
        if (objectType === KIXObjectType.GRAPH) {
            const graphOptions = this.getAdditionalInformation(GraphContextOptions.GRAPH_OPTIONS);
            let graph: Graph;
            const requestURI = this.getAdditionalInformation(GraphContextOptions.GRAPH_REQUEST_URI);
            if (requestURI) {
                const graphList = await KIXObjectService.loadObjects<Graph>(
                    KIXObjectType.GRAPH, null, null, new GraphLoadingOptions(requestURI, graphOptions)
                );
                graph = Array.isArray(graphList) && graphList.length ? graphList[0] as any : null;
            }
            return graph as any;
        } else if (objectType === KIXObjectType.GRAPH_INSTANCE) {
            EventService.getInstance().publish(GraphEvents.GRAPH_LOADING);
            const graph = await this.getObject<Graph>(KIXObjectType.GRAPH);
            let graphInstance = BrowserCacheService.getInstance().get(
                graph.Type + this.getObjectId()?.toString(), KIXObjectType.GRAPH_INSTANCE
            );
            if (!graphInstance) {
                graphInstance = GraphService.createGraphInstance(graph, this.getObjectId());

                BrowserCacheService.getInstance().set(
                    graph.Type + this.getObjectId()?.toString(), graphInstance, KIXObjectType.GRAPH_INSTANCE
                );

                setTimeout(() => {
                    this.listeners.forEach(
                        (l) => l.objectChanged(null, graphInstance, KIXObjectType.GRAPH_INSTANCE)
                    );
                }, 100);
            } else {
                EventService.getInstance().publish(GraphEvents.GRAPH_LOADING, true);
            }

            return graphInstance as any;
        }
    }

    public async getUrl(): Promise<string> {
        let url: string = '';
        if (Array.isArray(this.descriptor.urlPaths) && this.descriptor.urlPaths.length) {
            url = `${this.descriptor.urlPaths[0]}/${this.getObjectId()}`;
            const params = [];
            const requestURI = this.getAdditionalInformation(GraphContextOptions.GRAPH_REQUEST_URI);
            if (requestURI) {
                params.push(`requestURI=${encodeURIComponent(requestURI)}`);
            }

            const graphOptions = this.getAdditionalInformation(GraphContextOptions.GRAPH_OPTIONS);
            if (Array.isArray(graphOptions)) {
                const optionsParameter = JSON.stringify(graphOptions);
                params.push(`graphOptions=${encodeURIComponent(optionsParameter)}`);
            }

            if (params.length) {
                url += `?${params.join('&')}`;
            }
        }
        return url;
    }

    public async addStorableAdditionalInformation(contextPreference: ContextPreference): Promise<void> {
        super.addStorableAdditionalInformation(contextPreference);
        contextPreference[GraphContextOptions.GRAPH_REQUEST_URI] = this.getAdditionalInformation(
            GraphContextOptions.GRAPH_REQUEST_URI
        );
        contextPreference[GraphContextOptions.GRAPH_OPTIONS] = this.getAdditionalInformation(
            GraphContextOptions.GRAPH_OPTIONS
        );
    }

    public async loadAdditionalInformation(contextPreference: ContextPreference): Promise<void> {
        super.loadAdditionalInformation(contextPreference);
        this.setAdditionalInformation(
            GraphContextOptions.GRAPH_REQUEST_URI, contextPreference[GraphContextOptions.GRAPH_REQUEST_URI]
        );
        this.setAdditionalInformation(
            GraphContextOptions.GRAPH_OPTIONS, contextPreference[GraphContextOptions.GRAPH_OPTIONS]
        );
    }

    public setGraphOptions(graphContextOptions: GraphContextOption[]): void {
        this.removeCachedGraph();
        this.setAdditionalInformation(GraphContextOptions.GRAPH_OPTIONS, graphContextOptions);
        this.getObject(KIXObjectType.GRAPH_INSTANCE);
        ContextService.getInstance().setDocumentHistory(false, this, this, null);
    }

    private removeCachedGraph(): void {
        BrowserCacheService.getInstance().deleteKeys(KIXObjectType.GRAPH);
        BrowserCacheService.getInstance().deleteKeys(KIXObjectType.GRAPH_INSTANCE);
    }

}
