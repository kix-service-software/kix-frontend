const { Schema } = require('prosemirror-model');
const { schema: basicSchema } = require('prosemirror-schema-basic');
const { tableNodes } = require('prosemirror-tables');

window.PM = {
    // Core modules
    state: require('prosemirror-state'),
    view: require('prosemirror-view'),
    model: require('prosemirror-model'),

    // Basic schema (still exposed if needed elsewhere)
    schema_basic: require('prosemirror-schema-basic'),

    // Menu and commands
    menu: require('prosemirror-menu'),
    keymap: require('prosemirror-keymap'),
    commands: require('prosemirror-commands'),
    history: require('prosemirror-history'),
    example_setup: require('prosemirror-example-setup'),
    inputrules: require('prosemirror-inputrules'),

    // UI helpers
    dropcursor: require('prosemirror-dropcursor'),
    gapcursor: require('prosemirror-gapcursor'),

    // Table support
    tables: require('prosemirror-tables'),

    // Syntax highlight (optional)
    highlight: require('highlight.js'),

    // Custom schema with table support
    schema_custom: {
        schema: new Schema({
            nodes: basicSchema.spec.nodes.append(
                tableNodes({
                    tableGroup: "block",
                    cellContent: "block+",
                    cellAttributes: {
                        background: {
                            default: null,
                            getFromDOM(dom) {
                                return dom.style.backgroundColor || null;
                            },
                            setDOMAttr(value, attrs) {
                                if (value) attrs.style = `background-color: ${value};`;
                            }
                        }
                    }
                })
            ),
            marks: basicSchema.spec.marks
        })
    }
};