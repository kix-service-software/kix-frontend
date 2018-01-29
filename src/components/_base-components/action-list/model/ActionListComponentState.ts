import { ConfiguredWidget, Ticket, Article } from '@kix/core/dist/model';

export class ActionListComponentState {

    public constructor(
        public list: string[] = [],
        public expansionList: string[] = [],
        public showExpansionList: boolean = false,
        public keepShow: boolean = false
    ) { }
}
