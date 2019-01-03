import { WidgetComponentState, AbstractAction } from "@kix/core/dist/model";
import { FAQArticle, Attachment } from "@kix/core/dist/model/kix/faq";
import { InlineContent } from "@kix/core/dist/browser/components";

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
