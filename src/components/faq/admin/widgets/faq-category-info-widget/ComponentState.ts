import { WidgetComponentState, AbstractAction } from "../../../../../core/model";
import { FAQCategory } from "../../../../../core/model/kix/faq";
import { FAQCategoryLabelProvider } from "../../../../../core/browser/faq";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public labelProvider: FAQCategoryLabelProvider = null,
        public actions: AbstractAction[] = [],
        public faqCategory: FAQCategory = null
    ) {
        super();
    }

}
