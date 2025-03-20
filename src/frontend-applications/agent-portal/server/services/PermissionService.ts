/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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

    public async checkPermissions(
        token: string, permissions: UIComponentPermission[] = [], clientRequestId: string, object?: any
    ): Promise<boolean> {
        if (permissions && permissions.length) {

            if (!token) {
                return false;
            }

            const andPermissionChecks: Array<Promise<boolean>> = [];
            const orPermissionChecks: Array<Promise<boolean>> = [];
            permissions.filter((p) => p.OR).forEach((p) => {
                orPermissionChecks.push(this.methodAllowed(token, p, object, clientRequestId));
            });
            permissions.filter((p) => !p.OR).forEach((p) => {
                andPermissionChecks.push(this.methodAllowed(token, p, object, clientRequestId));
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

    private async methodAllowed(
        token: string, permission: UIComponentPermission, object: any, clientRequestId: string
    ): Promise<boolean> {
        if (permission.permissions && permission.permissions.length) {
            if (permission.target.startsWith('/')) {
                permission.target = permission.target.substr(1, permission.target.length);
            }

            const response = await HttpService.getInstance().options(
                token, permission.target, object, clientRequestId, permission.collection
            ).catch((error) => {
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
