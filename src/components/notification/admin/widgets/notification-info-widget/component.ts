/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent, ActionFactory, ContextService, IdService, Label } from '../../../../../core/browser';
import { ComponentState } from './ComponentState';
import { KIXObjectType, Notification, ContextType, ObjectInformationWidgetSettings } from '../../../../../core/model';

class Component extends AbstractMarkoComponent<ComponentState> {

    private contextListenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        this.contextListenerId = IdService.generateDateBasedId('notification-info-widget-');
        context.registerListener(this.contextListenerId, {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (accountId: string, notification: Notification, type: KIXObjectType) => {
                this.initWidget(notification);
            },
            additionalInformationChanged: () => { return; }
        });

        this.initWidget(await context.getObject<Notification>(KIXObjectType.NOTIFICATION));
    }

    public onDestroy() {
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        context.unregisterListener(this.contextListenerId);
    }

    private initWidget(notification: Notification): void {
        this.state.notification = null;
        const settings: ObjectInformationWidgetSettings = this.state.widgetConfiguration.settings;
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
