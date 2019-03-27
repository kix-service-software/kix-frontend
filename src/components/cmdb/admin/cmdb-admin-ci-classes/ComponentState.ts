import { KIXObjectPropertyFilter, AbstractAction } from "../../../../core/model";
import { ITable } from "../../../../core/browser";

export class ComponentState {

    public constructor(
        public table: ITable = null,
        public predefinedTableFilter: KIXObjectPropertyFilter[] = [],
        public actions: AbstractAction[] = [],
        public instanceId: string = '20181210151212-cmdb-ci-classes-list',
        public title: string = 'Stammdaten: CMDB Klassen',
        public filterCount: number = null
    ) { }

}
