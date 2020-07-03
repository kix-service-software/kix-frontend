/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { UIComponent } from '../../model/UIComponent';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { HttpService } from './HttpService';

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

        const sidebars = await this.checkConfiguration(token, configuration.sidebars);
        const explorer = await this.checkConfiguration(token, configuration.explorer);
        const lanes = await this.checkConfiguration(token, configuration.lanes);
        const content = await this.checkConfiguration(token, configuration.content);
        const overlays = await this.checkConfiguration(token, configuration.overlays);
        const others = await this.checkConfiguration(token, configuration.others);
        const dialogs = await this.checkConfiguration(token, configuration.dialogs);

        return new ContextConfiguration(
            configuration.id, configuration.name, configuration.type,
            configuration.contextId,
            sidebars.map((w) => w),
            explorer.map((w) => w),
            lanes.map((w) => w),
            content.map((w) => w),
            configuration.generalActions,
            configuration.actions,
            overlays,
            others,
            dialogs
        );
    }

    private async checkConfiguration<T extends ConfiguredWidget>(
        token: string, widgets: T[]
    ): Promise<T[]> {
        const allowedWidgets: T[] = [];
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
            permissions.filter((p) => p.OR).forEach((p) => {
                orPermissionChecks.push(this.methodAllowed(token, p));
            });
            permissions.filter((p) => !p.OR).forEach((p) => {
                andPermissionChecks.push(this.methodAllowed(token, p));
            });

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

            if (response !== null && permission.value) {
                const permissionValue = Number(permission.value);
                const accessPermission = response.headers.AllowPermissionValue & permissionValue;
                return accessPermission === permissionValue;
            } else {
                return false;
            }
        }

        return true;
    }

}
