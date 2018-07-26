import { WidgetComponentState, AbstractAction } from "@kix/core/dist/model";
import { FAQArticle } from "@kix/core/dist/model/kix/faq";
import { Label } from "@kix/core/dist/browser/components";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public faqArticle: FAQArticle = null,
        public actions: AbstractAction[] = [],
        public loading: boolean = true
    ) {
        super();
    }

}
