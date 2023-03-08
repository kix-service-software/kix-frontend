/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../model/IdService';

export class ComponentState {

    public id: string;
    public config: any = {};

    /**
     * @param inline optional - boolean if toolbar is an inline element (only visible if text field is focused),
     *               default: false
     * @param readOnly optional - boolean if editor is read only, default: false
     * @param resize optional - boolean if resizing is enabled, default: true
     * @param resizeDir optional - direction for resizing, possible are 'both', 'vertical' and 'horizontal',
     *                  default: 'vertical'
     */
    public constructor(
        public inline: boolean = false,
        public simple: boolean = false,
        public readOnly: boolean = false,
        public invalid: boolean = false,
        public noImages: boolean = false,
        resize?: boolean,
        resizeDir?: string
    ) {
        this.id = IdService.generateDateBasedId('editor-');

        let toolbar = [];
        if (this.simple) {
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

        this.config = {
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
            toolbarCanCollapse: this.simple ? false : true,
            readOnly: this.readOnly,
            removeButtons: '',
            removePlugins: 'pastefromexcel,elementspath'
                + (this.readOnly || this.noImages ? ',image2' : '')
                + (this.readOnly ? '' : ',autogrow')
                + (this.readOnly ? ',stylesheetparser' : ''),
            codeSnippet_theme: 'github'
        };
        if (resize || resize === undefined) {
            this.config['resize_dir'] = resizeDir || 'vertical';
        } else {
            this.config['resize_enabled'] = false;
        }
    }

}
