const express = require('express'); 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(error, decoded){
      if(error){
         return res.status(403).send({message: 'forbidden access'});
      }
      req.decoded = decoded; 
      next(); 
   })
}





// middleware here: 
app.use(express.json()); 
app.use(cors()); 

// database connect with server:
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4nkvsmn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// database configuration function is here: 
async function run(){
   try{
      const usersCollection = client.db('SafeLoan').collection('users'); 
      const loansCollection = client.db('SafeLoan').collection('loans'); 

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


   // verifyAdmin : 
     const verifyAdmin = async(req, res, next) => {
         const email = req.decoded.email ; 
         const query = {email: email}; 
         const user = await usersCollection.findOne(query); 
         if(user?.role !== "admin"){
            return res.status(403).status({message: "forbidden access"}); 
         }
         next(); 
     }


   // verifyCuster : 
   const verifyCustomer = async(req, res, next) => {
      const email = req.decoded.email; 
      const query = {email:  email}; 
      const user = await usersCollection.findOne(query); 
      if(user?.role !== "customer"){
         return res.status(403).status({message: "forbidden  access"})
      }
      next(); 
   }
      
    // user post api is here: 
      app.post('/users', async(req, res)=>{
         const user = req.body;      
         const result = await usersCollection.insertOne(user); 
         res.send(result); 
      })


    //post customer loan application details : 
      app.post('/loans',verifyJWT, verifyCustomer,  async(req, res)=>{
         const loan = req.body ; 
         const result =await  loansCollection.insertOne(loan); 
         res.send(result); 
      })

   // create an get api for customer loans: 
   app.get('/loans',verifyJWT, verifyCustomer,  async(req,res)=>{
      const email = req.query.email; 
      const query = {email: email}; 
      const loans = await loansCollection.find(query).toArray(); 
      res.send(loans); 
   })

   // create a get api for all loans : 
   app.get('/admin/loans',verifyJWT, verifyAdmin, async(req, res)=>{
      const query ={}; 
      const loans = await loansCollection.find(query).toArray(); 
      res.send(loans); 
   })

   //create a update api for loan approval : 
   app.put('/loans/:id',verifyJWT,verifyAdmin,  async(req, res)=>{
      const id = req.params.id; 
      const query = {_id: ObjectId(id)}; 
      const updatedDoc = {
          $set: {
             status : "approved" 
          }
      }; 
      const options = {upsert: true}; 

      const result = await loansCollection.updateOne(query, updatedDoc, options); 
      res.send(result); 
   })

   // check isAdmin or not : 
   app.get('/users/admin/:email',verifyJWT , async(req,res)=>{
      const email = req.params.email; 
      const query = {email}; 
      const user = await usersCollection.findOne(query); 
      const isAdmin = user?.role === 'admin'; 
      res.send({isAdmin: isAdmin}); 
   })



   //check isCustomer or not : 
   app.get('/users/customer/:email',verifyJWT,  async(req, res)=>{
      const email = req.params.email; 
      const query = {email}; 
      const user = await usersCollection.findOne(query); 
      const isCustomer = user?.role ===  'customer'; 
      res.send({isCustomer: isCustomer}); 
   })

   // get api for all users : 
   app.get('/users',verifyJWT, verifyAdmin, async(req, res)=>{
      const query ={}; 
      const users = await usersCollection.find(query).toArray(); 
      res.send(users); 
   })

   // delete user : 
   app.delete('/users/:id',verifyJWT,  verifyAdmin, async(req, res)=>{
      const id = req.params.id; 
      const query = {_id: ObjectId(id)}; 
      const  user = await usersCollection.deleteOne(query); 
      res.send(user); 
   })


   //create user admin: 
   app.put('/users/:email',verifyJWT, verifyAdmin, async(req, res)=>{
      const email = req.params.email; 
      const query = {email: email};
      const updatedDoc = {
         $set: {
            role : "admin"
         }
      }
      const options = {upsert: true}; 
      const result  = await usersCollection.updateOne(query, updatedDoc, options);  
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
