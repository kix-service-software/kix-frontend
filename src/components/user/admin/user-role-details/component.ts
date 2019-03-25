import {
    AbstractMarkoComponent, ContextService, WidgetService, ActionFactory
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import { KIXObjectType, Role, WidgetType } from '../../../../core/model';
import { ComponentsService } from '../../../../core/browser/components';
import { RoleDetailsContext, RoleDetailsContextConfiguration } from '../../../../core/browser/user';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

class Component extends AbstractMarkoComponent<ComponentState> {

    private configuration: RoleDetailsContextConfiguration;

    private role: Role;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<RoleDetailsContext>(
            RoleDetailsContext.CONTEXT_ID
        );
        context.registerListener('user-role-details-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (
                objectId: string, role: Role, objectType: KIXObjectType, changedProperties: string[]
            ) => {
                if (objectType === KIXObjectType.ROLE) {
                    this.initWidget(context, role);
                }
            }
        });
        await this.initWidget(context);
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
    }

    private async initWidget(context: RoleDetailsContext, role?: Role): Promise<void> {
        this.state.error = null;
        this.state.loading = true;
        this.role = role ? role : await context.getObject<Role>().catch((error) => null);

        if (!this.role) {
            this.state.error = await TranslationService.translate(
                'Translatable#No role with ID {1} available.', [context.getObjectId()]
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
        this.state.title = this.role.Name;
    }

    private prepareActions(): void {
        const config = this.configuration;
        if (config && this.role) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                config.actions, this.role
            );

            const generalActions = ActionFactory.getInstance().generateActions(
                config.generalActions, this.role
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
