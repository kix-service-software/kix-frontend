import { ImportManager } from '../../../../core/browser/import';
import { ITable } from '../../../../core/browser';

export class ComponentState {

    public constructor(
        public instanceId: string = null,
        public loading: boolean = true,
        public importConfigFormId: string = null,
        public importManager: ImportManager = null,
        public table: ITable = null,
        public tableTitle: string = null
    ) { }

}
