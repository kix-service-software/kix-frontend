import {
    ITableFilterLayer, ITableSortLayer, ITableLayer,
    ITableToggleLayer, ITablePreventSelectionLayer, ITableHighlightLayer, TableFilterLayer, TableSortLayer
} from "../layer";

export class TableLayerConfiguration {

    public constructor(
        public contentLayer: ITableLayer,
        public labelLayer: ITableLayer,
        public filterLayer: Array<ITableLayer & ITableFilterLayer> = [new TableFilterLayer()],
        public sortLayer: Array<ITableLayer & ITableSortLayer> = [new TableSortLayer()],
        public toggleLayer?: ITableLayer & ITableToggleLayer,
        public preventSelectionLayer?: ITableLayer & ITablePreventSelectionLayer,
        public highlightLayer?: ITableLayer & ITableHighlightLayer
    ) { }

}
