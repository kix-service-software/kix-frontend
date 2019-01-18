export class Error {

    public constructor(
        public Code: string,
        public Message: string,
        public StatusCode: number = null
    ) { }

}
