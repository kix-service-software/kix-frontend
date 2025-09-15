const { Editor, Node, Mark, mergeAttributes } = require('@tiptap/core');
const StarterKit = require('@tiptap/starter-kit').default;
const Underline = require('@tiptap/extension-underline').default;
const Placeholder = require('@tiptap/extension-placeholder').default;
const TableBase = require('@tiptap/extension-table').default;
const TableRow = require('@tiptap/extension-table-row').default;
const TableCellBase = require('@tiptap/extension-table-cell').default;
const TableHeaderBase = require('@tiptap/extension-table-header').default;
const FloatingMenu = require('@tiptap/extension-floating-menu').default;
const BubbleMenu = require('@tiptap/extension-bubble-menu').default;
const TextStyleBase = require('@tiptap/extension-text-style').default;
const Mention = require('@tiptap/extension-mention').default;
const HighlightBase = require('@tiptap/extension-highlight').default;
const TextAlign = require('@tiptap/extension-text-align').default;
const Color = require('@tiptap/extension-color').default;
const Paragraph = require('@tiptap/extension-paragraph').default;
const BoldBase = require('@tiptap/extension-bold').default;

function readCssPropFromStyleAttr(element, propName) {
    try {
        const styleAttr = (element.getAttribute && element.getAttribute('style')) || '';
        if (!styleAttr) return null;
        const re = new RegExp(`(?:^|;)\\s*${propName}\\s*:\\s*([^;]+)`, 'i');
        const m = styleAttr.match(re);
        if (!m) return null;
        return m[1].trim();
    } catch {
        return null;
    }
}


const Link = require('@tiptap/extension-link').default.configure({
    HTMLAttributes: {
        rel: 'noopener noreferrer',
        target: '_blank',
        class: 'custom-link-class',
    },
});

const Subscript = Mark.create({
    name: 'subscript',

    parseHTML() {
        return [
            { tag: 'sub' },
            { style: 'vertical-align=sub' }
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['sub', mergeAttributes(HTMLAttributes), 0];
    },

    addCommands() {
        return {
            toggleSubscript: () => ({ commands }) =>
                commands.toggleMark('subscript'),
        };
    },

    addKeyboardShortcuts() {
        return {
            'Mod-,': () => this.editor.commands.toggleSubscript(),
        };
    }
});

const Superscript = Mark.create({
    name: 'superscript',

    parseHTML() {
        return [
            { tag: 'sup' },
            { style: 'vertical-align=super' }
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['sup', mergeAttributes(HTMLAttributes), 0];
    },

    addCommands() {
        return {
            toggleSuperscript: () => ({ commands }) =>
                commands.toggleMark('superscript'),
        };
    },

    addKeyboardShortcuts() {
        return {
            'Mod-.': () => this.editor.commands.toggleSuperscript(),
        };
    }
});

const Bold = BoldBase.extend({ excludes: '' });

const Highlight = HighlightBase.extend({
    excludes: '',

    addAttributes() {
        return {
            color: {
                default: null,
                parseHTML: element => element.style?.backgroundColor || null,
                renderHTML: attributes => {
                    if (!attributes.color) return { style: 'color: inherit' };
                    return {
                        style: `background-color: ${attributes.color}; color: inherit`,
                    };
                },
            },
        };
    },

    priority: 90,
});

const CustomParagraph = Paragraph.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            textAlign: {
                default: null,
                parseHTML: el => el.style.textAlign || null,
                renderHTML: attrs => (attrs.textAlign ? { style: `text-align:${attrs.textAlign}` } : {}),
            },
            style: {
                default: null,
                parseHTML: el => {
                    const raw = el.getAttribute('style') || '';
                    const cleaned = raw
                        .split(';')
                        .map(s => s.trim())
                        .filter(s => s && !/^text-align\s*:/i.test(s))
                        .join('; ');
                    return cleaned || null;
                },
                renderHTML: attrs => {
                    const parts = (attrs.style ? attrs.style.split(';') : [])
                        .map(s => s.trim())
                        .filter(s => s && !/^text-align\s*:/i.test(s));
                    if (attrs.textAlign) parts.push(`text-align:${attrs.textAlign}`);
                    return parts.length ? { style: parts.join('; ') } : {};
                },
            },
        };
    },
    addOptions() { return { ...(this.parent?.() || {}), marks: '_' }; },
});

const TextStyle = TextStyleBase.extend({
    addAttributes() {
        const parentAttrs = this.parent?.() || {};
        return {
            ...parentAttrs,
            fontFamily: {
                default: null,
                parseHTML: el => {
                    const v = readCssPropFromStyleAttr(el, 'font-family');
                    return v ? v.replace(/['"]/g, '') : null;
                },
            },
            fontSize: {
                default: null,
                parseHTML: el => {
                    const v = readCssPropFromStyleAttr(el, 'font-size');
                    if (!v) return null;
                    const m = String(v).trim().match(/^([0-9.]+)\s*px$/i) || String(v).trim().match(/^([0-9.]+)$/);
                    return m ? m[1] : null;
                },
            },
        };
    },

    renderHTML({ HTMLAttributes }) {
        const attrs = { ...HTMLAttributes };
        const styleParts = [];

        const existing = (attrs.style || '').trim();
        if (existing) styleParts.push(existing.replace(/;?\s*$/, ''));

        const ff = attrs.fontFamily;
        if (ff) styleParts.push(`font-family:${ff}`);

        const fs = attrs.fontSize;
        if (fs) {
            const css = /^\d+(\.\d+)?(px|em|rem|%)$/i.test(fs) ? fs : `${fs}px`;
            styleParts.push(`font-size:${css}`);
        }

        delete attrs.fontFamily;
        delete attrs.fontSize;

        const style = styleParts.join('; ');
        if (style) attrs.style = style;
        else delete attrs.style;

        return ['span', attrs, 0];
    },

    addCommands() {
        const parent = this.parent?.() || {};
        return {
            ...parent,
            setFontFamily:
                font => ({ chain }) => chain().setMark('textStyle', { fontFamily: font }).run(),
            unsetFontFamily:
                () => ({ chain }) => chain().setMark('textStyle', { fontFamily: null }).run(),
            setFontSize:
                size => ({ chain }) => {
                    const v = typeof size === 'number' ? String(size) : String(size).trim();
                    return chain().setMark('textStyle', { fontSize: v }).run();
                },
            unsetFontSize:
                () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).run(),

            clearTypography:
                () => ({ chain, state, commands }) => {
                    const ch = chain()
                        .setMark('textStyle', { fontFamily: null, fontSize: null, color: null });
                    if (commands.unsetColor) ch.unsetColor();
                    return ch.unsetMark('textStyle').run();
                },
        };
    },
});

const ResizableImage = Node.create({
    name: 'resizableImage',
    inline: true,
    group: 'inline',
    atom: true,
    draggable: true,
    selectable: false,

    addAttributes() {
        return {
            src: { default: null },
            alt: { default: null },
            title: { default: null },
            width: {
                default: 300,
                parseHTML: el => {
                    const dataW = el.getAttribute?.('data-width');
                    const styleW = el.style?.width?.replace('px', '');
                    const attrW = el.getAttribute?.('width');
                    const v = dataW || styleW || attrW;
                    const n = v ? parseInt(v, 10) : 300;
                    return Number.isFinite(n) ? n : 300;
                },
                renderHTML: attrs => ({
                    'data-width': String(attrs.width),
                    style: `width:${attrs.width}px`,
                }),
            },
            align: {
                default: 'left',
                parseHTML: el => el.getAttribute?.('data-align') || 'left',
                renderHTML: attrs => ({ 'data-align': attrs.align }),
            },
            isGif: {
                default: false,
                parseHTML: el => {
                    const img = el.tagName?.toLowerCase() === 'img' ? el : el.querySelector?.('img');
                    const src = img?.getAttribute?.('src') || '';
                    return /^data:image\/gif|\.gif(\?|$)/i.test(src);
                },
                renderHTML: attrs => (attrs.isGif ? { 'data-gif': '1' } : {}),
            },
        };
    },

    parseHTML() {
        return [
            { tag: 'span[data-type="resizable-image-wrapper"]' },
            {
                tag: 'img[src]',
                getAttrs: el => {
                    const dataW = el.getAttribute?.('data-width');
                    const styleW = el.style?.width?.replace('px', '');
                    const attrW = el.getAttribute?.('width');
                    const width = parseInt(dataW || styleW || attrW || '300', 10);
                    const src = el.getAttribute?.('src') || '';
                    const isGif = /^data:image\/gif|\.gif(\?|$)/i.test(src);
                    return {
                        src,
                        alt: el.getAttribute?.('alt') || null,
                        title: el.getAttribute?.('title') || null,
                        width: Number.isFinite(width) ? width : 300,
                        align: 'left',
                        isGif,
                    };
                },
            },
        ];
    },

    renderHTML({ node }) {
        const { src, alt, title, width, align, isGif } = node.attrs;
        return [
            'span',
            { 'data-type': 'resizable-image-wrapper', 'data-align': align, style: `display:inline-block; text-align:${align};` },
            [
                'img',
                {
                    src, alt, title,
                    'data-width': String(width),
                    width: String(width),
                    style: `max-width:100%; width:${width}px; display:inline-block;`,
                    ...(isGif ? { 'data-gif': '1' } : {}),
                },
            ],
        ];
    },

    addNodeView() {
        return ({ node, editor, getPos, updateAttributes }) => {
            const outer = document.createElement('span');
            outer.style.display = 'inline-block';
            outer.style.textAlign = node.attrs.align || 'left';
            outer.setAttribute('data-type', 'resizable-image-wrapper');
            outer.setAttribute('data-align', node.attrs.align || 'left');

            const wrap = document.createElement('div');
            wrap.style.position = 'relative';
            wrap.style.display = 'inline-block';
            wrap.contentEditable = 'false';

            const img = document.createElement('img');
            img.src = node.attrs.src;
            img.alt = node.attrs.alt || '';
            img.title = node.attrs.title || '';
            img.style.maxWidth = '100%';
            img.style.display = 'inline-block';
            img.style.width = `${node.attrs.width}px`;
            img.setAttribute('data-width', String(node.attrs.width));
            if (node.attrs.isGif) img.setAttribute('data-gif', '1');

            wrap.appendChild(img);
            outer.appendChild(wrap);

            const commitWidth = w => {
                img.style.width = `${w}px`;
                img.setAttribute('data-width', String(w));
                if (typeof updateAttributes === 'function') {
                    try { updateAttributes({ width: w }); return; } catch { }
                }
                try {
                    const pos = typeof getPos === 'function' ? getPos() : null;
                    if (pos != null) {
                        const tr = editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, width: w });
                        editor.view.dispatch(tr);
                    }
                } catch { }
            };

            if (editor.isEditable) {
                wrap.style.border = '1px dashed lightgray';
                wrap.style.padding = '4px';

                const createHandle = (cursor) => {
                    const h = document.createElement('div');
                    Object.assign(h.style, {
                        position: 'absolute',
                        width: '10px',
                        height: '10px',
                        background: 'white',
                        border: '1px solid #aaa',
                        cursor,
                        zIndex: '10',
                    });

                    let startX = 0;
                    let startWidth = 0;

                    const onMove = (e2) => {
                        const dx = e2.clientX - startX;
                        const sign = cursor.includes('e') ? 1 : -1;
                        const newWidth = Math.max(50, Math.round(startWidth + dx * sign));
                        img.style.width = `${newWidth}px`;
                        img.setAttribute('data-width', String(newWidth));
                    };

                    const onUp = () => {
                        window.removeEventListener('mousemove', onMove);
                        window.removeEventListener('mouseup', onUp);
                        const finalWidth = parseInt(img.style.width, 10) || node.attrs.width || 300;
                        commitWidth(finalWidth);
                    };

                    h.addEventListener('mousedown', (e) => {
                        e.preventDefault();
                        startX = e.clientX;
                        startWidth = img.offsetWidth;
                        window.addEventListener('mousemove', onMove);
                        window.addEventListener('mouseup', onUp);
                    });

                    return h;
                };

                const corners = [
                    { cursor: 'nwse-resize', left: '-5px', top: '-5px' },
                    { cursor: 'nesw-resize', right: '-5px', top: '-5px' },
                    { cursor: 'nesw-resize', left: '-5px', bottom: '-5px' },
                    { cursor: 'nwse-resize', right: '-5px', bottom: '-5px' },
                ];

                corners.forEach(style => {
                    const handle = createHandle(style.cursor);
                    Object.assign(handle.style, style);
                    wrap.appendChild(handle);
                });
            }

            return { dom: outer, contentDOM: null };
        };
    },
});

const TableCell = TableCellBase.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            style: {
                default: null,
                parseHTML: element => element.getAttribute('style'),
                renderHTML: attributes => {
                    if (!attributes.style) return {};
                    return { style: attributes.style };
                },
            },
        };
    },
});

const TableHeader = TableHeaderBase.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            style: {
                default: null,
                parseHTML: element => element.getAttribute('style'),
                renderHTML: attributes => {
                    if (!attributes.style) return {};
                    return { style: attributes.style };
                },
            },
        };
    },
});

const Table = TableBase.extend({
    renderHTML({ HTMLAttributes }) {
        const existingClass = HTMLAttributes.class || '';
        return [
            'table',
            {
                ...HTMLAttributes,
                class: `tiptap-table ${existingClass}`.trim(),
            },
            0,
        ];
    },
});

window.Tiptap = {
    StarterKit,
    TextStyle,
    Editor,
    Underline,
    Link,
    Placeholder,
    Table,
    TableRow,
    TableCell,
    TableHeader,
    FloatingMenu,
    BubbleMenu,
    TextAlign,
    Color,
    Mention,
    Highlight,
    ResizableImage,
    CustomParagraph,
    Bold,
    Subscript,
    Superscript,
};