import { KIXObjectPropertyFilter, AbstractAction } from "../../../../core/model";
import { ITable } from "../../../../core/browser";

export class ComponentState {

    public constructor(
        public table: ITable = null,
        public predefinedTableFilter: KIXObjectPropertyFilter[] = [],
        public actions: AbstractAction[] = [],
        public instanceId: string = '20181207104825-ticket-priorities-list',
        public title: string = 'Stammdaten: Prioritäten',
        public filterCount: number = null
    ) { }

}
