import { Article, IAction, WidgetComponentState, Ticket } from '../../../../core/model';

import { ArticleListSettings } from './ArticleListSettings';
import { ITable } from '../../../../core/browser';

export class ComponentState extends WidgetComponentState<ArticleListSettings> {

    public constructor(
        public instanceId: string = null,
        public table: ITable = null,
        public title: string = null,
        public attachmentCount: number = 0,
        public loading: boolean = true,
        public filterCount: number = null
    ) {
        super();
    }

}
