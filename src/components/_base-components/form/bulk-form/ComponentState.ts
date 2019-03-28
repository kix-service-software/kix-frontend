import { BulkManager } from '../../../../core/browser/bulk';
import { ITable, AbstractComponentState } from '../../../../core/browser';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public objectCount: number = 0,
        public table: ITable = null,
        public bulkManager: BulkManager = null,
        public tableTitle: string = '',
        public canRun: boolean = false,
        public run: boolean = false
    ) {
        super();
    }

}
