declare var io;

class BaseTemplateComponent {

    public state: any;

    public frontendSocketUrl: string;

    public onCreate(input: any): void {
        this.state = {};
        this.frontendSocketUrl = input.frontendSocketUrl;
    }

    public onMount(): void {
        const token = window.localStorage.getItem('token');
        if (!token) {
            window.location.replace('/auth');
        } else {
            const configurationSocket = io.connect(this.frontendSocketUrl + "/configuration", {
                query: "Token=" + token
            });

            configurationSocket.on('error', (error) => {
                window.location.replace('/auth');
            });
        }
    }
}

module.exports = BaseTemplateComponent;
