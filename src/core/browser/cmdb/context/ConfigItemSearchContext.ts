import { Context, WidgetType, WidgetConfiguration } from "../../../model";
import { ConfigItemSearchContextConfiguration } from "./ConfigItemSearchContextConfiguration";

export class ConfigItemSearchContext extends Context<ConfigItemSearchContextConfiguration> {

    public static CONTEXT_ID: string = 'search-config-item-context';

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        return undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }

}
