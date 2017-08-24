export default (error: string) => {
    return {
        type: 'LOGIN_ERROR',
        payload: new Promise((resolve, reject) => {
            resolve(
                {
                    error
                }
            );
        })
    };
};
