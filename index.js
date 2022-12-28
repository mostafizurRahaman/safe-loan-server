const express = require('express'); 
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require("cors"); 
require('dotenv').config(); 
const jwt = require('jsonwebtoken'); 
const app = express(); 
const port = process.env.PORT || 5000; 




// jwt validation middleware : 

const  verifyJWT = (req, res, next) => {
   const authHeader = req.headers.authorization; 
   if(!authHeader){
      return res.status(401).send({message: "unauthorized access"})
   }

   const token = authHeader.split(' ')[1]; 
   console.log(token); 
   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(error, decoded){
      if(error){
         return res.status(403).send({message: 'forbidden access'});
      }
      req.decoded = decoded; 
      next(); 
   })
}

// function verifyJWT(req, res, next){
//    const authHeader = authorization.header; 
// }

// middleware here: 
app.use(express.json()); 
app.use(cors()); 

// database connect with server: 


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4nkvsmn.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
   try{
      const usersCollection = client.db('SafeLoan').collection('users'); 

      //create a jwt token : 
     app.get('/jwt', async(req, res) => {
         const email = req.query.email; 
         console.log(email); 
         const query = {email: email}; 
         const user = await usersCollection.findOne(query); 
         if(!user){
            return res.status(401).send({message: "unauthorized user"}); 
         }
         const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn: "7d"} )
         res.send({token : token}); 
     }); 
      
      // user post api is here: 
      app.post('/users', async(req, res)=>{
         const user = req.body;      
         const result = await usersCollection.insertOne(user); 
         res.send(result); 
      })
   }
   finally{

   }
}


run().catch(err => console.log(err)); 


app.get("/", (req, res)=>{
   res.send("safe loan server is running now"); 
})


app.listen(port, ()=>{
   console.log(`safe server is running on port ${port}`); 
})
