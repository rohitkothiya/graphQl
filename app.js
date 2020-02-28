const express = require("express");
const bodyParser = require("body-parser");
const port = 3010;
const mongoose = require("mongoose");
const app = express();
const isAuth = require("./middleware/is-auth");
const graphQlSchema = require("./graphql/schema/index");
const graphQlResolvers = require("./graphql/resolvers/index");

require("./db/mongoose");
const graphqlHttp = require("express-graphql");

app.use(bodyParser.json());

app.use(isAuth);

const dbConnectionUri =
  "mongodb://rohitk:rohitk416@ds051831.mlab.com:51831/user-manager";
const options = {
  useNewUrlParser: true,
  autoIndex: false, // Don't build indexes
  reconnectTries: 30, // Retry up to 30 times
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  useUnifiedTopology: true
};

const connectWithRetry = () => {
  mongoose
    .connect(dbConnectionUri, options)
    .then(() => {
      console.log("MongoDB is connected");
    })
    .catch(err => {
      console.log(
        "MongoDB connection unsuccessful, retry after 5 seconds. " + err
      );
      setTimeout(connectWithRetry, 5000);
    });
};

const events = eventIds => {
  return Event.find({ _id: { $in: eventIds } })
    .then(events => {
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          creator: user.bind(this, event.creator)
        };
      });
    })
    .catch(err => {
      throw err;
    });
};
const user = userId => {
  return User.findById(userId)
    .then(user => {
      return {
        ...user._doc,
        _id: user.id,
        createdEvents: events.bind(this, user._doc.createdEvents)
      };
    })
    .catch(err => {
      throw err;
    });
};

connectWithRetry();
app.use(
  "/graphql",
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
  })
);

app.get("/", (req, res, next) => {
  res.send("Hello worlds");
});
app.listen(port, () => {
  console.log(`Server is runnig on ${port}`);
});
