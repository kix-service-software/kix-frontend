import { DragAndDropState } from './DragAndDropState';
import { ContainerConfig } from './ContainerConfig';

export class ContainerComponentState {

    public containerConfiguration: ContainerConfig = new ContainerConfig();

    public widgets: any[] = [];

    public dndState: DragAndDropState = new DragAndDropState();

}
