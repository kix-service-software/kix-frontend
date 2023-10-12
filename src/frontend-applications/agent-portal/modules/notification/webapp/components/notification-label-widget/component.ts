/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { Label } from '../../../../../modules/base-components/webapp/core/Label';
import { NotificationLabelProvider } from '../../core';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { IdService } from '../../../../../model/IdService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { ObjectInformationWidgetConfiguration } from '../../../../../model/configuration/ObjectInformationWidgetConfiguration';
import { NotificationProperty } from '../../../model/NotificationProperty';
import { SortUtil } from '../../../../../model/SortUtil';
import { DataType } from '../../../../../model/DataType';
import { Notification } from '../../../model/Notification';

class Component extends AbstractMarkoComponent<ComponentState> {

    private contextListenerId: string;
    private labels: Map<string, Label[]>;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.prepared = false;
        this.state.labelProvider = new NotificationLabelProvider();
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;
        this.contextListenerId = IdService.generateDateBasedId('notification-label-widget');

        context.registerListener(this.contextListenerId, {
            sidebarRightToggled: (): void => { return; },
            sidebarLeftToggled: (): void => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: (): void => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (ticketId: string, notification: Notification, type: KIXObjectType) => {
                if (type === KIXObjectType.NOTIFICATION) {
                    this.initWidget(notification);
                }
            },
            additionalInformationChanged: (): void => { return; }
        });
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        await this.initWidget(await context.getObject<Notification>());
    }

    public onDestroy(): void {
        const context = ContextService.getInstance().getActiveContext();
        context.unregisterListener(this.contextListenerId);
    }

    private async initWidget(notification: Notification): Promise<void> {
        this.state.notification = null;

        setTimeout(async () => {
            await this.setPropertiesAndLabels(notification);
            this.state.notification = notification;
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

    private async setPropertiesAndLabels(notification: Notification): Promise<void> {
        const settings = this.state.widgetConfiguration.configuration as ObjectInformationWidgetConfiguration;
        if (settings && Array.isArray(settings.properties)) {
            this.state.properties = [...settings.properties];
        }
        this.labels = new Map();
        this.state.properties.forEach(async (p) => {
            if (this.isLabelList(p)) {
                const labels = await this.getLabels(p, notification);
                this.labels.set(p, labels);
                this.state.prepared = true;
            }
        });
    }

    public isLabelList(property: string): boolean {
        return property === NotificationProperty.DATA_EVENTS
            || property === NotificationProperty.DATA_RECIPIENTS
            || property === NotificationProperty.DATA_RECIPIENT_AGENTS
            || property === NotificationProperty.DATA_RECIPIENT_EMAIL
            || property === NotificationProperty.DATA_RECIPIENT_ROLES;
    }

    private async getLabels(property: string, notification: Notification): Promise<Label[]> {
        const labels: Label[] = [];
        if (notification) {
            const values = await this.state.labelProvider.getPropertyValues(property, notification[property]);
            for (const v of values) {
                const icons = await this.state.labelProvider.getIcons(null, property, v);
                labels.push(
                    new Label(null, v, icons && !!icons.length ? icons[0] : null, v, null, v)
                );
            }
        }
        return SortUtil.sortObjects(labels, 'text', DataType.STRING);
    }

    public getLabelList(property: string): Label[] {
        return this.labels.has(property) ? this.labels.get(property) : [];
    }

}

module.exports = Component;
