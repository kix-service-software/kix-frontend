import { WidgetComponentState, AbstractAction } from "../../../../core/model";
import { FAQArticle } from "../../../../core/model/kix/faq";
import { StandardTable } from "../../../../core/browser";

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
