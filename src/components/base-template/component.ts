declare var io;

class BaseTemplateComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            frontendUrl: input.frontendUrl
        };
    }

    public onMount(): void {
        const token = window.localStorage.getItem('token');
        if (!token) {
            window.location.replace(this.state.frontendUrl + '/auth');
        }
    }
}

module.exports = BaseTemplateComponent;
