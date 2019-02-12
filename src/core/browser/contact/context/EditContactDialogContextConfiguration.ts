import { ContextConfiguration } from '../../../model/components/context/ContextConfiguration';
import { EditContactDialogContext } from "./EditContactDialogContext";

export class EditContactDialogContextConfiguration extends ContextConfiguration {

    public constructor() {
        super(EditContactDialogContext.CONTEXT_ID, [], [], [], [], []);
    }

}
