import { ClientStorageHandler } from "@kix/core/dist/browser/ClientStorageHandler";

class KIXHeaderComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    private logout(): void {
        ClientStorageHandler.destroyToken();
    }

}

module.exports = KIXHeaderComponent;
