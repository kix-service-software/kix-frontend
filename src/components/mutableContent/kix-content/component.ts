class KIXContentComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            template: null,
            templatePath: input.template
        };
    }

    public onMount(): void {
        this.state.template = require(this.state.templatePath);
    }

}

module.exports = KIXContentComponent;
