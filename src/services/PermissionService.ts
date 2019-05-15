import { UIComponent } from "../core/model/UIComponent";
import { HttpService } from "../core/services";
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
        for (const component of uiComponents) {
            const permissionChecks: Array<Promise<boolean>> = [];
            component.permissions.forEach((p) => {
                permissionChecks.push(this.methodAllowed(token, p));
            });
            const checks = await Promise.all(permissionChecks);
            if (!checks.some((c) => !c)) {
                components.push(component);
            }
        }

        return components;
    }

    public async checkPermissions(token: string, permissions: UIComponentPermission[] = []): Promise<boolean> {
        const permissionChecks: Array<Promise<boolean>> = [];
        if (permissions) {
            permissions.forEach((p) => {
                permissionChecks.push(this.methodAllowed(token, p));
            });
        }

        const checks = await Promise.all(permissionChecks);
        return checks.every((c) => c);
    }

    private async  methodAllowed(token: string, permission: UIComponentPermission): Promise<boolean> {
        if (permission.permissions && permission.permissions.length) {
            const response = await HttpService.getInstance().options(token, permission.target)
                .catch((error) => {
                    console.error(error);
                    return null;
                });

            const accessPermission = response.headers.AllowPermissionValue & permission.value;
            return accessPermission === permission.value;
        }

        return true;
    }

}
