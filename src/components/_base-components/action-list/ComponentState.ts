import { IAction } from '@kix/core/dist/model';

export class ComponentState {

    public constructor(
        public actionList: IAction[] = [],
        public listDefault: IAction[] = [],
        public listExpansion: IAction[] = [],
        public showListExpansion: boolean = false,
        public keepShow: boolean = false,
        public displayText: boolean = true
    ) { }
}
