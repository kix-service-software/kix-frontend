import { DragAndDropState } from './DragAndDropState';
import { ContainerConfiguration } from './ContainerConfiguration';

export class ContainerComponentState {

    public configurationName: string = "";

    public containerConfiguration: ContainerConfiguration = new ContainerConfiguration();

    public widgets: any[] = [];

    public dndState: DragAndDropState = new DragAndDropState();

}
