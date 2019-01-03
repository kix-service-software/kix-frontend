import { WidgetComponentState, AbstractAction } from "../../../../core/model";
import { FAQArticle } from "../../../../core/model/kix/faq";
import { Label } from "../../../../core/browser/components";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public faqArticle: FAQArticle = null,
        public actions: AbstractAction[] = [],
        public labels: Label[] = [],
        public loading: boolean = true
    ) {
        super();
    }

}
