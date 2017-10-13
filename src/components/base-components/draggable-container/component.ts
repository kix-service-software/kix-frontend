import { promiseMiddleware } from 'redux-promise-middleware';
import { ContainerComponentState } from './model/ContainterComponentState';
import { ContainerRow } from '@kix/core/dist/model/client';

class DraggableContainerComponent {

    public state: ContainerComponentState;

    public onCreate(input: any): void {
        this.state = new ContainerComponentState();
        this.state.dndState.enabled = true;
        this.state.configurationMode = input.configurationMode;
        this.state.containerConfiguration = input.containerConfiguration;
    }

    public onInput(input: any): void {
        this.state.containerConfiguration = input.containerConfiguration;
        this.state.configurationMode = input.configurationMode;
        this.state.dndState.enabled = input.configurationMode;
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
            this.state.containerConfiguration.rows, this.state.dndState.dragElementId, this.state.dndState.dropElementId
        );

        this.state.containerConfiguration.rows = null;
        (this as any).setStateDirty("containerConfiguration");
        setTimeout(() => {
            this.state.containerConfiguration.rows = rows;
            (this as any).setStateDirty("containerConfiguration");
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

    private switchWidgets(rows: ContainerRow[], firstWidgetId: string, secondWidgetId: string): ContainerRow[] {
        let firstRowIndex = -1;
        let firstWidgetIndex = -1;
        let secondRowIndex = -1;
        let secondWidgetIndex = -1;

        for (let i = 0; i < rows.length; i++) {

            if (firstRowIndex === -1) {
                firstWidgetIndex = rows[i].widgets.findIndex((w) => w.instanceId === firstWidgetId);

                if (firstWidgetIndex >= 0) {
                    firstRowIndex = i;
                }
            }

            if (secondRowIndex === -1) {
                secondWidgetIndex = rows[i].widgets.findIndex((w) => w.instanceId === secondWidgetId);

                if (secondWidgetIndex >= 0) {
                    secondRowIndex = i;
                }
            }

            if (firstRowIndex > -1 && secondRowIndex > -1) {
                break;
            }
        }


        const firstWidget = rows[firstRowIndex].widgets[firstWidgetIndex];
        const secondWidget = rows[secondRowIndex].widgets[secondWidgetIndex];

        rows[firstRowIndex].widgets[firstWidgetIndex] = secondWidget;
        rows[secondRowIndex].widgets[secondWidgetIndex] = firstWidget;

        return rows;
    }
}

module.exports = DraggableContainerComponent;
