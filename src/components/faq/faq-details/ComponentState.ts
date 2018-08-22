import { FAQArticle } from "@kix/core/dist/model/kix/faq";
import { FAQDetailsContextConfiguration } from "@kix/core/dist/browser/faq";
import { ConfiguredWidget } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public instanceId: string = '20180710-faq-details',
        public faqArticle: FAQArticle = null,
        public configuration: FAQDetailsContextConfiguration = null,
        public error: any = null,
        public lanes: ConfiguredWidget[] = [],
        public tabWidgets: ConfiguredWidget[] = [],
        public loading: boolean = true
    ) { }

}
