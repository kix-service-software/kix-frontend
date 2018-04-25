import { FormField, FormInputComponentState } from "@kix/core/dist/model";

export class ArticleInputAttachmentComponentState extends FormInputComponentState {

    public constructor(
        public files: File[] = []
    ) {
        super();
    }
}
