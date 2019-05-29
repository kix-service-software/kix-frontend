export class ImportConfigValue {

    public constructor(
        public key: string,
        public label: string,
        public value: string = key
    ) { }
}
