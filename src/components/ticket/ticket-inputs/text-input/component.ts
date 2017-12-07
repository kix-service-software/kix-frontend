export class TextInputComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            value: null
        };
    }

    public onInput(input: any): void {
        this.state.value = input.value;
    }

    private valueChanged(event: any): void {
        this.state.value = event.target.value;
        (this as any).emit('valueChanged', this.state.value);
    }
}

module.exports = TextInputComponent;
