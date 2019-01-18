import { ContextConfiguration } from '../../../model/components/context/ContextConfiguration';
import { NewConfigItemDialogContext } from './NewConfigItemDialogContext';

export class NewConfigItemDialogContextConfiguration extends ContextConfiguration {

    public constructor() {
        super(NewConfigItemDialogContext.CONTEXT_ID, [], [], [], [], []);
    }

}
