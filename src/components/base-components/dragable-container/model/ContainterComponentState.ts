import { ContainerConfiguration } from './../../../../model/client/components/';
import { DragAndDropState } from './DragAndDropState';

export class ContainerComponentState {

    public configurationName: string = "";

    public containerConfiguration: ContainerConfiguration = new ContainerConfiguration();

    public widgets: any[] = [];

    public dndState: DragAndDropState = new DragAndDropState();

    public configurationMode: boolean = false;

}
