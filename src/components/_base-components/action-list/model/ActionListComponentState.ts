import { ConfiguredWidget, Ticket, Article } from '@kix/core/dist/model';

export class ActionListComponentState {

    public constructor(
        public initList: string[] = [],
        public rowList: string[] = [],
        public expansionList: string[] = [],
        public showExpansionList: boolean = false,
        public keepShow: boolean = false,
        public listWidth: number = 0
    ) { }
}
