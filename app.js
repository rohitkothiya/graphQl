const express = require('express');
const bodyParser = require('body-parser');
const port = 3010
const mongoose = require("mongoose");
const app = express();

require('./db/mongoose')
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql')

const Event = require("./models/event")



app.use(bodyParser.json())



const dbConnectionUri = "mongodb://rohitk:rohitk416@ds051831.mlab.com:51831/user-manager";
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

connectWithRetry();
app.use('/graphql', graphqlHttp({
      schema: buildSchema(`
      type Event {
            _id: ID!
            title : String!
            description : String!
            price : Float!
            date : String!
      }

      input EventInput {
            title : String!
            description  :String!
            price:Float!
            date : String!
            
      }
      type RootQuery {
           events: [Event!]!
      }
      type RootMutation {
       createEvent(eventInput : EventInput): Event
      }
      schema {
            query : RootQuery
            mutation : RootMutation
      }
      `),
      rootValue: {
            events: () => {
                  return Event.find().then(events => {
                        return events.map(event => {
                              return { ...event._doc }
                        })
                  }).catch(error => {
                        throw error

                  })
            },
            createEvent: (args) => {

                  const event = new Event({
                        title: args.eventInput.title,
                        description: args.eventInput.description,
                        price: +args.eventInput.price,
                        date: new Date(args.eventInput.date)
                  })

                  event.save().then(result => {
                        console.log(result);
                        return { ...result._doc }
                  }).catch(err => {
                        console.log(err)
                        throw err
                  });

                  return event
            }

      },
      graphiql: true

}))



app.get("/", (req, res, next) => {
      res.send("Hello world")
})
app.listen(port, () => {
      console.log(`Server is runnig on ${port}`)
})