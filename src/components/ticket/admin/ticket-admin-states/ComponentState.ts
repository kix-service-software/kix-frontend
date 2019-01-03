import { StandardTable } from "../../../../core/browser";
import { KIXObjectPropertyFilter, AbstractAction } from "../../../../core/model";

export class ComponentState {

    public constructor(
        public table: StandardTable = null,
        public predefinedTableFilter: KIXObjectPropertyFilter[] = [],
        public actions: AbstractAction[] = [],
        public instanceId: string = '201812071000-ticket-states-list',
        public title: string = 'Stammdaten: Status',
        public filterCount: number = null
    ) { }

}
