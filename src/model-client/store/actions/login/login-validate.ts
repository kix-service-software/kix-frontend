export default (userName: string, password: string) => {
    return {
        type: 'LOGIN_VALIDATE',
        payload: new Promise((resolve, reject) => {
            const valid = (userName !== undefined && userName !== null && userName !== "") &&
                (password !== undefined && password !== null && password !== "");
            resolve(
                {
                    valid
                }
            );
        })
    };
};
