/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../model/Context';
import { ContextService } from '../../../base-components/webapp/core/ContextService';

export class AdminContext extends Context {

    public static CONTEXT_ID: string = 'admin';

    public adminModuleId: string;
    public categoryName: string;
    public filterValue: string;

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(): Promise<string> {
        return 'Admin Dashboard';
    }

    public async initContext(urlParams: URLSearchParams): Promise<void> {
        if (urlParams) {
            if (urlParams.has('moduleId')) {
                this.adminModuleId = decodeURI(urlParams.get('moduleId'));
            }

            if (urlParams.has('filter')) {
                this.filterValue = decodeURI(urlParams.get('filter'));
            }
        }
    }

    public async getUrl(): Promise<string> {
        let url: string = '';
        if (Array.isArray(this.descriptor.urlPaths) && this.descriptor.urlPaths.length) {
            url = this.descriptor.urlPaths[0];
            const params = [];
            if (this.adminModuleId) {
                params.push(`moduleId=${this.adminModuleId}`);
            }

            if (this.filterValue) {
                params.push(`filter=${this.filterValue}`);
            }

            if (params.length) {
                url += `?${params.join('&')}`;
            }
        }
        return url;
    }

    public setAdminModule(adminModuleId: string, categoryName: string, force: boolean = false): void {
        if (force || !this.adminModuleId || this.adminModuleId !== adminModuleId) {
            this.adminModuleId = adminModuleId;
            this.categoryName = categoryName;
            this.filterValue = null;
            this.listeners.forEach((l) => l.objectChanged(null, null, null));
            ContextService.getInstance().setDocumentHistory(true, this, this, null);
        }
    }

    public setFilterValue(filterValue: string): void {
        this.filterValue = filterValue;
        ContextService.getInstance().setDocumentHistory(true, this, this, null);
    }

}
