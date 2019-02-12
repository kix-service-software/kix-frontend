export class AutoCompleteConfiguration {

    public constructor(
        public limit: number = 10,
        public delay: number = 1000,
        public charCount: number = 3,
        public noResultsObjectName: string = 'Objekte'
    ) { }

}
