import { ContextService } from "@kix/core/dist/browser";
import { FAQDetailsContext } from "@kix/core/dist/browser/faq";
import { ComponentState } from './ComponentState';
import { KIXObjectType } from "@kix/core/dist/model";
import { FAQArticle } from "@kix/core/dist/model/kix/faq";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = (ContextService.getInstance().getActiveContext() as FAQDetailsContext);
        this.state.faqArticleId = context.objectId.toString();
        if (!this.state.faqArticleId) {
            this.state.error = 'No faq article id given.';
        } else {
            this.state.configuration = context.configuration;
            this.state.lanes = context.getLanes();
            this.state.tabWidgets = context.getLaneTabs();
            await this.loadFAQArticle();
        }
    }

    private async loadFAQArticle(): Promise<void> {
        const faqArticles = await ContextService.getInstance().loadObjects<FAQArticle>(
            KIXObjectType.FAQ_ARTICLE, [this.state.faqArticleId]
        ).catch((error) => {
            this.state.error = error;
        });

        if (faqArticles && faqArticles.length) {
            this.state.faqArticle = faqArticles[0];
        } else {
            this.state.error = `No contact found for id ${this.state.faqArticleId}`;
        }
    }

}

module.exports = Component;
