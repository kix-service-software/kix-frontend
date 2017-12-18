import { IQuickSearch } from "@kix/core/dist/model/";

export class CustomerUserQuickSearch implements IQuickSearch {

    public constructor(
        public id: string,
        public name: string,
        public icon: string
    ) { }

}
