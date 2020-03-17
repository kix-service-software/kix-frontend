/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from "../../../../model/Context";
import { AdminModule } from "../../model/AdminModule";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";

export class AdminContext extends Context {

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

    public reset(refresh?: boolean): void {
        super.reset();
        if (!refresh) {
            this.adminModule = null;
            this.categoryName = null;
        }
    }

}
