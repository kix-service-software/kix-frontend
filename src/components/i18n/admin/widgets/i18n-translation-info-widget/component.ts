import { AbstractMarkoComponent, ActionFactory, ContextService } from '../../../../../core/browser';
import { ComponentState } from './ComponentState';
import { KIXObjectType, TranslationPattern } from '../../../../../core/model';
import { TranslationPatternLabelProvider } from '../../../../../core/browser/i18n';
import { TranslationDetailsContext } from '../../../../../core/browser/i18n/admin/context';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.labelProvider = new TranslationPatternLabelProvider();
        const context = await ContextService.getInstance().getContext<TranslationDetailsContext>(
            TranslationDetailsContext.CONTEXT_ID
        );
        context.registerListener('118n-translation-info-widget', {
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (translationId: string, translation: TranslationPattern, type: KIXObjectType) => {
                if (type === KIXObjectType.TRANSLATION_PATTERN) {
                    this.initWidget(translation);
                }
            }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.initWidget(await context.getObject<TranslationPattern>());
    }

    private async initWidget(translation: TranslationPattern): Promise<void> {
        this.state.translation = translation;
        this.prepareActions();
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.translation) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.translation]
            );
        }
    }

}

module.exports = Component;
