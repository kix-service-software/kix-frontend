import { ConfiguredWidget } from "../../../model";
import { ContextConfiguration } from '../../../model/components/context/ContextConfiguration';
import { NewCustomerDialogContext } from "./NewCustomerDialogContext";

export class NewCustomerDialogContextConfiguration extends ContextConfiguration {

    public constructor() {
        super(NewCustomerDialogContext.CONTEXT_ID, [], [], [], [], []);
    }

}
