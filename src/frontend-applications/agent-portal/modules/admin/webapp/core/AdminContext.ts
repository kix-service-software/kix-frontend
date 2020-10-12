/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../model/Context';

export class AdminContext extends Context {

    public static CONTEXT_ID: string = 'admin';

    public adminModuleId: string;
    public categoryName: string;

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(): Promise<string> {
        return 'Admin Dashboard';
    }

    public setAdminModule(adminModuleId: string, categoryName: string): void {
        if (!this.adminModuleId || this.adminModuleId !== adminModuleId) {
            this.adminModuleId = adminModuleId;
            this.categoryName = categoryName;
            this.listeners.forEach((l) => l.objectChanged(null, null, null));
        }
    }

    public reset(refresh?: boolean): void {
        super.reset();
        if (!refresh) {
            this.adminModuleId = null;
            this.categoryName = null;
        }
    }

}
