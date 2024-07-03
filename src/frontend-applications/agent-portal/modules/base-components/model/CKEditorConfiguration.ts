/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class CKEditorConfiguration {
    language: string = 'en';
    toolbar = [
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
    ];
    resize_minWidth: number = 200;
    resize_minHeight: number = 125;
    resize_maxWidth: number = 1200;
    resize_maxHeight: number = 2000;
    autoGrow_minHeight: number = 125;
    autoGrow_maxHeight: number = 2000;
    autoGrow_onStartup: boolean = true;
    extraAllowedContent: string = 'b; h1 h2 h3 ul li; div[type]{*}; img[*]{*}; col[width]; style[*]{*}; *[id](*); table{background}; tr{font-size};';
    toolbarCanCollapse: boolean = true;
    removeButtons: string = '';
    removePlugins: string = 'pastefromexcel,elementspath';
    codeSnippet_theme: string = 'github';
    disableNativeSpellChecker: boolean = false;
    enterMode: number = 2; // CKEDITOR.ENTER_BR,
    shiftEnterMode: number = 2; // CKEDITOR.ENTER_BR,
    versionCheck: false;
}