const express = require('express');
const admin = require("firebase-admin");
const cors = require("cors");
const bodyParser = require ("body-parser")
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://roombooking:roompassword@cluster0.ka9ky.mongodb.net/room?retryWrites=true&w=majority";



var serviceAccount = require("./room-booking-c2920-firebase-adminsdk-9jz0w-2b4f32331a.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://room.firebaseio.com'
});

const app = express()
app.use(cors())
app.use(bodyParser.json())

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("room").collection("booked");
  console.log("coonected succesfully")
  app.post("/roomBook",(req,res)=>{
      const bookingRoom = req.body;
      collection.insertOne(bookingRoom)
      .then(function(result) {
        res.send( result.insertedCount > 0 )
        res.redirect("/");
      }) 
      console.log(bookingRoom);
  })

  app.get('/bookingsData', (req, res) => {
    const bearer = req.headers.authoraization;
    if(bearer && bearer.startsWith("Bearer "))
    {
      const idToken = bearer.split(" ")[1];
      console.log({idToken});
      admin.auth().verifyIdToken(idToken)
      .then((decodedToken) => {
        const tokenEmail = decodedToken.email;
        console.log({tokenEmail});
        if(tokenEmail == req.query.email)
        {
          collection.find({email: req.query.email})
          .toArray(( err , documents) => {
              res.send(documents)
          })
        }
        
      })
      .catch((error) => {
        // Handle error
      });
    }
  })



});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(4200,console.log(`runnig the server port 4200`))