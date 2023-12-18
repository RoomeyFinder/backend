const express = require("express")
const path = require("path")
const cookieParser = require("cookie-parser")
const logger = require("morgan")
const globalErrorHandler = require("./middlewares/error")
const CustomError = require("./utils/error")
const indexRouter = require("./routes/index")
const usersRouter = require("./routes/users")
const dotenv = require("dotenv")
dotenv.config({
  path: path.resolve(__dirname, ".env"),
})
const app = express()
// /* */ Sessions not supported by hosting provider
// const session = require("express-session")
// const MongoDBStore = require("connect-mongodb-session")(session)
// const store = new MongoDBStore({
//   uri: process.env.CONNECTION_STRING.replace(
//     "<password>",
//     process.env.DB_PASSWORD
//   ),
//   collection: "sessions",
//   expires: 1000 * 60 * 60 * 24 * 30,
// })

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "pug")

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))
const cors = require("cors")
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:3000",
      "http://localhost:3002",
    ],
    credentials: true,
  })
)
// app.use(
//   session({
//     secret: process.env.JWT_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: process.env.NODE_ENV !== "dev",
//       maxAge: 1000 * 60 * 60 * 24 * 7,
//       httpOnly: true,
//       path: "/",
//     },
//     store: store,
//   })
// )

app.use("/", indexRouter)
app.use("/api/v1", indexRouter)
app.use("/api/v1/users", usersRouter)

app.all("*", (req, _, next) => {
  next(
    new CustomError(
      `CANNOT ${req.method} ${req.originalUrl} on this server!`,
      404
    )
  )
})
app.use(globalErrorHandler)

module.exports = app
