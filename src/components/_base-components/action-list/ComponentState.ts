import { ConfiguredWidget, Ticket, Article, AbstractAction } from '@kix/core/dist/model';

export class ComponentState {

    public constructor(
        public actionList: AbstractAction[] = [],
        public listDefault: AbstractAction[] = [],
        public listExpansion: AbstractAction[] = [],
        public showListExpansion: boolean = false,
        public keepShow: boolean = false
    ) { }
}
