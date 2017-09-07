class WidgetComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            configurationMode: false,
            widget: input.widget
        };
    }

    public onInput(input: any): void {
        this.state.configurationMode = input.configurationMode;
    }

    public configClicked(): void {
        alert('Configure Widget ' + this.state.widget.title);
    }
}

module.exports = WidgetComponent;
