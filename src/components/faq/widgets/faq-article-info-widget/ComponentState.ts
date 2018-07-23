import { WidgetComponentState, Customer, AbstractAction } from "@kix/core/dist/model";
import { CustomerLabelProvider } from "@kix/core/dist/browser/customer";
import { FAQArticle } from "@kix/core/dist/model/kix/faq";
import { FAQLabelProvider } from "@kix/core/dist/browser/faq";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public faqArticle: FAQArticle = null,
        public actions: AbstractAction[] = []
    ) {
        super();
    }

}
