import { WidgetComponentState, AbstractAction } from "@kix/core/dist/model";
import { FAQArticle } from "@kix/core/dist/model/kix/faq";
import { StandardTable } from "@kix/core/dist/browser";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public faqArticle: FAQArticle = null,
        public actions: AbstractAction[] = [],
        public standardTable: StandardTable = null,
        public loading: boolean = true,
        public filterValue: string = '',
        public filterCount: number = null
    ) {
        super();
    }

}
