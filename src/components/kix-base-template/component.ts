declare var io;

class BaseTemplateComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    public onMount(): void {
        const token = window.localStorage.getItem('token');
        if (!token) {
            window.location.replace('/auth');
        }
    }
}

module.exports = BaseTemplateComponent;
