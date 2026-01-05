/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SysConfigService } from '../../../sysconfig/webapp/core';
import { TiptapEditorConfiguration } from '../../model/TiptapEditorConfiguration';

export class TiptapEditorService {

    private static INSTANCE: TiptapEditorService;

    private activeEditor: any;

    public static getInstance(): TiptapEditorService {
        if (!TiptapEditorService.INSTANCE) {
            TiptapEditorService.INSTANCE = new TiptapEditorService();
        }
        return TiptapEditorService.INSTANCE;
    }

    private constructor() { }

    private configurationId: string = TiptapEditorConfiguration.CONFIGURATION_ID;

    public setCKEditorConfigurationId(id: string): void {
        this.configurationId = id;
    }

    public getCKEditorConfigurationId(): string {
        return this.configurationId;
    }

    public static async getCKEditorConfiguration(): Promise<TiptapEditorConfiguration> {
        let editorConfig = await SysConfigService.getInstance().getUIConfiguration<TiptapEditorConfiguration>(
            this.getInstance().getCKEditorConfigurationId()
        );

        if (!editorConfig) {
            editorConfig = new TiptapEditorConfiguration();
        }

        return editorConfig;
    }

    public setActiveEditor(editor: any): void {
        this.activeEditor = editor;
    }

    public getActiveEditor(): any {
        return this.activeEditor;
    }

}