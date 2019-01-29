import { Context, WidgetType, WidgetConfiguration, ObjectIcon } from "../../../model";
import { SearchContextConfiguration } from "./SearchContextConfiguration";
import { KIXObjectSearchService } from "../../kix";

export class SearchContext extends Context<SearchContextConfiguration> {

    public static CONTEXT_ID = 'search';

    public getIcon(): string | ObjectIcon {
        return "kix-icon-search";
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return short ? 'Ergebnis Komplexsuche' : 'Komplexsuche';
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        const widget = this.configuration.contentWidgets.find((cw) => cw.instanceId === instanceId);
        return widget ? widget.configuration : undefined;
    }

}
