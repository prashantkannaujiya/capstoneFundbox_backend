var express=require('express');
var app=express();
var bodyParser=require('body-parser');
var cors=require('cors');
var MongoClient=require('mongodb').MongoClient;
var url='mongodb+srv://Prashant_Kannaujiya:Rajan$9935@cluster0.aweosln.mongodb.net/?retryWrites=true&w=majority';  
var jwt=require('jsonwebtoken')
app.set('views','./views');
app.use(cors());
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
var db;
const client = new MongoClient(url);
  async function run() {
    try {
      // Connect the client to the server	
      
      // Send a ping to confirm a successful connection
      db=client.db("login");
     // 
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
      
    } finally {
    }}
    run().catch(err=>console.log(err))
app.post("/Register",function(req,res){
console.log("Request is here")
            console.log(req.body);

        
            
            db.collection('fund').insertOne(req.body)
            .then((data)=>{console.log(data);res.send(data)})
            .catch(err=>console.log('error'))
        
    })


app.post("/Login",function(req,res){
   
        console.log(req.body);
       
            
           
            db.collection('fund').find({name:req.body.name}).toArray().then((data)=>{
console.log(data);
if(data.length!=0)
{
    if(data[0].password==req.body.password)
    {
        var token=jwt.sign(data[0].name,"Vishnu");
        res.send({message:'success',token,name:data[0].name});
    }
    else
    {
        res.send({message:'Wrong password'});
    }
    }

else{
    res.send([]);
}
            }
           )
          })
         


app.get('/auth/:token',(req,res)=>{
  var tken=req.params.token;
  console.log(tken);
try{
  var ds=jwt.verify(req.params.token,'Vishnu');
  res.send({message:'approved',data:ds});
 }
catch(err){
console.log(err);
res.send({message:'failed'});
}
})
app.post('/submitcampaign',(req,res)=>{
    console.log(req.body);

db.collection('fund').findOneAndUpdate({name:req.body.name},{$push:{campaign:req.body.campaign}}).then((data)=>{console.log(data);res.send(data);})})


app.get('/history/:user',(req,res)=>{
var user=req.params.user;
console.log(user)
    
    db.collection('fund').find({name:user}).toArray().then((data)=>{console.log(data);
    if(data.length==0)
    {
        res.send(data)
    }
    else if(data[0].hasOwnProperty('campaign'))
    {
        if(data[0].campaign.length==0)
        {
            res.send([])
        }
        else
        {
            res.send(data[0].campaign)
        }
    }
    else
    {
        res.send([])
    }
    })

})

app.get('/findAll/:cat',(req,res)=>{
    var k=req.params.cat;
    console.log(k);
        
        db.collection('fund').find({'campaign.category':k}).toArray().then((data)=>{
            var d=[];
            console.log(data)
            data.forEach((a)=>{
                for(var i=0;i<a.campaign.length;i++)
                {
                    if(a.campaign[i].category==k)
                    {
                        d.push(a.campaign[i]);
                    }
                }
            })
            res.send(d);
        }).catch(err=>console.log(err))
    })

app.get('/erase/:title', async(req,res)=>{
    var t=req.params.title;
        
        console.log(t)
        try{
            var s=await db.collection('fund').findOne({'campaign.title':t});
            //console.log(s);
             var z= await db.collection('fund').update({'campaign.title':t},{$pull:{campaign:{title:t}}})
            var ss=await db.collection('fund').find({name:s.name}).toArray();
           res.send(ss);
           console.log(ss);
        }
        catch(err){
            console.log(err);
            res.send({message:'err'})
        }
       
    })

app.get('/clear/:user',(req,res)=>{
  
    var user=req.params.user;
    console.log('delete campaigns of '+ user)
        
       
        db.collection('fund').updateOne({name:user}, {$unset: {campaign:''}} , {multi: false})
        .then((data)=>{
            console.log(data)
            res.send({message:'success'})
        })
        .catch(err=>{
            console.log(err)
            res.send({message:'error'})
        })

    })

app.get('/getData',async(req,res)=>{
    
    
    
        const a= await db.collection('fund').aggregate([{$project:{count:{$size:'$campaign'}}},{$group:{_id:'$null',count:{$sum:'$count'}}}]).toArray();
    console.log(a)
    res.send(a)
    })


app.get('/search/:token',async(req,res)=>{
    console.log(req.params.token)
        
        
        const a=await db.collection('fund').aggregate([{$unwind:'$campaign'},{$project:{_id:0,campaign:1}}]).toArray();
      
        await db.collection('searchText').deleteMany({});
      try{
        const w=await db.collection('searchText').insertMany(a);
        console.log(w)
      }
      catch(err){console.log(err)}
        await db.collection('searchText').createIndex({'campaign.title':'text','campaign.description':'text','campaign.category':'text'})
        
        db.collection('searchText').aggregate([{$match:{ $text: { $search: req.params.token } }}]).toArray().then((data)=>{
          console.log(data)
            res.send(data)
        })
        .catch(err=>console.log(err))
    })

    const port=process.env.PORT || 2100;
    app.listen(port,()=>{console.log('server runnning on 2100')})
