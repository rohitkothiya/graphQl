module.exports = (req, res, next) => {
      const authHeader = req.get('Authorization')
      console.log("authHeaders", authHeader)
      if (!authHeader) {
            req.isAuth = false

            return next()
      }

      const token = authHeader.split(' ')[1];//Authorizatiuon

      if (!token || token === "") {
            console.log("elses")
            req.isAuth = false
            next()
      }
      let decodedToken;
      try {
            decodedToken = jwt.verify(token, 'someanysuperscretkey')
            console.log("decoddeToken", decodedToken)
      } catch (err) {
            console.log("errs")
            req.isAuth = false
            return next()
      }
      if (!decodedToken) {
            req.isAuth = false
            return next()
      }

      req.isAuth = true
      req.userId = decodedToken.userId
      next()

}