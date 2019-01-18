import { StandardTable } from '../../../../core/browser';
import { Ticket, WidgetComponentState, IAction, KIXObjectPropertyFilter } from '../../../../core/model';

export class ComponentState extends WidgetComponentState {

    public constructor(
        public table: StandardTable = null,
        public predefinedTableFilter: KIXObjectPropertyFilter[] = [],
        public actions: IAction[] = [],
        public title: string = null,
        public filterCount: number = null
    ) {
        super();
    }

}
