import { WidgetComponentState, AbstractAction } from "../../../../core/model";
import { FAQArticle, Attachment } from "../../../../core/model/kix/faq";
import { InlineContent } from "../../../../core/browser/components";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public faqArticle: FAQArticle = null,
        public attachments: Attachment[] = [],
        public inlineContent: InlineContent[] = [],
        public actions: AbstractAction[] = [],
        public loading: boolean = true,
    ) {
        super();
    }

}
