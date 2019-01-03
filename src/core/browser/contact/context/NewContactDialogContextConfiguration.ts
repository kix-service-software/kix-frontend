import { ContextConfiguration } from '../../../model/components/context/ContextConfiguration';
import { NewContactDialogContext } from "./NewContactDialogContext";

export class NewContactDialogContextConfiguration extends ContextConfiguration {

    public constructor() {
        super(NewContactDialogContext.CONTEXT_ID, [], [], [], [], []);
    }

}
