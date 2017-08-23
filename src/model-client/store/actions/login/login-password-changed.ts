export default (password: string) => {
    return {
        type: 'LOGIN_PASSWORD_CHANGED',
        payload: new Promise((resolve, reject) => {
            resolve(
                {
                    password
                }
            );
        })
    };
};
