/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ContextType } from '../../../../../model/ContextType';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';
import { WidgetType } from '../../../../../model/configuration/WidgetType';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { IEventSubscriber } from '../../core/IEventSubscriber';
import { Context } from '../../../../../model/Context';

class Component extends AbstractMarkoComponent<ComponentState> {

    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.subscriber = {
            eventSubscriberId: 'object-details',
            eventPublished: (data: any, eventId: string) => {
                const currentContext = ContextService.getInstance().getActiveContext();
                if (data.objectType === currentContext.descriptor.kixObjectTypes[0]) {
                    this.prepareWidget();
                    this.prepareActions();
                }
            }
        };
        EventService.getInstance().subscribe(ApplicationEvent.OBJECT_UPDATED, this.subscriber);

        this.prepareConfigurations();
        this.prepareWidget();
        this.prepareActions();
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
        EventService.getInstance().unsubscribe(ApplicationEvent.OBJECT_UPDATED, this.subscriber);
    }

    private async prepareConfigurations(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();

        const lanes = context.getLanes(true);
        if (Array.isArray(lanes)) {
            for (const lane of lanes) {
                const template = await this.getWidgetTemplate(lane.instanceId);
                this.state.lanes.push([lane.instanceId, template]);
            }
        }
        (this as any).setStateDirty('lanes');

        const contentWidgets = await context.getContent(true);
        if (Array.isArray(contentWidgets)) {
            for (const cw of contentWidgets) {
                const template = await this.getWidgetTemplate(cw.instanceId);
                this.state.contentWidgets.push([cw.instanceId, template]);
            }
        }
        (this as any).setStateDirty('contentWidgets');
    }

    private async prepareWidget(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.error = null;

        const object = await context.getObject().catch((error) => null);

        if (!object) {
            this.state.error = await TranslationService.translate(
                'Translatable#No object with ID {0} available.', [context.getObjectId()]
            );
        } else {
            this.state.title = await context.getDisplayText();
        }
    }

    private async prepareActions(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const config = context.getConfiguration();

        const object = await context.getObject().catch((error) => null);

        if (config && object) {

            const objectActions = await context.getAdditionalActions();
            const configuredActions = await ActionFactory.getInstance().generateActions(config.actions, object);
            this.state.actions = [...objectActions, ...configuredActions];

            const generalActions = await ActionFactory.getInstance().generateActions(
                config.generalActions, object
            );

            WidgetService.getInstance().registerActions(this.state.instanceId, generalActions);
        }
    }

    private async getWidgetTemplate(instanceId: string): Promise<any> {
        const context = ContextService.getInstance().getActiveContext();
        const config = context ? await context.getWidgetConfiguration(instanceId) : undefined;
        return config ? KIXModulesService.getComponentTemplate(config.widgetId) : undefined;
    }

    public getLaneWidgetType(): number {
        return WidgetType.LANE;
    }

}

module.exports = Component;
