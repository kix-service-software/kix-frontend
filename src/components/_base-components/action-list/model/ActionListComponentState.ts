import { ConfiguredWidget, Ticket, Article } from '@kix/core/dist/model';

export class ActionListComponentState {

    public constructor(
        public actionList: string[] = [],
        public listDefault: string[] = [],
        public listExpansion: string[] = [],
        public showListExpansion: boolean = false,
        public keepShow: boolean = false,
        public listWidth: number = 0
    ) { }
}
