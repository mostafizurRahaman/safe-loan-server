const express = require('express'); 
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require("cors"); 
require('dotenv').config(); 
const jwt = require('jsonwebtoken'); 
const app = express(); 
const port = process.env.PORT || 5000; 


// middleware here: 
app.use(express.json()); 
app.use(cors()); 

// database connect with server: 


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4nkvsmn.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
   try{

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
