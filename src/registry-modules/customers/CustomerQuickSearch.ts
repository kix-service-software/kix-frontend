import { IQuickSearch } from "@kix/core/dist/model/";

export class CustomerQuickSearch implements IQuickSearch {

    public constructor(
        public id: string,
        public name: string,
        public icon: string,
        public objectComponent: string,
        public objectIdProperty: string,
        public displayProperties: string[]
    ) { }

}
