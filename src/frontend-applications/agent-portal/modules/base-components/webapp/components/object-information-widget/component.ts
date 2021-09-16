/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ComponentInput } from './ComponentInput';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import {
    ObjectInformationWidgetConfiguration
} from '../../../../../model/configuration/ObjectInformationWidgetConfiguration';
import { IdService } from '../../../../../model/IdService';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';

class Component {

    private state: ComponentState;

    private contextListenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentInput): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        const settings = this.state.widgetConfiguration
            ? this.state.widgetConfiguration.configuration as ObjectInformationWidgetConfiguration
            : null;

        if (settings) {
            this.state.properties = settings.properties;
            this.state.flat = settings.displayFlatList;
            this.state.routingConfigurations = settings.routingConfigurations;
        }

        this.contextListenerId = IdService.generateDateBasedId('object-information-widget-');
        context.registerListener(this.contextListenerId, {
            sidebarLeftToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarRightToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (contactId: string, object: KIXObject, type: KIXObjectType) => {
                this.initWidget(settings);
            },
            additionalInformationChanged: () => { return; }
        });

        this.initWidget(settings);
    }

    public onDestroy() {
        const context = ContextService.getInstance().getActiveContext();
        context.unregisterListener(this.contextListenerId);
    }

    private async initWidget(settings: ObjectInformationWidgetConfiguration): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const object = settings ? await context.getObject(settings.objectType) : null;
        this.state.object = null;

        setTimeout(() => {
            this.state.object = object;
            this.prepareActions();
        }, 10);
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.object) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.object]
            );
        }
    }

}

module.exports = Component;
