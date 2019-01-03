import { StandardTable } from "../../../../core/browser";
import { KIXObjectPropertyFilter, AbstractAction } from "../../../../core/model";

export class ComponentState {

    public constructor(
        public table: StandardTable = null,
        public predefinedTableFilter: KIXObjectPropertyFilter[] = [],
        public actions: AbstractAction[] = [],
        public instanceId: string = '201811271234-ticket-types-list',
        public title: string = 'Stammdaten: Typen',
        public filterCount: number = null
    ) { }

}
