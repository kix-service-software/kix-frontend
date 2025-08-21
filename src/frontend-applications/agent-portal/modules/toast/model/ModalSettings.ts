export class ModalSettings {

    public constructor(
        public confirmCallback: () => void = null,
        public cancelCallback: () => void = null,
        public title: string = 'Sure?',
        public confirmText: string,
        public okLabel: string = 'OK',
        public cancelLabel: string = 'Cancel',
        public decisionPreference?: string,
        public decisionTitle?: string
    ) { }

}
