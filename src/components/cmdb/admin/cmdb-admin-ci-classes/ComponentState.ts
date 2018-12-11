import { StandardTable } from "@kix/core/dist/browser";
import { KIXObjectPropertyFilter, AbstractAction } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public table: StandardTable = null,
        public predefinedTableFilter: KIXObjectPropertyFilter[] = [],
        public actions: AbstractAction[] = [],
        public instanceId: string = '20181210151212-cmdb-ci-classes-list',
        public title: string = 'Stammdaten: CMDB Klassen',
        public filterCount: number = null
    ) { }

}
