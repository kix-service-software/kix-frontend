import {
    AbstractMarkoComponent, ContextService, WidgetService, ActionFactory, IdService
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import { KIXObjectType, ConfigItemClass, WidgetType } from '../../../../core/model';
import { ComponentsService } from '../../../../core/browser/components';
import {
    ConfigItemClassDetailsContextConfiguration, ConfigItemClassDetailsContext
} from '../../../../core/browser/cmdb';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

class Component extends AbstractMarkoComponent<ComponentState> {

    private configuration: ConfigItemClassDetailsContextConfiguration;

    private ciClass: ConfigItemClass;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<ConfigItemClassDetailsContext>(
            ConfigItemClassDetailsContext.CONTEXT_ID
        );
        context.registerListener('config-item-class-details-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (
                objectId: string, ciClass: ConfigItemClass, objectType: KIXObjectType, changedProperties: string[]
            ) => {
                if (objectType === KIXObjectType.CONFIG_ITEM_CLASS) {
                    this.initWidget(context, ciClass);
                }
            }
        });
        await this.initWidget(context);
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
    }

    private async initWidget(context: ConfigItemClassDetailsContext, ciClass?: ConfigItemClass): Promise<void> {
        this.state.error = null;
        this.state.loading = true;
        this.ciClass = ciClass ? ciClass : await context.getObject<ConfigItemClass>().catch((error) => null);

        if (!this.ciClass) {
            this.state.error = await TranslationService.translate(
                'Translatable#No CI Class available for ID {0}.', [context.getObjectId()]
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
        this.state.title = this.ciClass.Name;
    }

    private prepareActions(): void {
        const config = this.configuration;
        if (config && this.ciClass) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                config.actions, this.ciClass
            );

            const generalActions = ActionFactory.getInstance().generateActions(
                config.generalActions, this.ciClass
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
