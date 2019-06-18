
import {
    AbstractMarkoComponent, ContextService, WidgetService, LabelService, ActionFactory
} from "../../../core/browser";
import { ComponentState } from './ComponentState';
import {
    ContextConfiguration, KIXObject, KIXObjectType, Context, WidgetType, ContextType, ContextMode
} from "../../../core/model";
import { TranslationService } from "../../../core/browser/i18n/TranslationService";
import { EventService } from "../../../core/browser/event";
import { ApplicationEvent } from "../../../core/browser/application";
import { KIXModulesService } from "../../../core/browser/modules";

class Component extends AbstractMarkoComponent<ComponentState> {

    private configuration: ContextConfiguration;

    private object: KIXObject;

    private context: Context;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getActiveContext(ContextType.MAIN);
        this.contextChanged(null, context, ContextType.MAIN, null, null);
        ContextService.getInstance().registerListener({
            contextChanged: this.contextChanged.bind(this)
        });
    }

    private async contextChanged(
        contextId: string, context: Context, type: ContextType, history: boolean, oldContext: Context
    ): Promise<void> {
        if (type === ContextType.MAIN && context.getDescriptor().contextMode === ContextMode.DETAILS) {
            this.context = await ContextService.getInstance().getActiveContext(ContextType.MAIN);

            if (this.context.getDescriptor().contextMode !== ContextMode.DETAILS) {
                this.state.error = 'No details context available.';
                this.state.loading = false;
            } else {
                this.state.instanceId = this.context.getDescriptor().contextId;

                this.context.registerListener('object-details-component', {
                    explorerBarToggled: () => { return; },
                    filteredObjectListChanged: () => { return; },
                    objectListChanged: () => { return; },
                    sidebarToggled: () => { return; },
                    scrollInformationChanged: () => { return; },
                    objectChanged: (
                        objectId: string, object: KIXObject, objectType: KIXObjectType, changedProperties: string[]
                    ) => {
                        this.initWidget(this.context, object);
                    }
                });
                await this.initWidget(this.context);
            }
        }
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
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
        this.state.lanes = context.getLanes();
        this.state.contentWidgets = context.getContent(true);

        await this.prepareActions();

        setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
            window.clearTimeout(loadingTimeout);
            this.state.loading = false;
        }, 10);
    }

    private async prepareActions(): Promise<void> {
        const config = this.configuration;
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
