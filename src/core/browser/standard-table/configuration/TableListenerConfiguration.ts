import { ITableClickListener, ITableSelectionListener, ITableConfigurationListener } from "../listener";

export class TableListenerConfiguration {

    public constructor(
        public clickListener?: ITableClickListener,
        public selectionListener?: ITableSelectionListener,
        public configurationChangeListener?: ITableConfigurationListener
    ) { }

}
