const jwt = require('jsonwebtoken');


async function verifyToken(request, response, next) {
    //Auth header value = > send token into header

    const bearerHeader = request.headers['authorization'];
    //check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {

        //split the space at the bearer
        const bearer = bearerHeader.split(' ');
        //Get token from string
        const bearerToken = bearer[1];
        //set the token
        request.token = bearerToken;

        await jwt.verify(bearerToken, constant.SECRETKEY, (err, authData) => {
            if (err)
            
                response.sendStatus(403);
            else {
                request.user = authData
            }
        })


        //next middleweare
        next();

    } else {
        //Fobidden
        response.sendStatus(403);
    }

}

module.exports ={verifyToken}