/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class EditorConfiguration {

    public static createConfiguration(
        simple?: boolean, readOnly?: boolean, noImages?: boolean, resize?: boolean, resizeDir?: string
    ): any {
        let toolbar = [];
        if (simple) {
            toolbar = [
                { name: 'simplestyles', items: ['Bold', 'Italic', 'Underline', 'TextColor', 'Link'] }
                // { name: 'insert', items: ['base64image'] }
            ];
        } else {
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
                { name: 'document', items: ['Source', '-', 'Print'] },
                { name: 'tools', items: ['Maximize'] },
                '/',
                { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
                { name: 'colors', items: ['TextColor', 'BGColor'] },
                { name: 'editing', items: ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'] },
                { name: 'links', items: ['Link', 'Unlink'] },
                {
                    name: 'insert', items: [
                        'base64image', 'Table', 'CodeSnippet',
                        'HorizontalRule', 'Smiley', 'SpecialChar'
                    ]
                }
            ];
        }

        const configuration = {
            // TODO: add useful title
            // title: 'some useful title - maybe relevant for screen readers'
            language: navigator.language || 'de',
            toolbar,
            resize_minWidth: 200,
            resize_minHeight: 125,
            resize_maxWidth: 1200,
            resize_maxHeight: 2000,
            autoGrow_minHeight: 125,
            autoGrow_maxHeight: 2000,
            autoGrow_onStartup: true,
            extraAllowedContent: 'b; h1 h2 h3 ul li; div[type]{*}; img[*]{*}; col[width]; style[*]{*}; *[id](*)',
            toolbarCanCollapse: simple ? false : true,
            readOnly: readOnly,
            removeButtons: '',
            removePlugins: 'pastefromexcel,elementspath'
                + (readOnly || noImages ? ',image2' : '')
                + (readOnly ? '' : ',autogrow')
                + (readOnly ? ',stylesheetparser' : ''),
            codeSnippet_theme: 'github'
        };

        if (resize || resize === undefined) {
            configuration['resize_dir'] = resizeDir || 'vertical';
        } else {
            configuration['resize_enabled'] = false;
        }

        return configuration;
    }

}
