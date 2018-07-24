import { WidgetComponentState, AbstractAction } from "@kix/core/dist/model";
import { FAQArticle } from "@kix/core/dist/model/kix/faq";
import { StandardTable } from "@kix/core/dist/browser";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public faqArticle: FAQArticle = null,
        public actions: AbstractAction[] = [],
        public loading: boolean = true,
        public linkedObjectGroups: Array<[string, StandardTable]> = [],
        public widgetTitle: string = ''
    ) {
        super();
    }

}
