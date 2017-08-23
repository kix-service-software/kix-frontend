export default (userName: string, password: string) => {
    return {
        type: 'LOGIN_AUTH',
        payload: new Promise((resolve, reject) => {
            resolve(
                {
                    userName,
                    password
                }
            );
        })
    };
};
