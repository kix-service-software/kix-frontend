export class CommunicatorResponse<T> {

    public constructor(
        public event: string,
        public data?: T
    ) { }
}
