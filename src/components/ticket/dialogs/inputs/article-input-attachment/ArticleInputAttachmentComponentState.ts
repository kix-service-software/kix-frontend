import { FormField, FormInputComponentState } from "@kix/core/dist/model";
import { Label } from "@kix/core/dist/browser/components";

export class ArticleInputAttachmentComponentState extends FormInputComponentState<any> {

    public constructor(
        public files: File[] = [],
        public dragging: boolean = false,
        public minimized: boolean = false,
        public labels: Label[] = []
    ) {
        super();
    }
}
