import { ObjectIcon, Attachment } from "../../kix";

export class TableTreeNodeLabel {

    public constructor(
        public label: string,
        public icon: string | ObjectIcon = null,
        public secondaryIcon: string | ObjectIcon = null,
        public attachment?: Attachment
    ) { }

}
