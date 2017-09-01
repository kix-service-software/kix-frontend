import {
    ContainerComponentState
} from './../../../model/client/components/dragable-container/ContainterComponentState';

class DragableContainerComponent {

    public state: ContainerComponentState;

    public onCreate(input: any): void {
        this.state = new ContainerComponentState();
        this.state.containerConfig = input.containerConfig;
        this.state.dragEnabled = true;
    }

    public onMount(): void {
        console.log("Mount DragableContainerComponent");
    }

    public dragStart(): void {
        console.log('drag start');
    }
}

module.exports = DragableContainerComponent;
