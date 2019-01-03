import { ContextConfiguration } from '../../../model/components/context/ContextConfiguration';
import { NewFAQArticleDialogContext } from './NewFAQArticleDialogContext';

export class NewFAQArticleDialogContextConfiguration extends ContextConfiguration {

    public constructor() {
        super(NewFAQArticleDialogContext.CONTEXT_ID, [], [], [], [], []);
    }

}
