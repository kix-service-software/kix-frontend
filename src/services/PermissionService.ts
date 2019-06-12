import { UIComponent } from "../core/model/UIComponent";
import { HttpService } from "../core/services";
import { UIComponentPermission } from "../core/model/UIComponentPermission";
import { ContextConfiguration, ConfiguredWidget } from "../core/model";

export class PermissionService {

    private static INSTANCE: PermissionService;

    public static getInstance(): PermissionService {
        if (!PermissionService.INSTANCE) {
            PermissionService.INSTANCE = new PermissionService();
        }
        return PermissionService.INSTANCE;
    }

    private constructor() { }

    public async filterUIComponents(token: string, uiComponents: UIComponent[]): Promise<UIComponent[]> {
        const components: UIComponent[] = [];
        for (const component of uiComponents) {
            if (await this.checkPermissions(token, component.permissions)) {
                components.push(component);
            }
        }

        return components;
    }

    public async filterContextConfiguration(
        token: string, configuration: ContextConfiguration
    ): Promise<ContextConfiguration> {

        const sidebars = await this.checkConfiguration(token, configuration.sidebars, configuration.sidebarWidgets);
        const explorer = await this.checkConfiguration(token, configuration.explorer, configuration.explorerWidgets);
        const lanes = await this.checkConfiguration(token, configuration.lanes, configuration.laneWidgets);
        const laneTabs = await this.checkConfiguration(token, configuration.laneTabs, configuration.laneTabWidgets);
        const content = await this.checkConfiguration(token, configuration.content, configuration.contentWidgets);
        const overlays = await this.checkConfiguration(
            token, configuration.overlayWidgets.map((ow) => ow.instanceId), configuration.overlayWidgets
        );

        return new ContextConfiguration(
            configuration.contextId,
            sidebars.map((w) => w.instanceId), sidebars.map((w) => w),
            explorer.map((w) => w.instanceId), explorer.map((w) => w),
            lanes.map((w) => w.instanceId), lanes.map((w) => w),
            laneTabs.map((w) => w.instanceId), laneTabs.map((w) => w),
            content.map((w) => w.instanceId), content.map((w) => w),
            configuration.generalActions,
            configuration.actions,
            overlays
        );
    }

    private async checkConfiguration(
        token: string, instanceIds: string[], widgets: ConfiguredWidget[]
    ): Promise<ConfiguredWidget[]> {
        const allowedWidgets: ConfiguredWidget[] = [];
        widgets = widgets.filter((w) => instanceIds.some((id) => id === w.instanceId));
        for (const widget of widgets) {
            const allowed = await this.checkPermissions(token, widget.permissions);
            if (allowed) {
                allowedWidgets.push(widget);
            }
        }
        return allowedWidgets;
    }

    public async checkPermissions(token: string, permissions: UIComponentPermission[] = []): Promise<boolean> {
        if (permissions && permissions.length) {
            const andPermissionChecks: Array<Promise<boolean>> = [];
            const orPermissionChecks: Array<Promise<boolean>> = [];
            if (permissions) {
                permissions.filter((p) => p.OR).forEach((p) => {
                    orPermissionChecks.push(this.methodAllowed(token, p));
                });
                permissions.filter((p) => !p.OR).forEach((p) => {
                    andPermissionChecks.push(this.methodAllowed(token, p));
                });
            }

            const andChecks = await Promise.all(andPermissionChecks);
            const andCheck = andChecks.every((c) => c);

            const orChecks = await Promise.all(orPermissionChecks);
            const orCheck = orChecks.some((c) => c);

            return andChecks.length === 0 && orChecks.length > 0
                ? orCheck
                : andCheck || orCheck;
        }
        return true;
    }

    private async  methodAllowed(token: string, permission: UIComponentPermission): Promise<boolean> {
        if (permission.permissions && permission.permissions.length) {
            const response = await HttpService.getInstance().options(token, permission.target)
                .catch((error) => {
                    console.error(error);
                    return null;
                });

            if (response !== null) {
                const accessPermission = response.headers.AllowPermissionValue & permission.value;
                return accessPermission === permission.value;
            } else {
                return false;
            }
        }

        return true;
    }

}
