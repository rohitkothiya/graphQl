const mongoose = require('mongoose')

mongoose.connect("mongodb://rohitk:rohitk416@ds051831.mlab.com:51831/user-manager", {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
})