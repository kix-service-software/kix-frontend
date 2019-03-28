import { ImportManager } from '../../../../core/browser/import';
import { ITable, AbstractComponentState } from '../../../../core/browser';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public instanceId: string = null,
        public importConfigFormId: string = null,
        public importManager: ImportManager = null,
        public table: ITable = null,
        public tableTitle: string = null,
        public canRun: boolean = false,
        public run: boolean = false
    ) {
        super();
    }

}
