import { CustomerContextConfiguration } from ".";
import { ConfiguredWidget, Context, WidgetType, WidgetConfiguration } from "../../../model";

export class CustomerContext extends Context<CustomerContextConfiguration> {

    public static CONTEXT_ID: string = 'customers';

    public getIcon(): string {
        return 'kix-icon-customers';
    }

    public async getDisplayText(): Promise<string> {
        return 'Kunden Dashboard';
    }

    public getContent(show: boolean = false): ConfiguredWidget[] {
        let content = this.configuration.contentWidgets;

        if (show) {
            content = content.filter(
                (c) => this.configuration.content.findIndex((cid) => c.instanceId === cid) !== -1
            );
        }

        return content;
    }

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        const widget = this.configuration.contentWidgets.find((cw) => cw.instanceId === instanceId);
        return widget ? widget.configuration : undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        let widgetType: WidgetType;

        const contentWidget = this.configuration.contentWidgets.find((lw) => lw.instanceId === instanceId);
        widgetType = contentWidget ? WidgetType.CONTENT : undefined;

        return widgetType;
    }

}
