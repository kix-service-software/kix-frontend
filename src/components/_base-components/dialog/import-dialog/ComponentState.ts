import { ImportManager } from '../../../../core/browser/import';
import { ITable } from '../../../../core/browser';
import { KIXObjectType } from '../../../../core/model';

export class ComponentState {

    public constructor(
        public instanceId: string = null,
        public importConfigFormId: string = null,
        public importManager: ImportManager = null,
        public table: ITable = null,
        public tableTitle: string = null,
        public canRun: boolean = false,
        public run: boolean = false
    ) { }

}
