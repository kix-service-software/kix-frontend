import { CreateContact } from './CreateContact';

export class CreateContactRequest {

    public constructor(
        public SourceID: string, public Contact: CreateContact
    ) { }

}
