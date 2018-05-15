import { FormField, FormInputComponentState } from "@kix/core/dist/model";

export class ArticleInputBodyComponentState extends FormInputComponentState<string> {

    public constructor(
        public currentValue: string = null
    ) {
        super();
    }

}
