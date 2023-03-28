/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../model/Context';
import { ContextEvents } from '../../../base-components/webapp/core/ContextEvents';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { AdministrationSocketClient } from './AdministrationSocketClient';

export class AdminContext extends Context {

    public static CONTEXT_ID: string = 'admin';

    public adminModuleId: string;
    public filterValue: string;

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(): Promise<string> {
        let text = await TranslationService.translate('Translatable#Admin');
        if (this.adminModuleId) {
            const module = await AdministrationSocketClient.getInstance().getAdminModule(this.adminModuleId);
            const moduleName = await TranslationService.translate(module?.name);
            text = await TranslationService.translate('Translatable#Admin: {0}', [moduleName]);
        }
        return text;
    }

    public async update(urlParams: URLSearchParams): Promise<void> {
        TableFactoryService.getInstance().deleteContextTables(AdminContext.CONTEXT_ID);
        this.handleURLParams(urlParams);
    }

    private handleURLParams(urlParams: URLSearchParams): void {
        if (urlParams) {
            this.setAdminModule(urlParams.has('moduleId') ? decodeURI(urlParams.get('moduleId')) : null, false);
            this.setFilterValue(urlParams.has('filter') ? decodeURI(urlParams.get('filter')) : null, false);
        }
    }

    public async getUrl(): Promise<string> {
        let url: string = '';
        if (Array.isArray(this.descriptor.urlPaths) && this.descriptor.urlPaths.length) {
            url = this.descriptor.urlPaths[0];
            const params = [];
            if (this.adminModuleId) {
                params.push(`moduleId=${encodeURIComponent(this.adminModuleId)}`);
            }

            if (this.filterValue) {
                params.push(`filter=${encodeURIComponent(this.filterValue)}`);
            }

            if (params.length) {
                url += `?${params.join('&')}`;
            }
        }
        return url;
    }

    public async setAdminModule(adminModuleId: string, history: boolean = true): Promise<void> {
        if (!this.adminModuleId || this.adminModuleId !== adminModuleId) {

            TableFactoryService.getInstance().deleteContextTables(AdminContext.CONTEXT_ID);

            this.adminModuleId = adminModuleId;
            this.filterValue = null;

            EventService.getInstance().publish(ContextEvents.CONTEXT_PARAMETER_CHANGED, this);
            if (history) {
                ContextService.getInstance().setDocumentHistory(true, this, this, null);
            }
        }
    }

    public setFilterValue(filterValue: string, history: boolean = true): void {
        this.filterValue = filterValue;

        EventService.getInstance().publish(ContextEvents.CONTEXT_PARAMETER_CHANGED, this);
        if (history) {
            ContextService.getInstance().setDocumentHistory(true, this, this, null);
        }
    }

}
