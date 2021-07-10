
const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded());
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-mkaan:admin-1234@cluster0.pb5fb.mongodb.net/todolistDB", {useNewUrlParser: true,useUnifiedTopology: true,useCreateIndex: true, useFindAndModify: false});

const itemsSchema = {name: String};

const listSchema = {name: String, items: [itemsSchema]};

const Item = mongoose.model("Item",itemsSchema);

const List = mongoose.model("List",listSchema);

const item1 = new Item({
  name: "Welcome to your To Do List."
});

const item2 = new Item({
  name: "Hit the '+' button to add new item."
});

const item3 = new Item({
  name: "Hit <-- this to delete an item."
});

const defaultItems = [item1,item2,item3];

app.get("/", function(req, res) {

  Item.find({}, function(err,foundItems) {

    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Default items succesfuly saved to todolistDB.");
        }
      });
      res.redirect("/");
    }else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const checkedPages = req.body.checkedPages;

  if(checkedPages === "Today"){
    Item.findByIdAndDelete(checkedItemId,function(err){
      if(!err){
        res.redirect("/");
      }
    });
  }else {
    List.findOneAndUpdate({name: checkedPages},{$pull: {items: {_id: checkedItemId}}}, function(err,results){
      if(!err){
        res.redirect("/" + checkedPages);
      }
    });
  }


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({name: itemName});

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err,results){
      results.items.push(item);
      results.save();
      res.redirect("/" + listName);
    });
  }

});

app.get("/:customListName", function(req,res) {

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err,results){
    if(!err){
      if(!results){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }else{
        res.render("list",{listTitle: results.name, newListItems: results.items});
      }
    }
  });

});

app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port 3000");
});
