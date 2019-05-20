import { AbstractMarkoComponent, ActionFactory, ContextService } from '../../../../../core/browser';
import { ComponentState } from './ComponentState';
import { FAQCategory } from '../../../../../core/model/kix/faq';
import { KIXObjectType } from '../../../../../core/model';
import { FAQCategoryLabelProvider } from '../../../../../core/browser/faq';
import { FAQCategoryDetailsContext } from '../../../../../core/browser/faq/admin';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.labelProvider = new FAQCategoryLabelProvider();
        const context = await ContextService.getInstance().getContext<FAQCategoryDetailsContext>(
            FAQCategoryDetailsContext.CONTEXT_ID
        );
        context.registerListener('faq-category-info-widget', {
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (categoryId: string, faqCategory: FAQCategory, type: KIXObjectType) => {
                if (type === KIXObjectType.FAQ_CATEGORY) {
                    this.initWidget(faqCategory);
                }
            }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.initWidget(await context.getObject<FAQCategory>());
    }

    private async initWidget(faqCategory: FAQCategory): Promise<void> {
        this.state.faqCategory = faqCategory;
        this.prepareActions();
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.faqCategory) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.faqCategory]
            );
        }
    }

}

module.exports = Component;
