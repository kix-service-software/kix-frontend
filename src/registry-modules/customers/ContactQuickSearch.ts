import { IQuickSearch } from "@kix/core/dist/model/";

export class ContactQuickSearch implements IQuickSearch {

    public constructor(
        public id: string,
        public name: string,
        public icon: string
    ) { }

}
