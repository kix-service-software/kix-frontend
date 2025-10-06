/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

const { addFindReplace } = require('./findReplaceModule');
const { createSpecialCharsDropdown } = require('./specialCharacters');
export function createToolbar(editor: any): HTMLDivElement {
    const toolbar: HTMLDivElement = document.createElement('div');
    toolbar.className = 'tiptap-toolbar';

    const isSSP = ((): boolean => {
        const d = document;

        if (d.body?.dataset.app === 'ssp' || d.documentElement?.dataset.app === 'ssp') return true;
        if (d.body?.classList.contains('ssp') || d.body?.classList.contains('self-service-portal')) return true;
        if (d.querySelector('[data-app="ssp"], .ssp-app, .ssp-root, .self-service-portal')) return true;

        if (d.querySelector('script[src*="ssp-application"]')) return true;
        if (d.querySelector('link[href*="ssp-application"]')) return true;

        if (d.querySelector('script[src*="/static/applications/ssp-application/"]')) return true;

        return false;
    })();

    if (isSSP) {
        toolbar.style.setProperty('top', '69px', 'important');
    }

    let isSourceMode = false;
    let sourceTextarea: HTMLTextAreaElement | null = null;
    let skipNextFormatReapply = false;
    function reapplyActiveMarksInChain(chain: any): any {
        if (skipNextFormatReapply) {
            skipNextFormatReapply = false;
            return chain;
        }

        const isBold = editor.isActive('bold');
        const isItalic = editor.isActive('italic');
        const isUnderline = editor.isActive('underline');

        const ts = editor.getAttributes('textStyle') || {};
        const currentFont =
            ts.fontFamily ?? editor.storage.lastFontFamily ?? 'Arial';
        const currentSize =
            ts.fontSize ?? editor.storage.lastFontSize ?? null;
        const currentColor =
            ts.color ?? editor.storage.lastFontColor ?? null;

        if (isBold) chain.setMark('bold');
        if (isItalic) chain.setMark('italic');
        if (isUnderline) chain.setMark('underline');

        chain.setFontFamily(currentFont);
        if (currentSize) chain.setFontSize(currentSize);
        if (currentColor) chain.setColor(currentColor);

        return chain;
    }

    const alignableTypes = ['paragraph', 'heading', 'customParagraph'] as const;
    const getCurrentAlign = (): any => {
        for (const t of alignableTypes) {
            const ta = editor.getAttributes(t as any)?.textAlign;
            if (ta) return ta;
        }
        return null;
    };

    const toggleAlign = (value: 'left' | 'center' | 'right' | 'justify'): void => {
        const current = getCurrentAlign();
        const isImage = editor.state.doc.nodeAt(editor.state.selection.from)?.type?.name === 'resizableImage';

        if (isImage) {
            alignImage(editor, value);
            return;
        }

        let chain = editor.chain().focus();
        if (current === value) {
            chain = chain.unsetTextAlign();
        } else {
            chain = chain.setTextAlign(value);
        }
        reapplyActiveMarksInChain(chain).run();
    };

    function sanitizeHtmlForTiptap(raw: string): string {
        let h = (raw ?? '').toString();
        h = h.replace(/<!--[\s\S]*?-->/g, '');
        h = h.replace(/<\/?(?:tbody|thead|tfoot)\b[^>]*>/gi, '');
        h = h.replace(/>\s+</g, '><');
        h = h.replace(/&nbsp;/g, ' ');
        return h.trim();
    }

    function withContentCheckDisabled(editor: any, fn: () => void): void {
        const prev = !!editor.options?.enableContentCheck;
        try {
            if (prev && typeof editor.setOptions === 'function') {
                editor.setOptions({ enableContentCheck: false });
            }
            fn();
        } finally {
            if (prev && typeof editor.setOptions === 'function') {
                editor.setOptions({ enableContentCheck: true });
            }
        }
    }


    function updateActiveButtons(): void {
        const superscriptActive = editor.isActive('superscript');
        const subscriptActive = editor.isActive('subscript');

        toolbar.querySelectorAll('button').forEach((btn) => {
            const checker = (btn as any)._checkActive;
            if (typeof checker === 'function') {
                btn.classList.toggle('is-active', checker());
            }

            const icon = btn.querySelector('i')?.classList?.value || '';

            if (icon.includes('fa-superscript')) {
                btn.disabled = subscriptActive;
                btn.title = subscriptActive ? 'Cannot use Superscript while Subscript is active' : 'Superscript';
            }

            if (icon.includes('fa-subscript')) {
                btn.disabled = superscriptActive;
                btn.title = superscriptActive ? 'Cannot use Subscript while Superscript is active' : 'Subscript';
            }
        });
    }

    editor.on('selectionUpdate', updateActiveButtons);
    editor.on('update', updateActiveButtons);
    editor.on('transaction', ({ transaction }) => {
        if (transaction.docChanged || transaction.selectionSet) {
            updateActiveButtons();
        }
    });
    editor.view.dom.addEventListener('keyup', (e: KeyboardEvent) => {
        if (e.key === 'Enter') updateActiveButtons();
    });

    function alignImage(editor, align = 'left'): any {
        const { state } = editor;
        const { selection } = state;
        const pos = selection.from;
        const node = state.doc.nodeAt(pos);

        if (node?.type.name === 'resizableImage') {
            editor
                .chain()
                .focus()
                .command(({ tr }) => {
                    tr.setNodeMarkup(pos, undefined, {
                        ...node.attrs,
                        align,
                    });
                    return true;
                })
                .run();
        }
    }

    function formatHtmlPretty(html: string): string {
        let formatted = '';
        const reg = /(>)(<)(\/*)/g;
        html = html.replace(reg, '$1\n$2$3');
        let pad = 0;
        html.split('\n').forEach((node) => {
            let indent = 0;
            if (node.match(/^<\/\w/)) {
                if (pad !== 0) pad -= 1;
            } else if (node.match(/^<\w[^>]*[^/]>/)) {
                indent = 1;
            }
            formatted += '  '.repeat(pad) + node + '\n';
            pad += indent;
        });
        return formatted.trim();
    }
    const createIconButton = (
        iconClass: string,
        command: () => void,
        tooltip: string = '',
        checkActive?: () => boolean
    ): HTMLButtonElement => {
        const button: HTMLButtonElement = document.createElement('button');
        button.className = 'btn btn-sm btn-outline-secondary';
        button.title = tooltip;


        button.onclick = (): void => {
            command();
            updateActiveButtons();
        };

        const wrapper = document.createElement('span');
        wrapper.className = 'icon-wrapper';

        const icon = document.createElement('i');
        icon.className = iconClass;

        wrapper.appendChild(icon);
        button.appendChild(wrapper);

        (button as any)._checkActive = checkActive;

        return button;
    };

    function createDropdown(
        label: string,
        items: { label: string, action: () => void; fontFamily?: string }[],
        classPrefix: string
    ): HTMLDivElement {
        const wrapper = document.createElement('div');
        wrapper.className = `custom-dropdown-wrapper ${classPrefix}-wrapper position-relative d-inline-block`;

        const button = document.createElement('button');
        button.className = `btn btn-sm ${classPrefix}-button`;
        button.textContent = label;
        button.type = 'button';
        button.title = label;

        Object.assign(button.style, {
            padding: '4px 12px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            backgroundColor: '#fff',
            cursor: 'pointer',
            textAlign: 'left',
            position: 'relative',
            display: 'inline-flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            width: 'auto',
            flexWrap: 'nowrap',
        });

        const caret = document.createElement('span');
        caret.textContent = '▾';
        Object.assign(caret.style, {
            marginLeft: 'auto',
            fontSize: '12px',
            paddingLeft: '6px',
        });

        button.appendChild(caret);

        const menu = document.createElement('div');
        menu.className = `dropdown-menu ${classPrefix}-menu show`;
        Object.assign(menu.style, {
            display: 'none',
            position: 'absolute',
            zIndex: '1000',
            minWidth: '160px',
            maxHeight: '180px',
            overflowY: 'auto',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            marginTop: '2px',
            padding: '4px 0',
        });

        items.forEach(({ label, action, fontFamily }) => {
            const item = document.createElement('div');
            item.className = `dropdown-item ${classPrefix}-item`;
            item.textContent = label;

            Object.assign(item.style, {
                padding: '6px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
                backgroundColor: '#fff',
                fontFamily: fontFamily || '',
                lineHeight: '1.4',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
            });

            item.onmouseenter = (): void => {
                item.style.backgroundColor = '#0a7cb3';
                item.style.color = '#fff';
            };
            item.onmouseleave = (): void => {
                item.style.backgroundColor = '#fff';
                item.style.color = '#000';
            };

            item.onclick = (): void => {
                menu.style.display = 'none';
                action();
                if (fontFamily) {
                    button.style.fontFamily = fontFamily;
                    button.childNodes[0].textContent = label;
                    button.appendChild(caret);
                }
            };

            menu.appendChild(item);
        });

        button.onclick = (): void => {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        };

        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target as Node)) {
                menu.style.display = 'none';
            }
        });

        wrapper.appendChild(button);
        wrapper.appendChild(menu);
        return wrapper;
    }

    const buttons = [
        {
            icon: 'fas fa-bold',
            action: (): void => editor.chain().focus().toggleBold().run(),
            tooltip: 'Bold',
            checkActive: (): boolean => editor.isActive('bold'),
        },
        {
            icon: 'fas fa-italic',
            action: (): void => editor.chain().focus().toggleItalic().run(),
            tooltip: 'Italic',
            checkActive: (): boolean => editor.isActive('italic'),
        },
        {
            icon: 'fas fa-underline',
            action: (): void => editor.chain().focus().toggleUnderline().run(),
            tooltip: 'Underline',
            checkActive: (): boolean => editor.isActive('underline'),
        },
        {
            icon: 'fas fa-strikethrough',
            action: (): void => editor.chain().focus().toggleStrike().run(),
            tooltip: 'Strikethrough',
            checkActive: (): boolean => editor.isActive('strike'),
        },
        {
            icon: 'fas fa-superscript',
            action: (): void => editor.chain().focus().toggleSuperscript().run(),
            tooltip: 'Superscript',
            checkActive: (): boolean => editor.isActive('superscript'),
        },
        {
            icon: 'fas fa-subscript',
            action: (): void => editor.chain().focus().toggleSubscript().run(),
            tooltip: 'Subscript',
            checkActive: (): boolean => editor.isActive('subscript'),
        },
        {
            icon: 'fas fa-list-ul',
            action: (): void => reapplyActiveMarksInChain(editor.chain().focus().toggleBulletList()).run(),
            tooltip: 'Bullet List',
            checkActive: (): boolean => editor.isActive('bulletList'),
        },
        {
            icon: 'fas fa-list-ol',
            action: (): void => reapplyActiveMarksInChain(editor.chain().focus().toggleOrderedList()).run(),
            tooltip: 'Ordered List',
            checkActive: (): boolean => editor.isActive('orderedList'),
        },
        {
            icon: 'fas fa-align-left',
            action: (): void => toggleAlign('left'),
            tooltip: 'Align Left',
            checkActive: (): boolean => getCurrentAlign() === 'left',
        },
        {
            icon: 'fas fa-align-center',
            action: (): void => toggleAlign('center'),
            tooltip: 'Align Center',
            checkActive: (): boolean => getCurrentAlign() === 'center',
        },
        {
            icon: 'fas fa-align-right',
            action: (): void => toggleAlign('right'),
            tooltip: 'Align Right',
            checkActive: (): boolean => getCurrentAlign() === 'right',
        },
        {
            icon: 'fas fa-align-justify',
            action: (): void => toggleAlign('justify'),
            tooltip: 'Justify',
            checkActive: (): boolean => getCurrentAlign() === 'justify',
        },
        {
            icon: 'fas fa-link',
            action: (): void => {
                const previousUrl = editor.getAttributes('link').href;
                let url = prompt('Enter URL', previousUrl || 'https://');

                if (url === null) return;
                url = url.trim();

                if (!/^https?:\/\//i.test(url)) {
                    url = 'https://' + url;
                }

                if (/\s/.test(url)) {
                    alert('URLs cannot contain spaces.');
                    return;
                }

                try {
                    const parsed = new URL(url);

                    if (
                        !parsed.hostname.startsWith('www.') &&
                        parsed.hostname.split('.').length === 2
                    ) {
                        const newHost = 'www.' + parsed.hostname;
                        url = `${parsed.protocol}//${newHost}${parsed.pathname}${parsed.search}${parsed.hash}`;
                    } else {
                        url = parsed.toString();
                    }

                    if (!parsed.hostname.includes('.')) {
                        alert('Please enter a valid URL.');
                        return;
                    }
                } catch (err) {
                    alert('Invalid URL format.');
                    return;
                }

                if (url === '') {
                    editor.chain().focus().unsetLink().run();
                } else {
                    editor.chain().focus().setLink({ href: url }).run();
                }
            },
            tooltip: 'Insert Link',
            checkActive: (): boolean => editor.isActive('link'),
        },
        {
            icon: 'fas fa-quote-right',
            action: (): void => reapplyActiveMarksInChain(editor.chain().focus().toggleBlockquote()).run(),
            tooltip: 'Blockquote',
            checkActive: (): boolean => editor.isActive('blockquote'),
        },
        {
            icon: 'fas fa-code',
            action: (): void => reapplyActiveMarksInChain(editor.chain().focus().toggleCodeBlock()).run(),
            tooltip: 'Code Block',
            checkActive: (): boolean => editor.isActive('codeBlock'),
        },
        {
            icon: 'fas fa-undo',
            action: (): void => editor.chain().focus().undo().run(),
            tooltip: 'Undo',
        },
        {
            icon: 'fas fa-redo',
            action: (): void => editor.chain().focus().redo().run(),
            tooltip: 'Redo',
        },
    ];

    // === Font Dropdown ===
    const fontFamilies = [
        'Arial',
        'Verdana',
        'Trebuchet MS',
        'Georgia',
        'Times New Roman',
        'Courier New',
        'Lucida Console',
        'Tahoma',
        'Palatino Linotype',
        'Impact'
    ];

    const fontDropdown = createDropdown(
        'Arial',
        fontFamilies.map((font) => ({
            label: font,
            fontFamily: font,
            action: (): void => {
                editor.chain().focus().setFontFamily(font).run();
                editor.storage.lastFontFamily = font;
            },
        })),
        'tiptap-font-dropdown'
    );

    toolbar.appendChild(fontDropdown);

    const fontButton = fontDropdown.querySelector('.tiptap-font-dropdown-button') as HTMLButtonElement;
    fontButton.title = 'Font Family';

    editor.on('transaction', () => {
        const currentFont = editor.getAttributes('fontFamily')?.fontFamily ?? editor.storage.lastFontFamily ?? 'Arial';
        editor.storage.lastFontFamily = currentFont;
        fontButton.childNodes[0].textContent = currentFont;
    });

    // === Font Size ===
    const fontSizes = [
        { label: 'Default', size: null },
        { label: '10px', size: '10' },
        { label: '12px', size: '12' },
        { label: '14px', size: '14' },
        { label: '16px', size: '16' },
        { label: '18px', size: '18' },
        { label: '20px', size: '20' },
        { label: '24px', size: '24' },
        { label: '30px', size: '30' },
        { label: '36px', size: '36' },
        { label: '48px', size: '48' },
        { label: '60px', size: '60' },
        { label: '72px', size: '72' },
    ];

    const fontSizeDropdown = createDropdown(
        'Font Size',
        fontSizes.map(({ label, size }) => ({
            label,
            action: (): void => {
                if (size === null) {
                    editor.chain().focus().unsetFontSize().run();
                } else {
                    editor.chain().focus().setFontSize(size).run();
                }
                updateFontSizeButtonLabel();
            },
        })),
        'tiptap-fontsize-dropdown'
    );

    toolbar.appendChild(fontSizeDropdown);

    const fontSizeButton = fontSizeDropdown.querySelector('.tiptap-fontsize-dropdown-button') as HTMLButtonElement;

    function updateFontSizeButtonLabel(): void {
        const ts = editor.getAttributes('textStyle') || {};
        const fontSizeAttr = ts.fontSize ?? null;

        let label = 'Font Size';
        if (fontSizeAttr) {
            const matched = fontSizes.find((f) => f.size === String(fontSizeAttr));
            label = matched?.label || `${fontSizeAttr}px`;
        }
        if (fontSizeButton && fontSizeButton.childNodes[0]) {
            fontSizeButton.childNodes[0].textContent = label;
        }
    }

    editor.on('transaction', updateFontSizeButtonLabel);
    editor.on('selectionUpdate', updateFontSizeButtonLabel);
    editor.on('update', updateFontSizeButtonLabel);

    updateFontSizeButtonLabel();

    // === Heading Dropdown ===
    const headingDropdown = createDropdown(
        'Paragraph',
        [
            {
                label: 'Paragraph',
                action: (): void => {
                    let chain = editor.chain().focus().setParagraph();
                    chain = reapplyActiveMarksInChain(chain);
                    chain.run();
                },
            },
            ...Array.from({ length: 6 }, (_, i) => ({
                label: `Heading ${i + 1}`,
                action: (): void => {
                    let chain = editor.chain().focus().setHeading({ level: i + 1 });
                    chain = reapplyActiveMarksInChain(chain);
                    chain.run();
                },
            })),
        ],
        'tiptap-heading-dropdown'
    );

    const headingButton = headingDropdown.querySelector('.tiptap-heading-dropdown-button') as HTMLButtonElement;
    headingButton.title = 'Heading';

    toolbar.appendChild(headingDropdown);

    editor.on('transaction', () => {
        let currentLabel = 'Paragraph';

        for (let i = 1; i <= 6; i++) {
            if (editor.isActive('heading', { level: i })) {
                currentLabel = `Heading ${i}`;
                break;
            }
        }

        if (editor.isActive('paragraph')) {
            currentLabel = 'Paragraph';
        }

        headingButton.childNodes[0].textContent = currentLabel;
    });

    // === Table Dropdown ===
    const tableDropdown = createDropdown(
        'Table',
        [
            {
                label: 'Insert Table', action: (): void => {
                    const lastFont = editor.storage.lastFontFamily || 'Arial';
                    const lastSize = editor.storage.lastFontSize || null;
                    const lastColor = editor.storage.lastFontColor || null;

                    let chain = editor.chain().focus()
                        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                        .setFontFamily(lastFont);

                    if (lastSize) chain = chain.setFontSize(lastSize);
                    if (lastColor) chain = chain.setColor(lastColor);

                    chain.run();
                }
            },
            { label: 'Insert Row Above', action: (): void => editor.chain().focus().addRowBefore().run() },
            { label: 'Insert Row Below', action: (): void => editor.chain().focus().addRowAfter().run() },
            { label: 'Insert Column Left', action: (): void => editor.chain().focus().addColumnBefore().run() },
            { label: 'Insert Column Right', action: (): void => editor.chain().focus().addColumnAfter().run() },
            { label: 'Delete Row', action: (): void => editor.chain().focus().deleteRow().run() },
            { label: 'Delete Column', action: (): void => editor.chain().focus().deleteColumn().run() },
            { label: 'Merge Cells', action: (): void => editor.chain().focus().mergeCells().run() },
            { label: 'Split Cell', action: (): void => editor.chain().focus().splitCell().run() },
            { label: 'Toggle Header Cell', action: (): void => editor.chain().focus().toggleHeaderCell().run() },
            {
                label: 'Toggle Cell Border',
                action: (): void => {
                    const { state } = editor.view;
                    const { selection } = state;
                    const $pos = selection.$anchor;

                    let cellPos: number | null = null;

                    for (let depth = $pos.depth; depth > 0; depth--) {
                        const node = $pos.node(depth);
                        if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
                            cellPos = $pos.before(depth);
                            break;
                        }
                    }

                    if (cellPos === null) {
                        console.warn('[Toolbar] No cell or header found.');
                        return;
                    }

                    const cellNode = state.doc.nodeAt(cellPos);
                    if (!cellNode || !cellNode.attrs) {
                        console.warn('[Toolbar] Invalid cell node at pos:', cellPos);
                        return;
                    }

                    const existingStyle = cellNode.attrs.style || '';
                    const isHidden = existingStyle.includes('border: none');

                    let updatedStyle: string;

                    if (isHidden) {
                        updatedStyle = existingStyle
                            .split(';')
                            .filter((s) => s.trim() && !s.trim().startsWith('border'))
                            .join(';')
                            .trim();
                    } else {
                        const cleanedStyle = existingStyle
                            .split(';')
                            .filter((s) => s.trim() && !s.trim().startsWith('border'))
                            .join(';')
                            .trim();
                        updatedStyle = `${cleanedStyle}; border: none !important; border-width: 0 !important; border-style: none !important;`;
                    }

                    const result = editor.chain().focus().setCellAttribute('style', updatedStyle).run();
                }
            },
            { label: 'Delete Table', action: (): void => editor.chain().focus().deleteTable().run() },
        ],
        'tiptap-table-dropdown'
    );

    const tableButton = tableDropdown.querySelector('.tiptap-table-dropdown-button') as HTMLButtonElement;
    tableButton.title = 'Table';

    toolbar.appendChild(tableDropdown);

    // === Highlight Dropdown ===
    const highlightColors = [
        { label: 'Clear Highlight', color: null },
        { label: 'Yellow', color: '#fff3b0' },
        { label: 'Green', color: '#d3f9d8' },
        { label: 'Blue', color: '#d0ebff' },
        { label: 'Red', color: '#ffe3e3' },
        { label: 'Purple', color: '#e5d5fa' },
        { label: 'Orange', color: '#ffe8cc' },
        { label: 'Teal', color: '#c3fae8' },
        { label: 'Pink', color: '#fcd5ce' },
        { label: 'Gray', color: '#f1f3f5' },
    ];

    const highlightDropdown = createDropdown(
        '',
        highlightColors.map(({ label, color }) => ({
            label,
            action: (): void => {
                const chain = editor.chain().focus();
                chain.unsetHighlight();

                if (color !== null) {
                    chain.setHighlight({ color });
                }

                chain.run();

                if (highlightIcon) {
                    highlightIcon.style.backgroundColor = color || 'transparent';
                }
            },
        })),
        'tiptap-highlight-dropdown'
    );

    const highlightButton = highlightDropdown.querySelector('.tiptap-highlight-dropdown-button') as HTMLButtonElement;

    highlightButton.title = 'Highlight';

    highlightButton.innerHTML = `
  <span class="highlight-icon-wrapper" style="display: flex; align-items: center; gap: 6px;">
    <i class="fas fa-highlighter highlight-icon" style="padding: 4px; border-radius: 4px;"></i>
    <span style="font-size: 12px;">▾</span>
  </span>`;

    toolbar.appendChild(highlightDropdown);

    const highlightIcon = highlightButton.querySelector('.highlight-icon') as HTMLElement;

    editor.on('selectionUpdate', () => {
        const currentColor = editor.getAttributes('highlight')?.color ?? null;

        if (highlightIcon) {
            highlightIcon.style.backgroundColor = currentColor || 'transparent';
        }
    });

    // === Text Color Picker ===
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.style.position = 'absolute';
    colorInput.style.opacity = '0';
    colorInput.style.width = '100%';
    colorInput.style.height = '100%';
    colorInput.style.cursor = 'pointer';
    colorInput.style.left = '0';
    colorInput.style.top = '0';

    colorInput.oninput = (): void => {
        const color = colorInput.value;
        editor.chain().focus().setColor(color).run();
        editor.storage.lastFontColor = color;
    };

    const colorButtonWrapper = document.createElement('div');
    colorButtonWrapper.classList.add(
        'btn',
        'position-relative',
        'd-flex',
        'justify-content-center',
        'align-items-center',
        'color-picker-wrapper'
    );
    colorButtonWrapper.style.width = '36px';
    colorButtonWrapper.style.height = '36px';
    colorButtonWrapper.title = 'Text Color';

    const colorIcon = document.createElement('i');
    colorIcon.className = 'fas fa-palette';
    colorButtonWrapper.appendChild(colorIcon);

    colorButtonWrapper.appendChild(colorInput);
    toolbar.appendChild(colorButtonWrapper);

    colorButtonWrapper.onclick = (): void => {
        colorInput.click();
    };

    // === Resizable Image Input ===
    const resizableImageInput: HTMLInputElement = document.createElement('input');
    resizableImageInput.type = 'file';
    resizableImageInput.accept = 'image/*';
    resizableImageInput.style.display = 'none';

    resizableImageInput.onchange = (): void => {
        const file = resizableImageInput.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (): void => {
                const url: string = reader.result as string;

                editor.chain()
                    .insertContent({
                        type: 'resizableImage',
                        attrs: {
                            src: url,
                            width: 300,
                        },
                    })
                    .focus()
                    .run();

                setTimeout(() => {
                    editor.commands.focus();
                }, 0);
                resizableImageInput.value = '';
            };
            reader.readAsDataURL(file);
        }
    };

    const imageButtonWrapper = document.createElement('div');
    imageButtonWrapper.className = 'btn position-relative';
    imageButtonWrapper.title = 'Insert Image';

    const imageIcon = document.createElement('i');
    imageIcon.className = 'fas fa-image';
    imageButtonWrapper.appendChild(imageIcon);

    const imageDropdown = document.createElement('div');
    imageDropdown.className = 'image-dropdown-menu';
    Object.assign(imageDropdown.style, {
        position: 'absolute',
        top: '100%',
        left: '0',
        marginTop: '2px',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        display: 'none',
        minWidth: '160px',
        zIndex: '1000',
    });

    imageDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    const createImageDropdownItem = (label: string, onClick: () => void): HTMLDivElement => {
        const item = document.createElement('div');
        item.textContent = label;
        item.className = 'dropdown-item';

        Object.assign(item.style, {
            padding: '6px 12px',
            cursor: 'pointer',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            color: '#000',
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            lineHeight: '1.4',
            height: '36px',
            borderBottom: '1px solid #eee',
            outline: 'none',
            userSelect: 'none',
        });

        item.onmouseenter = (): void => {
            item.style.backgroundColor = '#0a7cb3';
            item.style.color = '#fff';
        };
        item.onmouseleave = (): void => {
            item.style.backgroundColor = '#fff';
            item.style.color = '#000';
        };

        item.onclick = (e): void => {
            e.stopPropagation();
            imageDropdown.style.display = 'none';
            onClick();
        };

        return item;
    };

    imageDropdown.appendChild(createImageDropdownItem('Upload from Computer', () => {
        resizableImageInput.click();
    }));

    imageDropdown.appendChild(createImageDropdownItem('Insert via URL', () => {
        const url = prompt('Enter image URL:', 'https://');
        if (url && url.trim() && url !== 'https://') {
            editor.chain()
                .focus()
                .insertContent({
                    type: 'resizableImage',
                    attrs: {
                        src: url.trim(),
                        width: 300,
                    },
                })
                .run();
        }
    }));

    imageButtonWrapper.onclick = (e): void => {
        if ((e.target as HTMLElement).closest('.image-dropdown-menu')) return;

        e.stopPropagation();
        const isVisible = imageDropdown.style.display === 'block';

        document.querySelectorAll('.image-dropdown-menu').forEach((el) => {
            (el as HTMLElement).style.display = 'none';
        });

        imageDropdown.style.display = isVisible ? 'none' : 'block';
    };

    document.addEventListener('click', () => {
        imageDropdown.style.display = 'none';
    });

    imageButtonWrapper.appendChild(imageDropdown);
    toolbar.appendChild(imageButtonWrapper);
    toolbar.appendChild(resizableImageInput);

    // === Special Characters ===
    toolbar.appendChild(createSpecialCharsDropdown(editor));

    // === Buttons ===
    buttons.forEach(({ icon, action, tooltip, checkActive }) => {
        toolbar.appendChild(createIconButton(icon, action, tooltip, checkActive));
    });

    // === Source Mode ===
    const toggleSourceModeButton = createIconButton(
        'fas fa-file-code',
        () => {
            isSourceMode = !isSourceMode;
            toggleSourceModeButton.classList.toggle('is-active', isSourceMode);

            const host = editor.options.element?.parentElement ?? toolbar.parentElement;

            if (isSourceMode) {
                const rawHtml = editor.getHTML();
                const formatted = formatHtmlPretty(rawHtml);

                sourceTextarea = document.createElement('textarea');
                sourceTextarea.className = 'source-mode-textarea';
                sourceTextarea.value = formatted;
                sourceTextarea.style.width = '100%';
                sourceTextarea.style.minHeight = '250px';

                editor.view.dom.style.display = 'none';
                host?.appendChild(sourceTextarea);
                sourceTextarea.focus();

                toolbar.querySelectorAll('button').forEach((btn) => {
                    if (btn !== toggleSourceModeButton) (btn as HTMLButtonElement).disabled = true;
                });

                const sync = (): void => {
                    if (!sourceTextarea) return;
                    const safeHtml = sanitizeHtmlForTiptap(sourceTextarea.value);
                    withContentCheckDisabled(editor, () => {
                        editor.commands.setContent(safeHtml, true);
                    });
                };

                let t: number | undefined;
                const debouncedSync = (): void => {
                    window.clearTimeout(t);
                    t = window.setTimeout(sync, 200) as unknown as number;
                };

                sourceTextarea.addEventListener('input', debouncedSync);
                sourceTextarea.addEventListener('paste', () => setTimeout(sync, 0));

                (sourceTextarea as any)._sync = sync;
                (sourceTextarea as any)._debouncedSync = debouncedSync;
            } else {
                if (sourceTextarea) {
                    const sync = (sourceTextarea as any)._sync as () => void;
                    const debouncedSync = (sourceTextarea as any)._debouncedSync as () => void;

                    if (debouncedSync) sourceTextarea.removeEventListener('input', debouncedSync);

                    try {
                        if (sync) sync();
                    } catch (e) {
                        console.error('[SourceMode] final sync failed:', e);
                    }

                    sourceTextarea.remove();
                    sourceTextarea = null;
                }

                editor.view.dom.style.display = '';

                toolbar.querySelectorAll('button').forEach((btn) => {
                    (btn as HTMLButtonElement).disabled = false;
                });

                editor.commands.focus('end');
                updateActiveButtons();
            }
        },
        'Toggle Source Mode'
    );

    toolbar.appendChild(toggleSourceModeButton);

    // === Reset Button States ===
    const clearFormattingButton = createIconButton(
        'fas fa-eraser',
        () => {
            const { state, view } = editor;
            const { from, to } = state.selection;
            const tr = state.tr;

            const allMarkTypes = [
                'bold', 'italic', 'underline', 'strike',
                'link', 'highlight', 'fontSize', 'fontFamily', 'color'
            ];

            allMarkTypes.forEach((mark) => {
                if (state.schema.marks[mark]) {
                    tr.removeMark(from, to, state.schema.marks[mark]);
                }
            });

            state.doc.nodesBetween(from, to, (node, pos) => {
                if (node.isTextblock && node.attrs) {
                    const newAttrs = { ...node.attrs, style: null, textAlign: null };
                    tr.setNodeMarkup(pos, undefined, newAttrs);
                }
            });

            tr.setStoredMarks([]);
            view.dispatch(tr);
            view.focus();

            editor.chain()
                .focus()
                .unsetColor()
                .unsetHighlight()
                .unsetFontSize()
                .unsetAllMarks()
                .run();

            editor.chain().focus()
                .setFontFamily('Arial')
                .setFontSize('14')
                .run();

            editor.storage.lastFontFamily = 'Arial';
            editor.storage.lastFontSize = null;
            editor.storage.lastFontColor = null;

            const defaultSizeItem = toolbar.querySelector(
                '.tiptap-fontsize-dropdown-menu .dropdown-item'
            ) as HTMLElement;
            if (defaultSizeItem && defaultSizeItem.textContent?.toLowerCase().includes('default')) {
                defaultSizeItem.click();
            }

            const highlightIcon = toolbar.querySelector('.highlight-icon') as HTMLElement;
            if (highlightIcon) {
                highlightIcon.style.backgroundColor = 'transparent';
            }

            const colorButton = toolbar.querySelector('.color-picker-wrapper') as HTMLElement;
            if (colorButton) {
                colorButton.style.backgroundColor = 'transparent';
            }

            updateActiveButtons();
        },
        'Clear All Formatting'
    );

    toolbar.appendChild(clearFormattingButton);

    // === Custom block indent/outdent commands ===
    const adjustIndent = (direction: 1 | -1): (() => void) => {
        return (): void => {
            const { state, view } = editor;
            const { from, to } = state.selection;
            const tr = state.tr;

            const currentFont = editor.getAttributes('fontFamily')?.fontFamily || 'Arial';
            const currentSize = editor.getAttributes('fontSize')?.fontSize;
            const currentColor = editor.getAttributes('color')?.color;
            const storedMarks = [];

            if (currentFont && state.schema.marks.fontFamily) {
                storedMarks.push(state.schema.marks.fontFamily.create({ fontFamily: currentFont }));
            }
            if (currentSize && state.schema.marks.fontSize) {
                storedMarks.push(state.schema.marks.fontSize.create({ fontSize: currentSize }));
            }
            if (currentColor && state.schema.marks.color) {
                storedMarks.push(state.schema.marks.color.create({ color: currentColor }));
            }

            let changed = false;

            state.doc.nodesBetween(from, to, (node, pos) => {
                const typeName = node.type.name;

                if (typeName === 'listItem') {
                    const listCommand = direction === 1 ? 'sinkListItem' : 'liftListItem';
                    let chain = editor.chain().focus()[listCommand]('listItem');
                    chain = reapplyActiveMarksInChain(chain);
                    chain.run();
                    changed = true;
                    return false;
                }

                if (['paragraph', 'heading', 'blockquote'].includes(typeName)) {
                    const currentStyle = node.attrs.style || '';
                    const match = currentStyle.match(/margin-left:\s*(\d+)em/);
                    const currentIndent = match ? parseInt(match[1], 10) : 0;
                    const newIndent = Math.max(0, currentIndent + direction * 2);

                    const filteredStyle = currentStyle
                        .split(';')
                        .map((s) => s.trim())
                        .filter((s) => s && !s.startsWith('margin-left'))
                        .join('; ');

                    const newStyle = newIndent > 0
                        ? `${filteredStyle}; margin-left: ${newIndent}em`.trim()
                        : filteredStyle;

                    tr.setNodeMarkup(pos, node.type, {
                        ...node.attrs,
                        style: newStyle || null,
                    }, node.marks);

                    changed = true;
                }
            });

            if (changed) {
                tr.setStoredMarks(storedMarks.length > 0 ? storedMarks : null);
                view.dispatch(tr);
                view.focus();
            }
        };
    };

    toolbar.appendChild(
        createIconButton('fas fa-indent', adjustIndent(1), 'Indent')
    );

    toolbar.appendChild(
        createIconButton('fas fa-outdent', adjustIndent(-1), 'Outdent')
    );



    // === Merge Cells Button ===
    const mergeButton = createIconButton('fas fa-object-group', () => {
        editor.chain().focus().mergeCells().run();
    }, 'Merge Selected Cells');

    mergeButton.style.display = 'none';
    toolbar.appendChild(mergeButton);

    editor.on('selectionUpdate', () => {
        const state = editor.view.state;
        const selection: any = state.selection;

        toolbar.querySelectorAll('button').forEach((btn) => {
            const checker = (btn as any)._checkActive;
            if (typeof checker === 'function') {
                btn.classList.toggle('is-active', checker());
            }
        });

        const isTableSelection = selection && '$anchorCell' in selection && '$headCell' in selection;

        let isMultiCell = false;
        if (isTableSelection) {
            const anchorCell = selection.$anchorCell;
            const headCell = selection.$headCell;

            if (anchorCell && headCell && typeof anchorCell.eq === 'function') {
                isMultiCell = !anchorCell.eq(headCell);
            }
        }

        mergeButton.style.display = isMultiCell ? 'inline-block' : 'none';
    });

    // === Find & Replace ===
    addFindReplace(toolbar, editor, createIconButton);

    requestAnimationFrame(() => {
        editor.commands.focus('end');
    });

    return toolbar;
}