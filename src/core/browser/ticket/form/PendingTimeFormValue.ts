export class PendingTimeFormValue {

    public constructor(
        public stateId: number,
        public pending: boolean = false,
        public pendingDate: Date = null,
    ) { }

}
