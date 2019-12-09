/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ContextConfiguration } from '../../../../../model/configuration/ContextConfiguration';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { Context } from 'vm';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ContextType } from '../../../../../model/ContextType';
import { ContextMode } from '../../../../../model/ContextMode';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';
import { WidgetType } from '../../../../../model/configuration/WidgetType';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';


class Component extends AbstractMarkoComponent<ComponentState> {

    private configuration: ContextConfiguration;

    private object: KIXObject;

    private context: Context;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        this.contextChanged(null, context, ContextType.MAIN, null, null);
        ContextService.getInstance().registerListener({
            constexServiceListenerId: 'object-details-component',
            contextChanged: this.contextChanged.bind(this),
            contextRegistered: () => { return; }
        });

        context.registerListener(this.state.instanceId, {
            additionalInformationChanged: () => { return; },
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectChanged: () => this.initWidget(this.context),
            objectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            sidebarToggled: () => { return; }
        });

    }

    private async contextChanged(
        contextId: string, context: Context, type: ContextType, history: boolean, oldContext: Context
    ): Promise<void> {
        if (type === ContextType.MAIN && context.getDescriptor().contextMode === ContextMode.DETAILS) {
            this.context = ContextService.getInstance().getActiveContext(ContextType.MAIN);

            if (this.context.getDescriptor().contextMode !== ContextMode.DETAILS) {
                this.state.error = 'No details context available.';
                this.state.loading = false;
            } else {
                this.state.loading = true;
                this.state.instanceId = this.context.getDescriptor().contextId;
                await this.initWidget(this.context);
            }
        }
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
        ContextService.getInstance().unregisterListener('object-details-component');
    }

    private async initWidget(context: Context, object?: KIXObject): Promise<void> {
        this.state.error = null;
        this.state.loading = true;

        const loadingTimeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: true, hint: '' });
        }, 500);

        this.object = object ? object : await context.getObject().catch((error) => null);

        if (!this.object) {
            this.state.error = await TranslationService.translate(
                'Translatable#No object with ID {0} available.', [context.getObjectId()]
            );
        } else {
            this.state.title = await context.getDisplayText();
        }

        this.configuration = context.getConfiguration();
        this.state.lanes = context.getLanes(true);
        this.state.contentWidgets = context.getContent(true);

        await this.prepareActions();

        setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
            window.clearTimeout(loadingTimeout);
            this.state.loading = false;
        }, 500);
    }

    private async prepareActions(): Promise<void> {
        const config = this.configuration;
        this.state.actions = [];
        if (config && this.object) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                config.actions, this.object
            );

            const generalActions = await ActionFactory.getInstance().generateActions(
                config.generalActions, this.object
            );

            WidgetService.getInstance().registerActions(this.state.instanceId, generalActions);
        }
    }

    public getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getActiveContext();
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? KIXModulesService.getComponentTemplate(config.widgetId) : undefined;
    }

    public getLaneWidgetType(): number {
        return WidgetType.LANE;
    }

}

module.exports = Component;
