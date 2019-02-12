import { ContextConfiguration } from '../../../model/components/context/ContextConfiguration';
import { BulkDialogContext } from './BulkDialogContext';

export class BulkDialogContextConfiguration extends ContextConfiguration {

    public constructor() {
        super(BulkDialogContext.CONTEXT_ID, [], [], [], [], []);
    }

}
