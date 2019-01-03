export class ConfirmOverlayContent {
    public constructor(
        public text: string,
        public confirmCallback: () => {} = null,
        public cancelCallback: () => {} = null,
        public buttonLabels: [string, string] = ['Ja', 'Nein']
    ) { }
}
