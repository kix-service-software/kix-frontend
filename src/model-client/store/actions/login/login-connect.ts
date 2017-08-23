export default (frontendSocketUrl: string) => {
    return {
        type: 'LOGIN_CONNECT',
        payload: new Promise((resolve, reject) => {
            resolve(
                {
                    socket: io.connect(frontendSocketUrl + "/authentication", {})
                }
            );
        })
    };
};
