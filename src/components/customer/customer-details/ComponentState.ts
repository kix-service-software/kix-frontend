import { ConfiguredWidget, AbstractAction, Customer } from "../../../core/model";
import { CustomerDetailsContextConfiguration } from "../../../core/browser/customer";

export class ComponentState {

    public constructor(
        public instanceId: string = '20180710-customer-details',
        public lanes: ConfiguredWidget[] = [],
        public tabWidgets: ConfiguredWidget[] = [],
        public contentActions: AbstractAction[] = [],
        public loading: boolean = false,
        public configuration: CustomerDetailsContextConfiguration = null,
        public customer: Customer = null,
        public error: any = null,
        public title: string = ''
    ) { }

}
