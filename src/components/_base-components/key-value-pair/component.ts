class KeyValuePairComponent {

    private state: any;

    public onCreate(): any {
        this.state = {
            showKey: true,
            showInfo: true,
            showValue: true
        };
    }

    public onInput(input: any): void {
        this.state.showKey = input.showKey !== undefined ? input.showKey : true;
        this.state.showInfo = input.showInfo !== undefined ? input.showInfo : true;
        this.state.showValue = input.showValue !== undefined ? input.showValue : true;
    }

}

module.exports = KeyValuePairComponent;
