//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB",{useNewUrlParser: true});

const itemSchema= {
  name: String
};
const Item =mongoose.model("Item",itemSchema);

const listSchema={
  list: String,
  itemss: [itemSchema]
};
const List=mongoose.model("List",listSchema);

//default items for Today's list
const item1=new Item({
  name:"1st Task"
});
const item2=new Item({
  name:"2nd Task"
});
const item3=new Item({
  name:"3rd Task"
});
const defaultitems=[item1,item2,item3];

//home
app.get("/", function (req, res) {

  Item.find().then((result)=>{
    if(result.length==0){
    Item.insertMany(defaultitems);
    res.redirect("/");
  }
  res.render("list", { listTitle: "Today", newListItems: result });
});
});

app.post("/", function (req, res) {

  const item = req.body.newItem;
  const listtobeadded=req.body.list;
  
  const neww=new Item({
    name:item
  })
  if(listtobeadded==="Today"){
    neww.save();
    res.redirect("/");
  }
  else{
  List.findOne({list: listtobeadded},function(err,resu){
    if(!err){
      resu.itemss.push(neww);
      resu.save();
      res.redirect("/lists/"+listtobeadded);
    }
   });
  }
});

//custom
app.get("/lists/:customList",(req,res)=>{
  const listname=req.params.customList;

  List.findOne({list: listname},function(err,resu){
    if(!err){
      if(!resu){
        console.log("No"); 
        const listnew=new List({
          list: listname,
          itemss:[]
        });
        listnew.save();
        res.redirect("/lists/"+listname);
      }
      else{
        console.log("Yes");
        res.render("list",{listTitle: listname,newListItems:resu.itemss});
      }
    }
   });
});

//delete
app.post("/delete",(req,res)=>{
  const checkedId=req.body.boxx;
  const listname=req.body.listname;

  if(listname==="Today"){
    
    Item.findByIdAndDelete(checkedId).then((result)=>{});
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({list: listname},{$pull:{itemss:{_id:checkedId}}},(err,resu)=>{
      if(!err){
        res.redirect("/lists/"+listname);
      }
    });
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
