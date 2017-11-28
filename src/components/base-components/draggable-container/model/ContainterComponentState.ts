import { WidgetTemplate } from '@kix/core/dist/model';
import { DragAndDropState } from './DragAndDropState';

export class ContainerComponentState {

    public configurationName: string = "";

    public rows: string[][] = [];

    public widgetTemplates: WidgetTemplate[] = [];

    public widgets: any[] = [];

    public dndState: DragAndDropState = new DragAndDropState();
}
