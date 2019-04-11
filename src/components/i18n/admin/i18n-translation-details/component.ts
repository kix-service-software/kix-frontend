import {
    AbstractMarkoComponent, ContextService, WidgetService, ActionFactory
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import { KIXObjectType, WidgetType, Translation } from '../../../../core/model';
import { ComponentsService } from '../../../../core/browser/components';
import {
    TranslationDetailsContext, TranslationDetailsContextConfiguration
} from '../../../../core/browser/i18n/admin/context';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

class Component extends AbstractMarkoComponent<ComponentState> {

    private configuration: TranslationDetailsContextConfiguration;

    private translation: Translation;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TranslationDetailsContext>(
            TranslationDetailsContext.CONTEXT_ID
        );

        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Pattern Information"
        ]);

        context.registerListener('translation-details-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (
                objectId: string, translation: Translation, objectType: KIXObjectType, changedProperties: string[]
            ) => {
                if (objectType === KIXObjectType.TRANSLATION) {
                    this.initWidget(context, translation);
                }
            }
        });
        await this.initWidget(context);
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
    }

    private async initWidget(context: TranslationDetailsContext, translation?: Translation): Promise<void> {
        this.state.error = null;
        this.state.loading = true;
        this.translation = translation ? translation : await context.getObject<Translation>().catch((error) => null);

        if (!this.translation) {
            this.state.error = `Keine Übersetzung mit ID ${context.getObjectId()} verfügbar.`;
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
        this.state.title = this.translation.Pattern;
    }

    private async prepareActions(): Promise<void> {
        const config = this.configuration;
        if (config && this.translation) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                config.actions, this.translation
            );

            const generalActions = await ActionFactory.getInstance().generateActions(
                config.generalActions, this.translation
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
