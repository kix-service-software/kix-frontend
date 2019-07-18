/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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

        const sidebars = await this.checkConfiguration(token, configuration.sidebarWidgets);
        const explorer = await this.checkConfiguration(token, configuration.explorerWidgets);
        const lanes = await this.checkConfiguration(token, configuration.laneWidgets);
        const content = await this.checkConfiguration(token, configuration.contentWidgets);
        const overlays = await this.checkConfiguration(token, configuration.overlayWidgets);

        return new ContextConfiguration(
            configuration.contextId,
            configuration.sidebars, sidebars.map((w) => w),
            configuration.explorer, explorer.map((w) => w),
            configuration.lanes, lanes.map((w) => w),
            configuration.content, content.map((w) => w),
            configuration.generalActions,
            configuration.actions,
            overlays
        );
    }

    private async checkConfiguration(token: string, widgets: ConfiguredWidget[]): Promise<ConfiguredWidget[]> {
        const allowedWidgets: ConfiguredWidget[] = [];
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
            if (permission.target.startsWith('/')) {
                permission.target = permission.target.substr(1, permission.target.length);
            }

            permission.target = permission.target.replace('\*', 'permissioncheck');

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
