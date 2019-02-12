import { ObjectIcon, Attachment, ConfigItemAttachment } from "../../kix";

export class LabelValueGroup {

    public constructor(
        public label: string,
        public value: string,
        public icon: string | ObjectIcon = null,
        public secondaryIcon: string | ObjectIcon = null,
        public sub: LabelValueGroup[] = null,
        public attachment?: Attachment | ConfigItemAttachment
    ) { }

}
