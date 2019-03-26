import {
    AbstractMarkoComponent, ContextService, WidgetService, LabelService, ActionFactory,
    ComponentsService
} from "../../../core/browser";
import { ComponentState } from './ComponentState';
import {
    ContextConfiguration, KIXObject, KIXObjectType, Context, WidgetType, ContextType, ContextMode
} from "../../../core/model";
import { TranslationService } from "../../../core/browser/i18n/TranslationService";

class Component extends AbstractMarkoComponent<ComponentState> {

    private configuration: ContextConfiguration;

    private object: KIXObject;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getActiveContext(ContextType.MAIN);

        if (context.getDescriptor().contextMode !== ContextMode.DETAILS) {
            this.state.error = 'No details context available.';
            this.state.loading = false;
        } else {
            this.state.instanceId = context.getDescriptor().contextId;

            context.registerListener('object-details-component', {
                explorerBarToggled: () => { return; },
                filteredObjectListChanged: () => { return; },
                objectListChanged: () => { return; },
                sidebarToggled: () => { return; },
                scrollInformationChanged: () => { return; },
                objectChanged: (
                    objectId: string, object: KIXObject, objectType: KIXObjectType, changedProperties: string[]
                ) => {
                    this.initWidget(context, object);
                }
            });
            await this.initWidget(context);
        }
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
    }

    private async initWidget(context: Context, object?: KIXObject): Promise<void> {
        this.state.error = null;
        this.state.loading = true;
        this.object = object ? object : await context.getObject().catch((error) => null);

        if (!this.object) {
            this.state.error = await TranslationService.translate(
                'Translatable#No object with ID {1} available.', [context.getObjectId()]
            );
        } else {
            await this.prepareTitle();
        }

        this.configuration = context.getConfiguration();
        this.state.lanes = context.getLanes();
        this.state.tabWidgets = context.getLaneTabs();
        this.state.contentWidgets = context.getContent(true);

        this.prepareActions();

        setTimeout(() => {
            this.state.loading = false;
        }, 100);
    }

    public async prepareTitle(): Promise<void> {
        this.state.title = await LabelService.getInstance().getText(this.object);
    }

    private prepareActions(): void {
        const config = this.configuration;
        if (config && this.object) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                config.actions, this.object
            );

            const generalActions = ActionFactory.getInstance().generateActions(
                config.generalActions, this.object
            );

            WidgetService.getInstance().registerActions(this.state.instanceId, generalActions);
        }
    }

    public getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getActiveContext();
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

    public getLaneWidgetType(): number {
        return WidgetType.LANE;
    }

}

module.exports = Component;
