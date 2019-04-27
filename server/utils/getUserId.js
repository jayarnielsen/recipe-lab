const { verify } = require('jsonwebtoken');

class AuthError extends Error {
  constructor() {
    super('Not authorized');
  }
}

module.exports = context => {
  const Authorization = context.request.get('Authorization');
  if (!Authorization) throw new AuthError();
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '');
    const verifiedToken = verify(token, process.env.APP_SECRET);
    return verifiedToken && verifiedToken.userId;
  }
};