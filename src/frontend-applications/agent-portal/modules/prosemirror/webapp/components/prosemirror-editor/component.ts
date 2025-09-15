import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';

declare const PM: any;

export class Component extends AbstractMarkoComponent<ComponentState> {
    private view: any;
    private readOnly: boolean;
    private value: string;

    public onCreate(): void {
        // console.log('[ProseMirror] onCreate');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        // console.log('[ProseMirror] onInput', input);
        this.readOnly = input.readOnly ?? false;
        this.value = input.value;
    }

    public async onMount(): Promise<void> {
        // console.log('[ProseMirror] onMount');

        const { EditorState } = PM.state;
        const { EditorView } = PM.view;
        const { DOMParser, DOMSerializer } = PM.model;
        const { schema } = PM.schema_custom;
        const { keymap } = PM.keymap;
        const { baseKeymap, setBlockType } = PM.commands;
        const { history } = PM.history;
        const { menuBar, MenuItem, Dropdown } = PM.menu;
        const { buildMenuItems } = PM.example_setup;
        const { inputRules } = PM.inputrules;
        const { dropCursor } = PM.dropcursor;
        const { gapCursor } = PM.gapcursor;
        const tables = PM.tables;

        const {
            addRowAfter,
            addColumnAfter,
            deleteTable
        } = tables;

        const nodeTypes = schema.nodes;
        const table = nodeTypes.table;
        const tableRow = nodeTypes.table_row;
        const tableCell = nodeTypes.table_cell;

        const mountElement = document.querySelector(`#${this.state.editorId}`);
        if (!mountElement) {
            console.error('[ProseMirror] mount element not found');
            return;
        }

        mountElement.innerHTML = '';

        const htmlContent = this.value || '<p></p>';
        const parsedDoc = DOMParser.fromSchema(schema).parse(
            new window.DOMParser().parseFromString(htmlContent, 'text/html').body
        );

        const menu = buildMenuItems(schema);

        const insertTable = new MenuItem({
            label: 'Insert Table',
            enable: (): boolean => !!(table && tableRow && tableCell),
            run: (state, dispatch): any => {
                if (!dispatch) return false;
                const cell = tableCell.createAndFill();
                const row = tableRow.createAndFill(null, [cell, cell]);
                const tbl = table.createAndFill(null, [row, row]);
                const tr = state.tr.replaceSelectionWith(tbl);
                dispatch(tr.scrollIntoView());
                return true;
            }
        });

        const tableMenuItems = [
            insertTable,
            new MenuItem({ label: 'Add Row After', run: addRowAfter }),
            new MenuItem({ label: 'Add Column After', run: addColumnAfter }),
            new MenuItem({ label: 'Delete Table', run: deleteTable })
        ];

        // Append as dropdown labeled "Table"
        menu.fullMenu.push([
            new Dropdown(tableMenuItems, { label: 'Table' })
        ]);

        const customKeys = {
            'Ctrl-q': setBlockType(schema.nodes.blockquote),
            'Ctrl-h': (state: any, dispatch: any): boolean => {
                if (dispatch) {
                    const hr = schema.nodes.horizontal_rule.create();
                    const tr = state.tr.replaceSelectionWith(hr);
                    dispatch(tr.scrollIntoView());
                }
                return true;
            },
            'Ctrl-t': insertTable.run
        };

        const plugins = [
            keymap(baseKeymap),
            keymap(customKeys),
            history(),
            dropCursor(),
            gapCursor(),
            tables.tableEditing(),
            inputRules({ rules: [] }),
            menuBar({ floating: false, content: menu.fullMenu })
        ];

        const state = EditorState.create({
            doc: parsedDoc,
            plugins
        });

        const view = new EditorView(mountElement, {
            state,
            editable: (): boolean => !this.readOnly,
            dispatchTransaction: (tr: any): void => {
                const newState = view.state.apply(tr);
                view.updateState(newState);

                const serializer = DOMSerializer.fromSchema(schema);
                const fragment = serializer.serializeFragment(newState.doc.content);
                const div = document.createElement('div');
                div.appendChild(fragment);
                const html = div.innerHTML;

                // console.log('[ProseMirror] Emitting valueChanged:', html);
                (this as any).emit('valueChanged', html);
            }
        });

        this.view = view;
        // console.log('[ProseMirror] View created with advanced features');
    }

    public onDestroy(): void {
        // console.log('[ProseMirror] onDestroy');
        if (this.view) {
            this.view.destroy();
            // console.log('[ProseMirror] Editor destroyed');
        }
    }
}

module.exports = Component;