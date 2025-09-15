/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration } from '../../../model/configuration/IConfiguration';

export class TiptapEditorConfiguration implements IConfiguration {

    public static CONFIGURATION_ID = 'agent-portal-tiptap-editor-configuration';

    public id: string = TiptapEditorConfiguration.CONFIGURATION_ID;
    public name: string = 'Tiptap Editor Configuration';
    public type: string = 'Tiptap';
    public application: string = 'agent-portal';
    public valid: boolean = true;
    public roleIds: number[];

    public editorName = 'Tiptap Editor';

    public placeholder = 'Start writing your ticket...';

}