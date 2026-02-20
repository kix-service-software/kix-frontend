import { AuthenticationService } from "../../../../../server/services/AuthenticationService";

const token = AuthenticationService.getInstance().createToken('test', 'test');
const cookies = {
    session: token
};

export { token, cookies };