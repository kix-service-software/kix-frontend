export default (userName: string) => {
    return {
        type: 'LOGIN_USERNAME_CHANGED',
        payload: new Promise((resolve, reject) => {
            resolve(
                {
                    userName
                }
            );
        })
    };
};
