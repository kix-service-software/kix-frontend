import { UIComponent } from "../core/model/UIComponent";
import { HttpService, LoggingService } from "../core/services";
import { UIComponentPermission } from "../core/model/UIComponentPermission";

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
        const permissionChecks: Array<Promise<boolean>> = [];
        for (const component of uiComponents) {
            component.permissions.forEach((p) => {
                permissionChecks.push(this.methodAllowed(token, p));
            });
        }
        const checks = await Promise.all(permissionChecks);

        for (let i = 0; i < uiComponents.length; i++) {
            if (checks[i]) {
                components.push(uiComponents[i]);
            }
        }

        return components;
    }

    private async  methodAllowed(token: string, permission: UIComponentPermission): Promise<boolean> {
        const response = await HttpService.getInstance().options(token, permission.target)
            .catch((error) => {
                console.error(error);
                return null;
            });
        return response !== null && (response.headers.AllowPermissionValue & permission.value) > 0;
    }

}
