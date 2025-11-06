/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ApplicationEvent } from '../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';
import { WidgetType } from '../../../../../model/configuration/WidgetType';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ContextService } from '../../core/ContextService';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input, 'object-details-page');
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        super.registerEventSubscriber(
            async function (data: any, eventId: string): Promise<void> {
                this.state.prepared = false;
                const activeContext = ContextService.getInstance().getActiveContext();
                if (
                    activeContext?.instanceId === this.contextInstanceId
                    && data.objectType === this.context?.descriptor?.kixObjectTypes[0]
                ) {
                    await this.prepareWidget();
                    await this.prepareActions();
                }
                this.state.prepared = true;
            },
            [ApplicationEvent.OBJECT_UPDATED]
        );

        await this.update();
        this.state.prepared = true;
    }

    private async update(): Promise<void> {
        this.prepareConfigurations();
        this.prepareWidget();
        this.prepareActions();
    }

    public onDestroy(): void {
        super.onDestroy();
        this.context.widgetService.unregisterActions(this.state.instanceId);
    }

    private async prepareConfigurations(): Promise<void> {

        const lanes = await this.context?.getLanes(true);
        if (Array.isArray(lanes)) {
            for (const lane of lanes) {
                const template = await this.getWidgetTemplate(lane.instanceId);
                this.state.lanes.push([lane.instanceId, template]);
            }
        }
        (this as any).setStateDirty('lanes');

        const contentWidgets = await this.context?.getContent(true);
        if (Array.isArray(contentWidgets)) {
            for (const cw of contentWidgets) {
                const template = await this.getWidgetTemplate(cw.instanceId);
                this.state.contentWidgets.push([cw.instanceId, template]);
            }
        }
        (this as any).setStateDirty('contentWidgets');
    }

    private async prepareWidget(): Promise<void> {
        this.state.error = null;

        const object = await this.context?.getObject().catch((error) => null);

        if (!object) {
            this.state.error = await TranslationService.translate(
                'Translatable#No object with ID {0} available.', [this.context.getObjectId()]
            );
        } else {
            this.state.title = await this.context.getDisplayText();
            this.context.setDisplayText(this.state.title);
        }
    }

    private async prepareActions(): Promise<void> {
        const config = this.context?.getConfiguration();

        const object = await this.context?.getObject().catch((error) => null);

        if (config && object) {

            const objectActions = await this.context?.getAdditionalActions();
            const configuredActions = await ActionFactory.getInstance().generateActions(
                config.actions, object, this.contextInstanceId
            );
            this.state.actions = [...objectActions, ...configuredActions];

            const generalActions = await ActionFactory.getInstance().generateActions(
                config.generalActions, object, this.contextInstanceId
            );

            this.context.widgetService.registerActions(this.state.instanceId, generalActions);
        }
    }

    private async getWidgetTemplate(instanceId: string): Promise<any> {
        const config = await this.context?.getWidgetConfiguration(instanceId);
        return config ? KIXModulesService.getComponentTemplate(config.widgetId) : undefined;
    }

    public getLaneWidgetType(): number {
        return WidgetType.LANE;
    }


    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;
