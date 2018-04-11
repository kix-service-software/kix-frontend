import { Formular } from "@kix/core/dist/model";

export class FormularComponentState {

    public constructor(
        public formularId: string = null,
        public formular: Formular = null
    ) { }

}
