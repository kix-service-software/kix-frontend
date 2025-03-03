/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SysConfigService } from '../../../sysconfig/webapp/core';
import { CKEditor5Configuration } from '../../model/CKEditor5Configuration';

export class CKEditorService {

    private static INSTANCE: CKEditorService;

    public static getInstance(): CKEditorService {
        if (!CKEditorService.INSTANCE) {
            CKEditorService.INSTANCE = new CKEditorService();
        }
        return CKEditorService.INSTANCE;
    }

    private constructor() { }

    private configurationId: string = CKEditor5Configuration.CONFIGURATION_ID;

    public setCKEditorConfigurationId(id: string): void {
        this.configurationId = id;
    }

    public getCKEditorConfigurationId(): string {
        return this.configurationId;
    }

    public static async getCKEditorConfiguration(): Promise<CKEditor5Configuration> {
        let editorConfig = await SysConfigService.getInstance().getUIConfiguration<CKEditor5Configuration>(
            this.getInstance().getCKEditorConfigurationId()
        );

        if (!editorConfig) {
            editorConfig = new CKEditor5Configuration();
        }

        return editorConfig;
    }

}