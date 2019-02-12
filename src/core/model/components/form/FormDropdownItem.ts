import { ObjectIcon, KIXObject } from "../..";

export class FormDropdownItem<T = any> {

    public constructor(
        public id: string | number,
        public icon: string | ObjectIcon,
        public label: string,
        public secondaryIcon?: string | ObjectIcon,
        public object: T = null
    ) { }

}
