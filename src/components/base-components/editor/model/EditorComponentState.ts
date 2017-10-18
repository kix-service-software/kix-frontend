export class EditorComponentState {

    public id: string;
    public value: string = '';
    public inline: boolean = false;
    public config: object = {};

    /**
     * @param inline boolean if toolbar is a inline element (only visible if text field is focused), default: false
     * @param resize boolean if resizeing is enabled, default: true
     * @param resizeDir direction for resizing, possible are 'both', 'vertical' ans 'horizontal', default: 'vertical'
     */
    public constructor(inline: boolean, resize?: boolean, resizeDir?: string) {
        this.id = 'editor-' + Date.now();

        let toolbar = [];
        if (inline) {
            toolbar = [
                {
                    name: 'basicstyles', items: [
                        'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript',
                    ]
                },
                {
                    name: 'paragraph', items: [
                        'NumberedList', 'BulletedList', 'Outdent', 'Indent', '-',
                        'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'
                    ]
                },
                '/',
                { name: 'links', items: ['Link', 'Unlink'] },
                { name: 'undo', items: ['Undo', 'Redo'] },
                {
                    name: 'insert', items: [
                        'Image', 'Table', 'HorizontalRule', 'PasteText', 'PasteFromWord', 'SpecialChar'
                    ]
                },
                '/',
                { name: 'colors', items: ['TextColor', 'BGColor'] },
                { name: 'cleanup', items: ['RemoveFormat'] },
                { name: 'styles', items: ['Font', 'FontSize'] },
            ];
        } else {
            toolbar = [
                {
                    name: 'basicstyles', items: [
                        'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript',
                    ]
                },
                {
                    name: 'paragraph', items: [
                        'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-',
                        'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'
                    ]
                },
                { name: 'links', items: ['Link', 'Unlink'] },
                { name: 'undo', items: ['Undo', 'Redo', 'SelectAll'] },
                { name: 'quote', items: ['Blockquote'] },
                '/',
                {
                    name: 'insert', items: [
                        'Image', 'Table', 'HorizontalRule', 'PasteText', 'PasteFromWord', 'SpecialChar'
                    ]
                },
                { name: 'editing', items: ['Find', 'Replace'] },
                { name: 'colors', items: ['TextColor', 'BGColor'] },
                { name: 'cleanup', items: ['RemoveFormat'] },
                { name: 'document', items: ['ShowBlocks', 'Source', 'Maximize'] },
                '/',
                { name: 'styles', items: ['Format', 'Font', 'FontSize'] },
                { name: 'tools', items: [] }
            ];
        }

        this.config = {
            toolbar,
            width: 800,
            height: 500,
            resize_minWidth: 200,
            resize_minHeight: 200,
            resize_maxWidth: 1200,
            resize_maxHeight: 1000,
            extraAllowedContent: 'div[type]{*}; img[*]; col[width]; style[*]{*}; *[id](*)',
            toolbarCanCollapse: true
        };
        if (resize || resize === undefined) {
            this.config['resize_dir'] = resizeDir || 'vertical';
        } else {
            this.config['resize_enabled'] = false;
        }
    }

}
