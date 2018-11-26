import { WidgetComponentState, AbstractAction, KIXObjectPropertyFilter } from "@kix/core/dist/model";
import { FAQArticle } from "@kix/core/dist/model/kix/faq";
import { StandardTable } from "@kix/core/dist/browser";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public actions: AbstractAction[] = [],
        public table: StandardTable = null,
        public loading: boolean = true,
        public title: string = null,
        public predefinedTableFilter: KIXObjectPropertyFilter[] = [],
        public filterCount: number = null
    ) {
        super();
    }

}
