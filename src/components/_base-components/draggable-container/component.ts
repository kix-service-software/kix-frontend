import { promiseMiddleware } from 'redux-promise-middleware';
import { ContainerComponentState } from './model/ContainterComponentState';
import { ApplicationService } from '@kix/core/dist/browser/application/ApplicationService';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';

class DraggableContainerComponent {

    private state: ContainerComponentState;

    public onCreate(input: any): void {
        this.state = new ContainerComponentState();
        this.state.dndState.enabled = true;
        this.state.rows = input.rows;
    }

    public onInput(input: any): void {
        this.state.rows = input.rows;
        this.state.dndState.enabled = input.configurationMode;
    }

    private getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getContext();
        const configuration = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return configuration ? ClientStorageHandler.getComponentTemplate(configuration.widgetId) : undefined;
    }

    private dragStart(event): void {
        this.state.dndState = {
            ...this.state.dndState,
            dragging: true,
            dragElementId: event.target.dataset.id
        };
        event.dataTransfer.setData("dragId", event.target.dataset.id);
    }

    private dragOver(event): void {
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

    private drop(event): void {
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

    private dragEnd(event): void {
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

    private isConfigMode(): boolean {
        return ApplicationService.getInstance().isConfigurationMode();
    }

    private isConfigDialogShown(): boolean {
        return ApplicationService.getInstance().isShowMainDialog();
    }
}

module.exports = DraggableContainerComponent;
