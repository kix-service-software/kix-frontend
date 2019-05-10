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
            component.permissions.forEach((p) => permissionChecks.push(this.methodAllowed(token, p)));
        }
        return components;
    }

    private async  methodAllowed(token: string, permission: UIComponentPermission): Promise<boolean> {
        const response = await HttpService.getInstance().options(token, permission.target);

        permission.value;

        response.headers.Allow.some((m) => m === )

    }

}
