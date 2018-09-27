import { ObjectIcon } from "@kix/core/dist/model";

export class ToolbarAction {

    public constructor(
        public icon: string | ObjectIcon,
        public title: string,
        public infoIcon: boolean,
        public count: number,
        public actionId: string,
        public actionData: any
    ) { }

}
