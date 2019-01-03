import { ContextConfiguration } from '../../../model/components/context/ContextConfiguration';
import { EditLinkedObjectsDialogContext } from './EditLinkedObjectsDialogContext';

export class EditLinkedObjectsDialogContextConfiguration extends ContextConfiguration {

    public constructor() {
        super(EditLinkedObjectsDialogContext.CONTEXT_ID, [], [], [], [], []);
    }

}
