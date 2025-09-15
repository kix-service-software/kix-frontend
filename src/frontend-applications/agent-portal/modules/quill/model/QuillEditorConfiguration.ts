/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration } from '../../../model/configuration/IConfiguration';

export class QuillEditorConfiguration implements IConfiguration {
    public static CONFIGURATION_ID = 'agent-portal-quill-editor-configuration';

    public id: string = QuillEditorConfiguration.CONFIGURATION_ID;
    public name: string = 'Quill Editor Configuration';
    public type: string = 'QuillEditor';
    public application: string = 'agent-portal';
    public valid: boolean = true;
    public roleIds: number[];

    public toolbarOptions = [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        ['code-block', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image']
    ];

    public placeholder = 'Start writing your ticket...';
}