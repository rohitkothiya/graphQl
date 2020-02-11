const express = require('express');
const bodyParser = require('body-parser');
const port = 3010
const mongoose = require("mongoose");
const app = express();

require('./db/mongoose')
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql')
const bcrypt = require("bcryptjs")
const Event = require("./models/event")
const User = require("./models/user")


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
       type User {
          _id :  ID!
          email:String!
          password  :String 
       }
      input EventInput {
            title : String!
            description  :String!
            price:Float!
            date : String!
            
      }
      input UserInput {
            email : String!
            password  :String!
      }
      type RootQuery {
           events: [Event!]!
      }
      type RootMutation {
       createEvent(eventInput : EventInput): Event
       createUser(userInput : UserInput) : User
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
                        date: new Date(args.eventInput.date),
                        creator: "5e429c51f2809c392f8a5be4"
                  })
                  let createdEvent;
                  return event
                        .save()
                        .then(result => {
                              createdEvent = { ...result._doc }
                              return User.findById('5e429c51f2809c392f8a5be4')
                        })
                        .then(user => {
                              if (!user) {
                                    throw new Error('User not found')
                              }
                              user.createdEvents.push(event)
                              return user.save()
                        })

                        .then(result => {
                              return createdEvent;

                        }).catch(err => {
                              console.log(err)
                              throw err
                        });


            },

            createUser: args => {

                  return User.findOne({ email: args.userInput.email })
                        .then(user => {
                              if (user) {
                                    throw new Error('User exists already.')
                              }
                              return bcrypt.hash(args.userInput.password, 12)
                        })
                        .then(hashPassword => {
                              const user = new User({
                                    email: args.userInput.email,
                                    password: hashPassword
                              })
                              return user.save();
                        })
                        .then(result => {
                              return { ...result._doc }
                        })
                        .catch(err => {
                              console.log(err)
                        })

            }

      },
      graphiql: true

}))



app.get("/", (req, res, next) => {
      res.send("Hello worlds")
})
app.listen(port, () => {
      console.log(`Server is runnig on ${port}`)
})