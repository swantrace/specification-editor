import connectMongo from 'connect-mongo';
import { expressSession } from 'next-session';

import connectMongoose from './connectMongoose';

const prepareSessionOptions = async () => {
  const { mongooseConnection } = await connectMongoose();
  const MongoStore = connectMongo(expressSession);
  return {
    cookie: {
      maxAge: parseInt(process.env.SHOPIFY_APP_SESSION_COOKIE_MAXAGE, 10),
      secure: true,
      sameSite: 'None'
    },
    store: new MongoStore({ mongooseConnection })
  };
};

export default prepareSessionOptions;
