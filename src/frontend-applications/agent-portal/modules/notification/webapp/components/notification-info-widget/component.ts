/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { IdService } from '../../../../../model/IdService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ObjectInformationWidgetConfiguration } from '../../../../../model/configuration/ObjectInformationWidgetConfiguration';
import { Label } from '../../../../../modules/base-components/webapp/core/Label';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { Notification } from '../../../model/Notification';

class Component extends AbstractMarkoComponent<ComponentState> {

    private contextListenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        this.contextListenerId = IdService.generateDateBasedId('notification-info-widget-');
        context.registerListener(this.contextListenerId, {
            sidebarLeftToggled: (): void => { return; },
            filteredObjectListChanged: (): void => { return; },
            objectListChanged: () => { return; },
            sidebarRightToggled: (): void => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (accountId: string, notification: Notification, type: KIXObjectType) => {
                this.initWidget(notification);
            },
            additionalInformationChanged: (): void => { return; }
        });

        this.initWidget(await context.getObject<Notification>(KIXObjectType.NOTIFICATION));
    }

    public onDestroy(): void {
        const context = ContextService.getInstance().getActiveContext();
        context.unregisterListener(this.contextListenerId);
    }

    private initWidget(notification: Notification): void {
        this.state.notification = null;
        const settings = this.state.widgetConfiguration.configuration as ObjectInformationWidgetConfiguration;
        if (settings && Array.isArray(settings.properties)) {
            this.state.properties = [...settings.properties];
        }

        setTimeout(() => {
            this.state.notification = notification;
            this.state.eventLabels = this.state.notification && this.state.notification.Events ?
                this.state.notification.Events.map((e) => new Label(null, e, null, e, null, e)) : [];
            this.prepareActions();
        }, 10);
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.notification) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.notification]
            );
        }
    }
}

module.exports = Component;
