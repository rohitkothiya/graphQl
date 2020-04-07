module.exports = (req, res, next) => {
      const authHeader = req.get('Authorization')
      console.log("authfheader", authHeader)
      if (!authHeader) {
            req.isAuth = false

            return next()
      }

      const token = authHeader.split(' ')[1];//Authorizatiuon

      if (!token || token === "") {
            console.log("elsse")
            req.isAuth = false
            next()
      }
      let decodedToken;
      try {
            decodedToken = jwt.verify(token, 'somesuperscretkey')
            console.log("decodedToken", decodedToken)
      } catch (err) {
            console.log("exddrer")
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