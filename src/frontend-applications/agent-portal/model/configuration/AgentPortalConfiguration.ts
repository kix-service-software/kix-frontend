/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../kix/KIXObjectType';
import { IConfiguration } from './IConfiguration';

export class AgentPortalConfiguration implements IConfiguration {

        public static CONFIGURATION_ID = 'agent-portal-configuration';

        public application: string = 'agent-portal';

        public constructor(
                public preloadObjects: Array<KIXObjectType | string> = [],
                public defaultPageSize: number = 20,
                public adminRoleIds: number[] = [],
                public id: string = AgentPortalConfiguration.CONFIGURATION_ID,
                public name: string = 'Agent Portal Configuration',
                public type: string = 'Agent Portal',
                public valid: boolean = true,
                public ckEditorConfiguration: any = {
                        language: 'en',
                        toolbar: [
                                {
                                        name: 'basicstyles', items: [
                                                'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-',
                                                'RemoveFormat'
                                        ]
                                },
                                { name: 'clipboard', items: ['Undo', 'Redo'] },
                                {
                                        name: 'paragraph', items: [
                                                'NumberedList', 'BulletedList', '-',
                                                'Outdent', 'Indent', '-', 'Blockquote', '-',
                                                'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'
                                        ]
                                },
                                { name: 'document', items: ['Source'] },
                                { name: 'tools', items: ['Maximize'] },
                                { name: 'styles', items: ['Format', 'Font', 'FontSize'] },
                                { name: 'colors', items: ['TextColor', 'BGColor'] },
                                { name: 'editing', items: ['Find', '-', 'SelectAll', '-'] },
                                { name: 'links', items: ['Link', 'Unlink'] },
                                {
                                        name: 'insert', items: [
                                                'base64image', 'Table', 'CodeSnippet',
                                                'HorizontalRule'
                                        ]
                                }
                        ],
                        resize_minWidth: 200,
                        resize_minHeight: 125,
                        resize_maxWidth: 1200,
                        resize_maxHeight: 2000,
                        autoGrow_minHeight: 125,
                        autoGrow_maxHeight: 2000,
                        autoGrow_onStartup: true,
                        extraAllowedContent: 'b; h1 h2 h3 ul li; div[type]{*}; img[*]{*}; col[width]; style[*]{*}; *[id](*)',
                        toolbarCanCollapse: true,
                        removeButtons: '',
                        removePlugins: 'pastefromexcel,elementspath',
                        codeSnippet_theme: 'github',
                        disableNativeSpellChecker: false,
                        enterMode: 2, // CKEDITOR.ENTER_BR,
                        shiftEnterMode: 2 // CKEDITOR.ENTER_BR
                }
        ) { }

}
