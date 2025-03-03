/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration } from '../../../model/configuration/IConfiguration';

export class CKEditor5Configuration implements IConfiguration {

    public static CONFIGURATION_ID = 'agent-portal-ckeditor5-configuration';

    public id: string = CKEditor5Configuration.CONFIGURATION_ID;
    public name: string = 'CKEditor5 Configuration';
    public type: string = 'CKEditor5';
    public application: string = 'agent-portal';
    public valid: boolean = true;
    public roleIds: number[];

    public plugins = [];

    public toolbar = {
        shouldNotGroupWhenFull: true,
        items: [
            'bold',
            'italic',
            'underline',
            'strikethrough',
            'subscript',
            'superscript',
            '|',
            'removeFormat',
            '|',
            'undo',
            'redo',
            '|',
            'bulletedList',
            'numberedList',
            '|',
            'outdent',
            'indent',
            '|',
            'blockQuote',
            '|',
            'alignment',
            '|',
            'heading',
            '|',
            'fontFamily',
            'fontSize',
            'fontColor',
            'fontBackgroundColor',
            '|',
            'sourceEditing',
            'findAndReplace',
            'selectAll',
            '|',
            'specialCharacters',
            'link',
            'insertImage',
            'mediaEmbed',
            'insertTable',
            'highlight',
            '|',
            'accessibilityHelp'
        ]
    };

    public balloonToolbar = [
        'bold',
        'italic',
        '|',
        'link',
        'insertImage',
        '|',
        'bulletedList',
        'numberedList',
    ];

    public fontFamily = {
        supportAllValues: true,
    };

    public fontSize = {
        options: [10, 12, 14, 'default', 18, 20, 22],
        supportAllValues: true,
    };

    public heading = {
        options: [
            {
                model: 'paragraph',
                title: 'Paragraph',
                class: 'ck-heading_paragraph',
            },
            {
                model: 'heading1',
                view: 'h1',
                title: 'Heading 1',
                class: 'ck-heading_heading1',
            },
            {
                model: 'heading2',
                view: 'h2',
                title: 'Heading 2',
                class: 'ck-heading_heading2',
            },
            {
                model: 'heading3',
                view: 'h3',
                title: 'Heading 3',
                class: 'ck-heading_heading3',
            },
            {
                model: 'heading4',
                view: 'h4',
                title: 'Heading 4',
                class: 'ck-heading_heading4',
            },
            {
                model: 'heading5',
                view: 'h5',
                title: 'Heading 5',
                class: 'ck-heading_heading5',
            },
            {
                model: 'heading6',
                view: 'h6',
                title: 'Heading 6',
                class: 'ck-heading_heading6',
            },
        ],
    };

    // https://ckeditor.com/docs/ckeditor5/latest/features/html/general-html-support.html
    public htmlSupport = {
        allow: []
    };

    public image = {
        toolbar: [
            'toggleImageCaption',
            'imageTextAlternative',
            '|',
            'imageStyle:inline',
            'imageStyle:wrapText',
            'imageStyle:breakText',
            '|',
            'resizeImage',
        ],
    };

    public link = {
        addTargetToExternalLinks: true,
        defaultProtocol: 'https://',
        decorators: {
            toggleDownloadable: {
                mode: 'manual',
                label: 'Downloadable',
                attributes: {
                    download: 'file',
                },
            },
            openInNewTab: {
                mode: 'manual',
                label: 'Open in a new tab',
                defaultValue: true,
                attributes: {
                    target: '_blank',
                    rel: 'noopener noreferrer'
                }
            }
        },
    };

    public list = {
        properties: {
            styles: true,
            startIndex: true,
            reversed: true,
        },
    };

    // https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html
    public mention: {
        feeds: any[]
    };

    public menuBar = {
        isVisible: false,
    };

    public placeholder = '';

    public style = {
        definitions: [
            {
                name: 'Article category',
                element: 'h3',
                classes: ['category'],
            },
            {
                name: 'Title',
                element: 'h2',
                classes: ['document-title'],
            },
            {
                name: 'Subtitle',
                element: 'h3',
                classes: ['document-subtitle'],
            },
            {
                name: 'Info box',
                element: 'p',
                classes: ['info-box'],
            },
            {
                name: 'Side quote',
                element: 'blockquote',
                classes: ['side-quote'],
            },
            {
                name: 'Marker',
                element: 'span',
                classes: ['marker'],
            },
            {
                name: 'Spoiler',
                element: 'span',
                classes: ['spoiler'],
            },
            {
                name: 'Code (dark)',
                element: 'pre',
                classes: ['fancy-code', 'fancy-code-dark'],
            },
            {
                name: 'Code (bright)',
                element: 'pre',
                classes: ['fancy-code', 'fancy-code-bright'],
            },
        ],
    };

    public table = {
        contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells',
            'tableProperties',
            'tableCellProperties',
        ],
    };

    public typing = {
        transformations: {
            include: [],
            remove: [],
            extra: []
        }
    };
}