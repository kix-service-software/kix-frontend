import { FAQArticle } from "../../../core/model/kix/faq";
import { FAQDetailsContextConfiguration } from "../../../core/browser/faq";
import { ConfiguredWidget } from "../../../core/model";
import { AbstractComponentState } from "../../../core/browser";

export class ComponentState extends AbstractComponentState {

    public constructor(
        public instanceId: string = '20180710-faq-details',
        public faqArticle: FAQArticle = null,
        public configuration: FAQDetailsContextConfiguration = null,
        public error: any = null,
        public lanes: ConfiguredWidget[] = [],
        public tabWidgets: ConfiguredWidget[] = [],
        public contentWidgets: ConfiguredWidget[] = [],
        public loading: boolean = true,
        public title: string = ''
    ) {
        super();
    }

}
