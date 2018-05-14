import { FormField, FormInputComponentState } from "@kix/core/dist/model";

export class ArticleInputBodyComponentState extends FormInputComponentState {

    public constructor(
        public invalid: boolean = false
    ) {
        super();
    }

}
