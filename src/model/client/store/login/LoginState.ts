import { LoginSocketListener } from './../../socket/login/LoginSocketListener';

export class LoginState {

    public userName: string = "";
    public password: string = "";
    public valid: boolean = false;
    public error: any = null;
    public socketListener: LoginSocketListener = null;
    public doLogin: boolean = false;

}
