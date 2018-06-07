import { IdService } from '@kix/core/dist/browser/IdService';

export class EditorComponentState {

    public id: string;
    public value: string = '';
    public config: object = {};

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
        resize?: boolean,
        resizeDir?: string
    ) {
        this.id = IdService.generateDateBasedId('editor-');

        let toolbar = [];
        if (this.simple) {
            toolbar = [
                { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline'] },
                { name: 'colors', items: ['TextColor'] },
                { name: 'links', items: ['Link'] },
                // { name: 'insert', items: ['base64image'] }
            ];

            // } else if (this.inline) {
            //     toolbar = [
            //         {
            //             name: 'basicstyles', items: [
            //                 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript',
            //             ]
            //         },
            //         {
            //             name: 'paragraph', items: [
            //                 'NumberedList', 'BulletedList', 'Outdent', 'Indent', '-',
            //                 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'
            //             ]
            //         },
            //         '/',
            //         { name: 'links', items: ['Link', 'Unlink'] },
            //         { name: 'undo', items: ['Undo', 'Redo'] },
            //         {
            //             name: 'insert', items: [
            //                 'Image', 'Table', 'HorizontalRule', 'PasteText', 'PasteFromWord', 'SpecialChar'
            //             ]
            //         },
            //         '/',
            //         { name: 'colors', items: ['TextColor', 'BGColor'] },
            //         { name: 'cleanup', items: ['RemoveFormat'] },
            //         { name: 'styles', items: ['Font', 'FontSize'] },
            //     ];
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
            // TODO: language from user config?
            language: navigator.language || 'de',
            toolbar,
            resize_minWidth: 200,
            resize_minHeight: 200,
            resize_maxWidth: 1200,
            resize_maxHeight: 1000,
            extraAllowedContent: 'div[type]{*}; img[*]; col[width]; style[*]{*}; *[id](*)',
            toolbarCanCollapse: true,
            readOnly: this.readOnly,
            removeButtons: '',
            codeSnippet_theme: 'github'
        };
        if (resize || resize === undefined) {
            this.config['resize_dir'] = resizeDir || 'vertical';
        } else {
            this.config['resize_enabled'] = false;
        }
    }

}
