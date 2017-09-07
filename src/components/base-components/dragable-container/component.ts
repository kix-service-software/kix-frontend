import { ContainerComponentState } from './model/ContainterComponentState';
class DragableContainerComponent {

    public state: ContainerComponentState;

    public onCreate(input: any): void {
        this.state = new ContainerComponentState();
        this.state.dndState.enabled = true;
        this.state.configurationMode = input.configurationMode;
        this.state.containerConfiguration = input.containerConfiguration;
    }

    public onInput(input: any): void {
        this.state.configurationMode = input.configurationMode;
        this.state.dndState.enabled = input.configurationMode;
    }

    public dragStart(event): void {
        this.state.dndState = {
            ...this.state.dndState,
            dragging: true,
            dragElementId: event.target.id
        };
        event.dataTransfer.setData("dragId", event.target.id);
    }

    public dragOver(event): void {
        if (!this.isValidDnDEvent(event)) {
            return;
        }

        if (event.preventDefault) {
            // Necessary. Allows us to drop.
            event.preventDefault();
        }

        this.state.dndState = {
            ...this.state.dndState,
            dropElementId: event.target.id
        };
    }

    public drop(event): void {
        // console.log('drop');
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
        return (event.target.id !== "") &&
            (event.target.id.startsWith('overlay-')) &&
            (event.target.id !== 'overlay-' + event.dataTransfer.getData("dragId"));
    }
}

module.exports = DragableContainerComponent;
