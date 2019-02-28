import { ContextConfiguration } from '../../../model/components/context/ContextConfiguration';
import { ImportDialogContext } from './ImportDialogContext';

export class ImportDialogContextConfiguration extends ContextConfiguration {

    public constructor() {
        super(ImportDialogContext.CONTEXT_ID, [], [], [], [], []);
    }

}
