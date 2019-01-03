import { Context, WidgetType, WidgetConfiguration } from "../../../model";
import { CustomerSearchContextConfiguration } from "./CustomerSearchContextConfiguration";

export class CustomerSearchContext extends Context<CustomerSearchContextConfiguration> {

    public static CONTEXT_ID: string = 'search-customer-context';

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        return undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }

}
