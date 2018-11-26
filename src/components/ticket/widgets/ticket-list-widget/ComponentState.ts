import { StandardTable } from '@kix/core/dist/browser';
import { Ticket, WidgetComponentState, IAction, KIXObjectPropertyFilter } from '@kix/core/dist/model';

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
