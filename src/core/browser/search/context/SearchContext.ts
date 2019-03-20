import { WidgetType, WidgetConfiguration, ObjectIcon } from "../../../model";
import { SearchContextConfiguration } from "./SearchContextConfiguration";
import { Context } from '../../../model/components/context/Context';

export class SearchContext extends Context<SearchContextConfiguration> {

    public static CONTEXT_ID = 'search';

    public getIcon(): string | ObjectIcon {
        return "kix-icon-search";
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return short ? 'Translatable#Results advanced search' : 'Translatable#Advanced Search';
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        const widget = this.configuration.contentWidgets.find((cw) => cw.instanceId === instanceId);
        return widget ? widget.configuration : undefined;
    }

}
