import {
    ConfiguredWidget, Context, WidgetType, WidgetConfiguration, AdminModule, KIXObjectType
} from "../../../model";
import { AdminContextConfiguration } from "./AdminContextConfiguration";

export class AdminContext extends Context<AdminContextConfiguration> {

    public static CONTEXT_ID: string = 'admin';

    public adminModule: AdminModule;
    public categoryName: string;

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(): Promise<string> {
        return 'Admin Dashboard';
    }

    public setAdminModule(adminModule: AdminModule, categoryName: string): void {
        if (!this.adminModule || this.adminModule.id !== adminModule.id) {
            this.adminModule = adminModule;
            this.categoryName = categoryName;
            this.listeners.forEach((l) => l.objectChanged(adminModule.id, adminModule, KIXObjectType.ANY));
        }
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
