import { IServerConfiguration } from './../model/configuration/IServerConfiguration';
import { IHTTPService } from './IHTTPService';

export class HTTPService implements IHTTPService {

    private axios: any;

    private apiURL: string;

    public constructor() {
        const serverConfig: IServerConfiguration = require('../../server.config.json');
        this.apiURL = serverConfig.BACKEND_API_URL;
        this.axios = require('axios');
    }

    public async get(resource: string, parameters: any = {}): Promise<any> {
        return await new Promise<any>((resolve, reject) => {
            this.axios.get(`${this.apiURL}/${resource}`, { params: parameters })
                .then((response: any) => {
                    resolve(response.data);
                }).catch((err) => {
                    reject(err);
                });
        });
    }

}
