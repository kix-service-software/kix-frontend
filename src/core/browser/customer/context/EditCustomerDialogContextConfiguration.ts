import { ContextConfiguration } from '../../../model/components/context/ContextConfiguration';
import { EditCustomerDialogContext } from "./EditCustomerDialogContext";

export class EditCustomerDialogContextConfiguration extends ContextConfiguration {

    public constructor() {
        super(EditCustomerDialogContext.CONTEXT_ID, [], [], [], [], []);
    }

}
