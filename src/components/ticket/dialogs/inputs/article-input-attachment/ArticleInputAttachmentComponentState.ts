import { FormField, FormInputComponentState, Label } from "@kix/core/dist/model";

export class ArticleInputAttachmentComponentState extends FormInputComponentState {

    public constructor(
        public files: File[] = [],
        public dragging: boolean = false,
        public minimized: boolean = false,
        public labels: Label[] = []
    ) {
        super();
    }
}
