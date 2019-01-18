export class ConfirmOverlayContent {
    public constructor(
        public text: string,
        public confirmCallback: () => void = null,
        public cancelCallback: () => void = null,
        public buttonLabels: [string, string] = ['Ja', 'Nein']
    ) { }
}
