import { promiseMiddleware } from 'redux-promise-middleware';
import { ContainerComponentState } from './model/ContainterComponentState';

class DraggableContainerComponent {

    public state: ContainerComponentState;

    public onCreate(input: any): void {
        this.state = new ContainerComponentState();
        this.state.dndState.enabled = true;
        this.state.rows = input.rows;
    }

    public onInput(input: any): void {
        this.state.rows = input.rows;
        this.state.widgetTemplates = input.widgetTemplates;
        this.state.dndState.enabled = input.configurationMode;
    }

    public getWidgetTemplate(instanceId: string): any {
        const template = this.state.widgetTemplates.find((wt) => wt.instanceId === instanceId).template;
        return template ? require(template) : '';
    }

    public dragStart(event): void {
        this.state.dndState = {
            ...this.state.dndState,
            dragging: true,
            dragElementId: event.target.dataset.id
        };
        event.dataTransfer.setData("dragId", event.target.dataset.id);
    }

    public dragOver(event): void {
        if (!this.isValidDnDEvent(event)) {
            return;
        }

        if (event.preventDefault) {
            // Necessary. Allows us to drop.
            event.preventDefault();
        }

        if (event.target.dataset.id === this.state.dndState.dragElementId) {
            return;
        }

        this.state.dndState = {
            ...this.state.dndState,
            dropElementId: event.target.dataset.id
        };
    }

    public drop(event): void {
        const rows = this.switchWidgets(
            this.state.rows, this.state.dndState.dragElementId, this.state.dndState.dropElementId
        );

        this.state.rows = null;
        (this as any).setStateDirty("rows");
        setTimeout(() => {
            this.state.rows = rows;
            (this as any).setStateDirty("rows");
        }, 0);
    }

    public dragEnd(event): void {
        this.state.dndState = {
            ...this.state.dndState,
            dragging: false,
            dragElementId: "",
            dropElementId: ""
        };
    }

    private isValidDnDEvent(event): boolean {
        return (event.target.dataset.hasOwnProperty('id')) && (event.target.dataset.id !== "");
    }

    private switchWidgets(rows: string[][], firstWidgetId: string, secondWidgetId: string): string[][] {
        let firstRowIndex = -1;
        let firstWidgetIndex = -1;
        let secondRowIndex = -1;
        let secondWidgetIndex = -1;

        for (let i = 0; i < rows.length; i++) {

            if (firstRowIndex === -1) {
                firstWidgetIndex = rows[i].findIndex((wiId) => wiId === firstWidgetId);

                if (firstWidgetIndex >= 0) {
                    firstRowIndex = i;
                }
            }

            if (secondRowIndex === -1) {
                secondWidgetIndex = rows[i].findIndex((wiId) => wiId === secondWidgetId);

                if (secondWidgetIndex >= 0) {
                    secondRowIndex = i;
                }
            }

            if (firstRowIndex > -1 && secondRowIndex > -1) {
                break;
            }
        }


        const firstWidget = rows[firstRowIndex][firstWidgetIndex];
        const secondWidget = rows[secondRowIndex][secondWidgetIndex];

        rows[firstRowIndex][firstWidgetIndex] = secondWidget;
        rows[secondRowIndex][secondWidgetIndex] = firstWidget;

        return rows;
    }
}

module.exports = DraggableContainerComponent;
