import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent, ComponentsService, IColumn, ValueState, ICell, TableCSSHandlerRegsitry
} from '../../../../../../core/browser';

class Component extends AbstractMarkoComponent<ComponentState> {

    private column: IColumn;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {

        if (input.column) {
            this.column = input.column;
            const componentId = (this.column as IColumn).getColumnConfiguration().componentId;
            this.state.showDefaultCell = !componentId || componentId === '';
        }

        if (input.cell) {
            const table = input.cell.getRow().getTable();
            const tableConfiguration = table.getTableConfiguration();
            if (tableConfiguration && tableConfiguration.routingConfiguration) {
                this.state.object = input.cell.getRow().getRowObject().getObject();
                this.state.routingConfiguration = tableConfiguration.routingConfiguration;
                if (this.state.routingConfiguration && this.state.object) {
                    this.state.objectId = this.state.object[this.state.routingConfiguration.objectIdProperty];
                }
            }

            this.setValueStateClass(input.cell);
        }
    }

    public getCellTemplate(): any {
        if (this.column) {
            return ComponentsService.getInstance().getComponentTemplate(
                this.column.getColumnConfiguration().componentId
            );
        }
        return undefined;
    }

    private setValueStateClass(cell: ICell): void {
        const classes = [];
        const state = cell.getValue().state && cell.getValue().state !== ValueState.NONE
            ? cell.getValue().state : cell.getRow().getRowObject().getValueState();
        if (state) {
            switch (state) {
                case ValueState.CHANGED:
                    classes.push('cell-value-changed');
                    break;
                case ValueState.DELETED:
                    classes.push('cell-value-deleted');
                    break;
                case ValueState.NEW:
                    classes.push('cell-value-new');
                    break;
                case ValueState.NOT_EXISTING:
                    classes.push('cell-value-not-existing');
                    break;
                case ValueState.HIGHLIGHT_ERROR:
                    classes.push('cell-value-highlight_error');
                    break;
                case ValueState.HIGHLIGHT_REMOVED:
                    classes.push('cell-value-highlight_removed');
                    break;
                case ValueState.HIGHLIGHT_UNAVAILABLE:
                    classes.push('cell-value-highlight_unavailable');
                    break;
                case ValueState.HIGHLIGHT_SUCCESS:
                    classes.push('cell-value-highlight_success');
                    break;
                default:
            }
        }

        const object = cell.getRow().getRowObject().getObject();
        if (object) {
            const objectType = cell.getRow().getTable().getObjectType();
            const cssHandler = TableCSSHandlerRegsitry.getCSSHandler(objectType);
            if (cssHandler) {
                const valueClasses = cssHandler.getValueCSSClasses(object, cell.getValue());
                valueClasses.forEach((c) => classes.push(c));
            }
        }

        this.state.stateClasses = classes;
    }
}

module.exports = Component;
