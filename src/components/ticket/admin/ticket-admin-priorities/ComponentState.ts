import { StandardTable } from "@kix/core/dist/browser";
import { KIXObjectPropertyFilter, AbstractAction } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public table: StandardTable = null,
        public predefinedTableFilter: KIXObjectPropertyFilter[] = [],
        public actions: AbstractAction[] = [],
        public instanceId: string = '20181207104825-ticket-priorities-list',
        public title: string = 'Stammdaten: Prioritäten',
        public filterCount: number = null
    ) {
    }

}
