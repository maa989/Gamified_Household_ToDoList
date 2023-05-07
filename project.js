// connect to MongoDB server
const fs = require('fs');
const {MongoClient, ObjectId} = require('mongodb');
const express = require('express');
//const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
//const ObjectID = require('mongodb').ObjectID;
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', 'C:/USC/EE547/Project/views');

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

let myData;
let refresh = false;

class householdToDoList{
    //setup db
    constructor(){
        this.config = {
            "host": "127.0.0.1",
            "port": "27017",
            "db": "householdToDoList",
            "opts": {
                "useUnifiedTopology": true
            }
        };
        
        this.url = `mongodb://${this.config.host}:${this.config.port}`;
        this.client = new MongoClient(this.url, this.config.opts);
        
        this.users_C = 'users';
        this.tasks_C = 'tasks';
        this.rewards_C = 'rewards';
        this.notifications_C = 'notifications';
    }
    
    //////////////////  User Methods ////////////////////////////////
    //fetch users in a household
    async getUsers(householdID_query){
        let connect;
        let result;
        let query

        try {
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            const data = await db.collection(this.users_C).find(householdID_query).toArray();
            result = data;
        } catch (error) {
            console.log(error)
            throw new Error("Error fetching users");
          }
          finally {
            if (connect) connect.close();
        }
        return result
    }
    
    //fetch user by ID
    async getUser(UserID){
        let connect;
        let result;
        let query

        try {
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            const data = await db.collection(this.users_C).findOne({ "_id": new ObjectId(UserID) })
            result = data;
        } catch (error) {
            console.log(error)
            throw new Error("Error fetching User");
          }
          finally {
            if (connect) connect.close();
        }
        return result
    }
    
    //create new user/household
    async signUp(first_name,last_name,email,password){
        let connect;
        let result;
        
        const newUser = {
          "email": email,
          "password": password,
          "firstName": first_name,
          "lastName": last_name,
          "householdId": new ObjectId().toString(),
          "points": 0,
          "isTaskManager": true
        };

        try{
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            result = await db.collection(this.users_C).insertOne(newUser)
        } catch (error) {
            console.log(error)
            throw new Error("Signup error");
          }
          finally {
            if (connect) connect.close();
        }

        return result.insertedId.toString()
    }
    
    //create new user
    async addUser(first_name,last_name,email,password,householdId,isTaskManager){
        let connect;
        let result;
        
        const newUser = {
          "email": email,
          "password": password,
          "firstName": first_name,
          "lastName": last_name,
          "householdId": householdId,
          "points": 0,
          "isTaskManager": isTaskManager
        };

        try{
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            result = await db.collection(this.users_C).insertOne(newUser)
        } catch (error) {
            console.log(error)
            throw new Error("New user error");
          }
          finally {
            if (connect) connect.close();
        }

        return result.insertedId.toString()
    }
    
    //update user
    async updateUser(userId,first_name,last_name,email,password,householdId,isTaskManager,points){
        let connect;
        let result;
        
        const updatedUser = {
          "email": email,
          "password": password,
          "firstName": first_name,
          "lastName": last_name,
          "householdId": householdId,
          "points": Number(points),
          "isTaskManager": isTaskManager
        };
       
       const filter = {_id: new ObjectId(userId)};;

        try{
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            result = await db.collection(this.users_C).findOneAndUpdate(filter,{ $set: updatedUser })
            
        } catch (error) {
            console.log(error)
            throw new Error("Update user error");
          }
          finally {
            if (connect) connect.close();
        }
        //console.log(updatedUser)
        return "Successfully updated user"
    }
    
    //delete user
    async deleteUser(userId){

        let connect;
        let result;

        try{
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            const filter = {_id: new ObjectId(userId)};
            result = await db.collection(this.users_C).deleteOne(filter);
            if (!result || result.deletedCount === 0) {
                throw new Error("Unable To delete user");
            }

        } catch(error){
            throw new Error("Unable To delete user");            
        } finally{
            if(connect) connect.close();
        }
        return "Successfully deleted user"
    }
    
    async getUserID(first_name,last_name,householdId,email,login){
        let connect;
        let result;
    
        try{
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            
            if(login){
                const data = await db.collection(this.users_C).findOne({"email": email});
                result = data;
                //console.log(data);
            } else{
                const data = await db.collection(this.users_C).findOne({
                  "firstName": first_name,
                  "lastName": last_name,
                  "householdId": householdId,
                });
                 result = data;
            }           
      
        } catch(error){
            throw new Error("Unable To get userid");            
        } finally{
            if(connect) connect.close();
        }
        return result
    }
    
    async userLogin(userId, password){
        let result
        const user =  await axios(`http://localhost:3000/api/user/${userId}`);
        if (user.data.password === password){
            result= user.data;
        }
        else{
            throw new Error("Wrong password");
        }
        return result
    }
    
    
    
    
    ///////////// Task Methods ///////////////
    //fetch tasks in a household
    async getTasks(householdID_query){
        let connect;
        let result;
        let query

        try {
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            const data = await db.collection(this.tasks_C).find(householdID_query).toArray();
            result = data;
        } catch (error) {
            console.log(error)
            throw new Error("Error fetching users");
          }
          finally {
            if (connect) connect.close();
        }
        return result
    }
    
    //fetch task by ID
    async getTask(TaskID){
        let connect;
        let result;
        let query

        try {
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            const data = await db.collection(this.tasks_C).findOne({ "_id": new ObjectId(TaskID) })
            result = data;
        } catch (error) {
            console.log(error)
            throw new Error("Error fetching Task");
          }
          finally {
            if (connect) connect.close();
        }
        return result
    }
    
    //create new task
    async createTask(name,assigneeId,dueDate,priority,householdId,isRecurring,daysRecurring,created_at){
        let connect;
        let result;
        //console.log(dueDate)
        if(isRecurring){
            dueDate = new Date();
            dueDate.setDate(created_at.getDate() + daysRecurring);
        }
        //console.log(dueDate)
        const newTask = {
          "name": name,
          "assigneeId": assigneeId,
          "dueDate": dueDate,
          "priority": priority,
          "householdId": householdId,
          "completed": false,
          "completionDate": null,
          "isRecurring": isRecurring,
          "daysRecurring": daysRecurring,
          "created_at": created_at
        };

        try{
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            result = await db.collection(this.tasks_C).insertOne(newTask)
        } catch (error) {
            console.log(error)
            throw new Error("New task error");
          }
          finally {
            if (connect) connect.close();
        }

        return result.insertedId.toString()
    }
    
    //update task
    async updateTask(taskId,name,assigneeId,dueDate,priority,householdId,completed,completionDate,isRecurring,daysRecurring,created_at){
        let connect;
        let result;
        
        const updatedUser = {
          "name": name,
          "assigneeId": assigneeId,
          "dueDate": dueDate,
          "priority": priority,
          "householdId": householdId,
          "completed": completed,
          "completionDate": completionDate,
          "isRecurring": isRecurring,
          "daysRecurring": daysRecurring,
          "created_at": created_at
        };
        
       const filter = {_id: new ObjectId(taskId)};;

        try{
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            result = await db.collection(this.tasks_C).findOneAndUpdate(filter,{ $set: updatedUser })
        } catch (error) {
            console.log(error)
            throw new Error("Update task error");
          }
          finally {
            if (connect) connect.close();
        }

        return "Successfully updated task"
    }
    
    //delete task
    async deleteTask(taskId){

        let connect;
        let result;

        try{
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            const filter = {_id: new ObjectId(taskId)};
            result = await db.collection(this.tasks_C).deleteOne(filter);
            if (!result || result.deletedCount === 0) {
                throw new Error("Unable To delete task");
            }

        } catch(error){
            throw new Error("Unable To delete task");            
        } finally{
            if(connect) connect.close();
        }
        return "Successfully deleted task"
    }
    
    
    ////////////////REWARDS///////////////////
    //fetch all rewards in household
    async getRewards(householdID_query){
        let connect;
        let result;
        let query

        try {
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            const data = await db.collection(this.rewards_C).find(householdID_query).toArray();
            result = data;
        } catch (error) {
            console.log(error)
            throw new Error("Error fetching rewards");
          }
          finally {
            if (connect) connect.close();
        }
        return result
    }
    
    //fetch reward by ID
    async getReward(RewardID){
        let connect;
        let result;
        let query

        try {
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            const data = await db.collection(this.rewards_C).findOne({ "_id": new ObjectId(RewardID) })
            result = data;
        } catch (error) {
            console.log(error)
            throw new Error("Error fetching reward");
          }
          finally {
            if (connect) connect.close();
        }
        return result
    }
    
    //create new reward
    async createReward(name,points,householdId){
        let connect;
        let result;
        
        const newReward = {
          "name": name,
          "points": points,
          "householdId": householdId
        };
    
        try{
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            result = await db.collection(this.rewards_C).insertOne(newReward)
        } catch (error) {
            console.log(error)
            throw new Error("New reward error");
          }
          finally {
            if (connect) connect.close();
        }
    
        return result.insertedId.toString()
    }
    
    //update reward
    async updateReward(rewardId,name,points,householdId){
        let connect;
        let result;
        
        const updatedReward = {
          "name": name,
          "points": points,
          "householdId": householdId
        };
        
       const filter = {_id: new ObjectId(rewardId)};;

        try{
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            result = await db.collection(this.rewards_C).findOneAndUpdate(filter,{ $set: updatedReward })
        } catch (error) {
            console.log(error)
            throw new Error("Update reward error");
          }
          finally {
            if (connect) connect.close();
        }

        return "Successfully updated reward"
    }
    
    //delete reward
    async deleteReward(rewardId){

        let connect;
        let result;

        try{
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            const filter = {_id: new ObjectId(rewardId)};
            result = await db.collection(this.rewards_C).deleteOne(filter);
            if (!result || result.deletedCount === 0) {
                throw new Error("Unable To delete reward");
            }

        } catch(error){
            throw new Error("Unable To delete reward");            
        } finally{
            if(connect) connect.close();
        }
        return "Successfully deleted reward"
    }
    
    
    ///////////// NOTIFICATIONS //////////////
    //fetch all user notifications
    async getNotifications(userID_query){
        let connect;
        let result;
        let query

        try {
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            const data = await db.collection(this.notifications_C).find(userID_query).toArray();
            result = data;
        } catch (error) {
            console.log(error)
            throw new Error("Error fetching notifications");
          }
          finally {
            if (connect) connect.close();
        }
        return result
    }
    
    //fetch reward by ID
    async getNotification(NotificationID){
        let connect;
        let result;
        let query

        try {
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            const data = await db.collection(this.notifications_C).findOne({ "_id": new ObjectId(NotificationID) })
            result = data;
        } catch (error) {
            console.log(error)
            throw new Error("Error fetching notification");
          }
          finally {
            if (connect) connect.close();
        }
        return result
    }
    
    //create new reward
    async createNotification(title,description,userId){
        let connect;
        let result;
        
        const newNotification = {
          "title": title,
          "description": description,
          "createdAt": new Date(),
          "userId": userId,
          "isRead": false
        };
    
        try{
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            result = await db.collection(this.notifications_C).insertOne(newNotification)
        } catch (error) {
            console.log(error)
            throw new Error("New notification error");
          }
          finally {
            if (connect) connect.close();
        }
    
        return result.insertedId.toString()
    }
    
    //mark notification as read
    async notificationRead(notificationId,updatedNotification){
        let connect;
        let result;
        
       const filter = {_id: new ObjectId(notificationId)};;
       delete updatedNotification._id
        try{
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            result = await db.collection(this.notifications_C).findOneAndUpdate(filter,{ $set: updatedNotification })
        } catch (error) {
            console.log(error)
            throw new Error("Update notification error");
          }
          finally {
            if (connect) connect.close();
        }

        return "Successfully read notification"
    }
    
    //delete notification
    async deleteNotification(notificationId){

        let connect;
        let result;

        try{
            connect = await this.client.connect();
            let db = this.client.db(this.config.db);
            const filter = {_id: new ObjectId(notificationId)};
            result = await db.collection(this.notifications_C).deleteOne(filter);
            if (!result || result.deletedCount === 0) {
                throw new Error("Unable To delete notification");
            }

        } catch(error){
            throw new Error("Unable To delete notification");            
        } finally{
            if(connect) connect.close();
        }
        return "Successfully deleted notification"
    }
    
    
}







let HTDL = new householdToDoList();

//ping server
app.get('/ping', (req, res) => {
    console.log("PINGG")
    res.sendStatus(204);
});







///////////////////////// USERS //////////////////////////////
//get all users in a household
app.get('/api/users', async (req, res) => {
  const query = req.query;
  let filter = {};

  if (query.householdId) {
    filter = { 'householdId': query.householdId };
  }
  
  await HTDL.getUsers(filter).then((data) => {
      res.status(200).send(JSON.stringify(data))
  }).catch((err) => {
      //console.log(err);
      res.sendStatus(404);
  });
  
});

//get specific user
app.get('/api/user/:userId', async (req, res) => {
    const userId = req.params.userId;
    await HTDL.getUser(userId).then((data) => {
        res.status(200).send(JSON.stringify(data))
    }).catch((err) => {
        console.log(err);
        res.sendStatus(404);
    });
    
});

//create new user (SignUP)
app.post('/api/users/signup', async (req, res) => {
    const first_name = req.body.fname;
    const last_name = req.body.lname;
    const email = req.body.password;
    const password = req.body.email;
    //const points = req.body.points;
    //const isTaskManager = rew.body.isTaskManager
    
    let invaild_fields = [];
    if(!(first_name) || !(/^[a-zA-Z]+$/.test(first_name))) {
        invaild_fields.push("first name");
    }
    if(last_name && !(/^[a-zA-Z]+$/.test(last_name))){
        invaild_fields.push("last name");
    }
    if (invaild_fields.length!=0){
        res_str = "Please fix the following fields: ";
        invaild_fields.forEach((error,index) => {
        
            res_str +=error;
            
            if(index!=invaild_fields.length-1){
                 res_str +=", ";
            }
    })
        res.status(422).send(res_str);
        return
    }
    
    await HTDL.signUp(first_name,last_name,email,password).then((data) => {
        //res.status(200).send(JSON.stringify(data));
        res.redirect(303, req.body.signup_button);

    }).catch((err) => { 
        console.log(err);
        res.sendStatus(500);
    })
    
});  

//add new user to household
app.post('/api/users/', async(req, res) => {
    const first_name = req.body.fname;
    const last_name = req.body.lname;
    const email = req.body.email;
    const password = req.body.password;
    const householdId = req.body.householdId;
    let isTaskManager = req.body.isTaskManager
    
    if (isTaskManager=='true'){
        isTaskManager = true;
    } else{
        isTaskManager = false;
    }
    
    
    let invaild_fields = [];
    if(!(first_name) || !(/^[a-zA-Z]+$/.test(first_name))) {
        invaild_fields.push("first name");
    }
    if(last_name && !(/^[a-zA-Z]+$/.test(last_name))){
        invaild_fields.push("last name");
    }
    if (invaild_fields.length!=0){
        res_str = "Please fix the following fields: ";
        invaild_fields.forEach((error,index) => {
        
            res_str +=error;
            
            if(index!=invaild_fields.length-1){
                 res_str +=", ";
            }
    })
        res.status(422).send(res_str);
        return
    }
    
    await HTDL.addUser(first_name,last_name,email,password,householdId,isTaskManager).then((data) => {
        //res.status(200).send(JSON.stringify(data));
        res.redirect(303, req.body.add_user_button);

    }).catch((err) => { 
        console.log(err);
        res.sendStatus(500);
    })
});  

//edit user
app.post('/api/users_edit/:userId', async(req, res) => {
    const userId = req.params.userId;
    
    const user =  await axios(`http://localhost:3000/api/user/${userId}`);
    if (!ObjectId.isValid(userId)) {
        res.sendStatus(404);
        return 
    }
    
    var first_name = req.body.fname;

    if (first_name === undefined){
        first_name = user.data.firstName;
    }
    var last_name = req.body.lname;
    if (last_name === undefined){
        last_name = user.data.lastName;
    }
    var email = req.body.email;
    if (email === undefined){
        email = user.data.email;
    }
    var password = req.body.password;
    if (password === undefined){
        password = user.data.password;
    }
    const householdId = user.data.householdId

    var isTaskManager = req.body.isTaskManager
    if (isTaskManager === undefined){
        isTaskManager = user.data.isTaskManager;
    }
    else if (isTaskManager=='true'){
        isTaskManager = true;
    } else{
        isTaskManager = false;
    }
    
    var points = req.body.points;
    if (points === undefined){
        points = user.data.points;
    }
    
    
    
    
    let invaild_fields = [];
    if(!(first_name) || !(/^[a-zA-Z]+$/.test(first_name))) {
        invaild_fields.push("first name");
    }
    if(last_name && !(/^[a-zA-Z]+$/.test(last_name))){
        invaild_fields.push("last name");
    }
    if (!(points) ||isNaN(Number(points)) || Number(points) < 0 || !Number.isInteger(Number(points))){
         invaild_fields.push("points");
    }
    
    if (invaild_fields.length!=0){
        res_str = "Please fix the following fields: ";
        invaild_fields.forEach((error,index) => {
        
            res_str +=error;
            
            if(index!=invaild_fields.length-1){
                 res_str +=", ";
            }
    })
        res.status(422).send(res_str);
        return
    }
    await HTDL.updateUser(userId,first_name,last_name,email,password,householdId,isTaskManager,points).then((data) => {
        //res.status(200).send(JSON.stringify(data));
        res.redirect(303, req.body.edit_user_button);
    }).catch((err) => { 
        console.log(err);
        res.sendStatus(500);
    })

});

// delete user
app.post('/api/user/:userId/delete', async(req, res) => {
  
  const userId = req.params.userId;

  await HTDL.deleteUser(userId).then((data) => {
      if(data!==null){
          //res.sendStatus(200).send(JSON.stringify(data));
          res.redirect(303, req.body.delete_button);
      }else{
          res.sendStatus(404);
      }
  }).catch((err) =>res.sendStatus(404))
  
});

// Define a route to retrieve a user's ID by their name and household ID
app.get('/api/users/userId', async (req, res) => {
    const first_name = req.body.fname;
    const last_name = req.body.lname;
    const householdId = req.body.householdId;
    const email = req.body.email;
    var login = true;
    
    if( ((first_name === undefined) && (last_name === undefined) && (householdId === undefined)) && (email === undefined)){
        res.status(404).json({ error: 'User not found' });
        return
    } else if(email === undefined) {
        login = false;
    }
    
    await HTDL.getUserID(first_name,last_name,householdId,email,login).then((data) => {
        //console.log(data);
        res.status(200).json(data._id);
    }).catch((err) =>res.sendStatus(404))
});

//user login api
app.post('/api/login', async(req, res) => {
  refresh = !refresh;
  let userId;
  const email = req.body.email;
  const password = req.body.password;
  try{
      userId =  await axios({"url": 'http://localhost:3000/api/users/userId', "data":{"email": email}});
      var test = userId.data;
  } catch{
      res.status(200).json("User not found");
      return
  }
  
  //console.log(userId.data)
  await HTDL.userLogin(userId.data, password).then((data) => {
      myData = data;
      //res.status(200).json(data);
      res.redirect(303, req.body.login_button);
  }).catch((err) => {
      res.status(404).json(err.message)})

      // Create JWT token and send it to client
      //const token = jwt.sign({ userId: user._id }, 'my_secret_key');
      //res.json({ token });
});




///////////////////////// TASKS //////////////////////////////
//get all tasks in a household, also option to filter by userId
app.get('/api/tasks', async (req, res) => {
  const query = req.query;
  let filter = {};

    if (query.householdId) {
      filter = { 'householdId': query.householdId };
    } else if (query.userId) {
      filter = { 'assigneeId': query.userId };
    }
    
    await HTDL.getTasks(filter).then((data) => {
        res.status(200).send(JSON.stringify(data))
    }).catch((err) => {
        console.log(err);
        res.sendStatus(404);
    });
  
});


//get specific task
app.get('/api/task/:taskId', async (req, res) => {
    const taskId = req.params.taskId;
    await HTDL.getTask(taskId).then((data) => {
        res.status(200).send(JSON.stringify(data))
    }).catch((err) => {
        console.log(err);
        res.sendStatus(404);
    });
    
});

//add new task to household
app.post('/api/tasks/', async(req, res) => {
    let assignment = 'assigned to';
    let bool_open = false;
    const name = req.body.name;
    let assigneeId = null;
    //console.log(req.body.dueDate)
    const dueDate = new Date(req.body.dueDate);
    const priority = Number(req.body.priority);
    const householdId = req.body.householdId;
    console.log(req.body.isRecurring)
    var isRecurring = req.body.isRecurring;
    const daysRecurring = Number(req.body.daysRecurring) || 0;
    const created_at = new Date();
    const first_name = req.body.fname;
    const last_name = req.body.lname;
    
    console.log(first_name)
    console.log(last_name)
    
    if (isRecurring=='true'){
        isRecurring = true;
    } else{
        isRecurring = false;
    }  

    if ((first_name !== undefined) && (last_name !== undefined) && (first_name !== "") && (last_name !== "")){
        try{
            userId =  await axios({"url": 'http://localhost:3000/api/users/userId', 
            "data":{"fname": first_name,"lname": last_name,"householdId": householdId}});
            assigneeId = userId.data;
            //console.log(assigneeId);
        } catch{
            res.status(200).json("User not found");
            return
        }
    }
    else{
        bool_open = true;
        assignment = 'unassigned';
    }
    
      
    let invaild_fields = [];
    if(dueDate < created_at) {
        invaild_fields.push("Due date");
    }
    if (Number(daysRecurring) < 0 || !Number.isInteger(Number(daysRecurring))){
         invaild_fields.push("daysRecurring");
    }
    if (invaild_fields.length!=0){
        res_str = "Please fix the following fields: ";
        invaild_fields.forEach((error,index) => {
        
            res_str +=error;
            
            if(index!=invaild_fields.length-1){
                 res_str +=", ";
            }
    })
        res.status(422).send(res_str);
        return
    }
    
    await HTDL.createTask(name,assigneeId,dueDate,priority,householdId,isRecurring,daysRecurring,created_at).then(async (data) => {
        //fetch all users in household
        let users =  await axios(`http://localhost:3000/api/users?householdId=${householdId}`);
        users = users.data;
        //loop through all of them, creating a notification for each
        const title = `'${name}' has been created`; 
        let description;
        if (first_name!== undefined){
            description = `'The task '${name}' has been created and is ${assignment} ${first_name} and is due on ${dueDate}`;        
        } else{
            description = `'The task '${name}' has been created and is ${assignment} and is due on ${dueDate}`;  
        }
        for (const user of users) {
            //If user isn't taskmanager or wasn't their task ignore
            if( ((!user.isTaskManager) && (user._id != assigneeId)) && !bool_open){ //new ObjectId()
                continue
            }
            try {
                await axios({"url": `http://localhost:3000/api/notifications/`,
                "method": "post", "data":{ "title": title,
                "description": description,
                "userId": user._id}});
            } catch {
                console.log(`Could not create notification for user ${user._id}`);
            }
        }
        //res.status(200).send(JSON.stringify(data));
        res.redirect(303, req.body.add_task_button);
        
    }).catch((err) => { 
        console.log(err);
        res.sendStatus(500);
    })
});

//update task
app.post('/api/tasks/:taskId', async(req, res) => {
    let assignment = 'assigned to';
    const taskId = req.params.taskId;
    let task;
    try{
        task =  await axios(`http://localhost:3000/api/task/${taskId}`);
        task = task.data;
        //console.log(assigneeId);
    } catch{
        res.status(404).json("Task not found");
        return
    }    
    
    var name = req.body.name;
    if (name === undefined){
        name = task.name;
    }
    
    var priority =req.body.priority;
    if (priority === undefined){
        priority =  Number(task.priority);
    }
    
    var householdId = req.body.householdId;
    if (householdId === undefined){
        householdId = task.householdId;
    }
    
    var isRecurring = req.body.isRecurring;
    if (isRecurring === undefined){
        isRecurring = task.isRecurring;
    }  else if (isRecurring=='true'){
        isRecurring = true;
    } else{
        isRecurring = false;
    }  
    
    var daysRecurring = req.body.daysRecurring;
    if (daysRecurring === undefined){
        daysRecurring = task.daysRecurring;
    }
    daysRecurring = Number(daysRecurring); 
    
    var created_at = task.created_at;
    
    var completed = req.body.completed;
    if (completed === undefined){
        completed = task.completed;
    }  else if (completed=='true'){
        completed = true;
    } else{
        completed = false;
    }
    
    var completionDate = req.body.completionDate;
    if (completionDate === undefined){
        completionDate = task.completionDate;
    }
    else{
        completionDate = new Date(completionDate);
    }
    
    var dueDate = req.body.dueDate;
    if (dueDate === undefined){
        dueDate = task.dueDate;
    }
    else{
        dueDate = new Date(dueDate);
    }
    
    var first_name = req.body.fname;
    const last_name = req.body.lname;
    let assigneeId = req.body.assigneeId;
    if (assigneeId !== undefined){
        first_name = req.body.Test;
    }else if ((first_name !== undefined) && (last_name !== undefined) && (first_name !== "") && (last_name !== "")){
        try{
            userId =  await axios({"url": 'http://localhost:3000/api/users/userId', 
            "data":{"fname": first_name,"lname": last_name, "householdId": householdId}});
            //console.log(userId);
            assigneeId = userId.data;
            //console.log(assigneeId);
        } catch{
            res.status(200).json("User not found");
            return
        }
    }else if(first_name === "REMOVE_USER"){
        assigneeId = null;
        assignment = 'unassigned from';
        first_name = req.body.Test;
    }
     else{
        assigneeId = task.assigneeId;        
    }
   
   /* try{
        const user =  await axios(`http://localhost:3000/api/user/${userId}`);
        user = user.data;
        //console.log(assigneeId);
    } catch{
        res.status(404).json("user not found");
        return
    } */
    
      
    let invaild_fields = [];
    if(dueDate < created_at) {
        invaild_fields.push("Due date");
    }
    if (Number(daysRecurring) < 0 || !Number.isInteger(Number(daysRecurring))){
         invaild_fields.push("daysRecurring");
    }
    if (invaild_fields.length!=0){
        res_str = "Please fix the following fields: ";
        invaild_fields.forEach((error,index) => {
        
            res_str +=error;
            
            if(index!=invaild_fields.length-1){
                 res_str +=", ";
            }
    })
        res.status(422).send(res_str);
        return
    }
    
    await HTDL.updateTask(taskId,name,assigneeId,dueDate,priority,householdId,completed,completionDate,isRecurring,daysRecurring,created_at).then(async (data) => {

        if( (first_name === req.body.Test) && (req.body.Test2!==undefined)){
            assigneeId =  req.body.Test2;
        }
        //fetch all users in household
        let users =  await axios(`http://localhost:3000/api/users?householdId=${householdId}`);
        users = users.data;
        //loop through all of them, creating a notification for each
        const title = `'${name}' has been edited`; 
        const description = `'The task '${name}' has been edited and is ${assignment} ${first_name} and is due on ${dueDate}`;
        for (const user of users) {
            //console.log(user)
            //If user isn't taskmanager or wasn't their task ignore
            if((!user.isTaskManager) && (user._id != assigneeId)){ //new ObjectId()
                continue
            }
            try {
                await axios({"url": `http://localhost:3000/api/notifications/`,
                "method": "post", "data":{ "title": title,
                "description": description,
                "userId": user._id}});
            } catch {
                console.log(`Could not create notification for user ${user._id}`);
            }
        }
        
        //res.status(200).send(JSON.stringify(data));
        res.redirect(303, req.body.edit_task_button);

    }).catch((err) => { 
        console.log(err);
        res.sendStatus(500);
    })
});

//unassign task from user
app.post('/api/tasks/r/:taskId/', async(req, res) => {
    const taskId = req.params.taskId;
    let task;
    try{
        task =  await axios(`http://localhost:3000/api/task/${taskId}`);
        task = task.data;
        //console.log(assigneeId);
    } catch{
        res.status(404).json("Task not found");
        return
    }
    
    try{
        user =  await axios(`http://localhost:3000/api/user/${task.assigneeId}`);
        user = user.data;
        //console.log(assigneeId);
    } catch{
        res.status(422).json("No user assigned");
        return
    }

    await axios({"url": `http://localhost:3000/api/tasks/${taskId}`,
    "method": "post", "data":{"fname": "REMOVE_USER", "Test": user.firstName, "Test2": user._id}}).then(async (response) => {
        res.status(200).send((response.data));

    }).catch((err) => { 
        console.log(err);
        res.sendStatus(500);
    })

});

//assign task to user
app.post('/api/tasks/:taskId/:userId', async(req, res) => {
    const taskId = req.params.taskId;
    const assigneeId = req.params.userId;
    let task;
    try{
        task =  await axios(`http://localhost:3000/api/task/${taskId}`);
        task = task.data;
        //console.log(assigneeId);
    } catch{
        res.status(404).json("Task not found");
        return
    }
    
    try{
        user =  await axios(`http://localhost:3000/api/user/${assigneeId}`);
        user = user.data;
        //console.log(assigneeId);
    } catch{
        res.status(422).json("No user assigned");
        return
    }    
    
    //check if anyone is already assigned
    if(task.assigneeId == null){
        await HTDL.updateTask(taskId,task.name,assigneeId,task.dueDate,task.priority,task.householdId,task.completed,task.completionDate,task.isRecurring,task.daysRecurring,task.created_at).then(async (response) => {            
            //res.status(200).send((response.data));
            res.redirect(303, req.body.assignMe_button);


        }).catch((err) => { 
            console.log(err);
            res.sendStatus(500);
        })
    }
    else{
        res.status(422).send("Someone is already assigned");
        return
    }
});


//complete task
app.post('/api/tasksC/:taskId', async(req, res) => {
    const taskId = req.params.taskId;
    let task;
    try{
        task =  await axios(`http://localhost:3000/api/task/${taskId}`);
        task = task.data;
        //console.log(assigneeId);
    } catch{
        res.status(404).json("Task not found");
        return
    }
    
    task.completed = true;
    task.completionDate = new Date();
    
    //check if recurring
    if (task.isRecurring) {
        task.completed = false;
        task.dueDate = new Date();
        task.dueDate.setDate(task.completionDate.getDate() + task.daysRecurring);
        task.isRecurring = "true";
    }

    // give user points based on priority
    var points = Number(task.priority);
    const assigneeId = task.assigneeId;
    let description;
    //console.log(task);
    try {
        //get user
        //console.log("test")
        let user =  await axios(`http://localhost:3000/api/user/${assigneeId}`);        
        //update points
        description = `${user.data.firstName} has completed '${task.name}' and been awarded ${task.priority} points`;
        points = Number(user.data.points) + points;
        //update user :userId
        await HTDL.updateUser(assigneeId,user.data.firstName,user.data.lastName,user.data.email,user.data.password,user.data.householdId,user.data.isTaskManager,points)
        //const respy= await axios({"url": `http://localhost:3000/api/users_edit/${assigneeId}`,
        //"method": "post", "data":{ "points": points }});
    } catch(err){
        res.status(500).json(err);
        return;
    } //updateUser
    

    //fetch all users in household
    let users =  await axios(`http://localhost:3000/api/users?householdId=${task.householdId}`);
    users = users.data;
    
    //loop through all of them, creating a notification for each
    const title = `The task '${task.name}' has been completed`; 
    for (const user of users) {
        //console.log(user)
        //If user isn't taskmanager or wasn't their task ignore
        if((!user.isTaskManager) && (user._id != assigneeId)){ //new ObjectId()
            continue
        }
        try {
            await axios({"url": `http://localhost:3000/api/notifications/`,
            "method": "post", "data":{ "title": title,
            "description": description,
            "userId": user._id}});
        } catch {
            console.log(`Could not create notification for user ${user._id}`);
        }
    }
    await HTDL.updateTask(taskId,task.name,task.assigneeId,task.dueDate,task.priority,task.householdId,task.completed,task.completionDate,task.isRecurring,task.daysRecurring,task.created_at).then((response) => {
        //res.status(200).json("Task completed and points assigned");
        res.redirect(303, req.body.complete_button);

    }).catch((err) => { 
        //console.log(err);
        res.sendStatus(500);
    })   
});


//delete task
app.post('/api/task/:taskId/delete', async(req, res) => {
  const taskId = req.params.taskId;

  await HTDL.deleteTask(taskId).then((data) => {
      if(data!==null){
          //res.status(200).send(JSON.stringify(data));
          res.redirect(303, req.body.delete_button);
      }else{
          res.sendStatus(404);
      }
  }).catch((err) =>res.sendStatus(404))
  
});








///////////////////////// REWARDS //////////////////////////////
//get all rewards in a household
app.get('/api/rewards', async (req, res) => {
  const query = req.query;
  let filter = {};

    if (query.householdId) {
      filter = {'householdId': query.householdId };
    }
    
    await HTDL.getRewards(filter).then((data) => {
        res.status(200).send(JSON.stringify(data))
    }).catch((err) => {
        console.log(err);
        res.sendStatus(404);
    });
  
});


//get specific reward
app.get('/api/reward/:rewardId', async (req, res) => {
    const rewardId = req.params.rewardId;
    await HTDL.getReward(rewardId).then((data) => {
        res.status(200).send(JSON.stringify(data))
    }).catch((err) => {
        console.log(err);
        res.sendStatus(404);
    });
    
});

//create reward
app.post('/api/rewards', async (req, res) => {
    const name = req.body.name;
    const points = Number(req.body.points);
    const householdId = req.body.householdId;
    
    let invaild_fields = [];
    if (!(points) ||isNaN(Number(points)) || Number(points) < 0 || !Number.isInteger(Number(points))){
         invaild_fields.push("points");
    }
    if (invaild_fields.length!=0){
        res_str = "Please fix the following fields: ";
        invaild_fields.forEach((error,index) => {
        
            res_str +=error;
            
            if(index!=invaild_fields.length-1){
                 res_str +=", ";
            }
    })
        res.status(422).send(res_str);
        return
    }
    
    await HTDL.createReward(name,points,householdId).then((data) => {
        //res.status(200).send(JSON.stringify(data));
        res.redirect(303, req.body.add_reward_button);

    }).catch((err) => { 
        console.log(err);
        res.sendStatus(500);
    })
    
});  

//edit reward
app.post('/api/rewards/:rewardId', async(req, res) => {
    
    const rewardId = req.params.rewardId;
    let reward;
    try{
        reward =  await axios(`http://localhost:3000/api/reward/${rewardId}`);
        reward = reward.data;
        //console.log(assigneeId);
    } catch{
        res.status(404).json("reward not found");
        return
    }
    var name = req.body.name;
    if (name === undefined){
        name = reward.name;
    }
    
    var points =req.body.points;
    if (points === undefined){
        points =  Number(reward.points);
    }
    
    var householdId = req.body.householdId;
    if (householdId === undefined){
        householdId = reward.householdId;
    }
    
    
    
      
    let invaild_fields = [];
    if (Number(points) < 0 || !Number.isInteger(Number(points))){
         invaild_fields.push("points");
    }
    if (invaild_fields.length!=0){
        res_str = "Please fix the following fields: ";
        invaild_fields.forEach((error,index) => {
        
            res_str +=error;
            
            if(index!=invaild_fields.length-1){
                 res_str +=", ";
            }
    })
        res.status(422).send(res_str);
        return
    }
    
    await HTDL.updateReward(rewardId,name,points,householdId).then((data) => {
        //res.status(200).send(JSON.stringify(data));
        res.redirect(303, req.body.edit_reward_button);

    }).catch((err) => { 
        console.log(err);
        res.sendStatus(500);
    })
});

//delete reward
app.post('/api/reward/:rewardId/delete', async(req, res) => {
  const rewardId = req.params.rewardId;

  await HTDL.deleteReward(rewardId).then((data) => {
      if(data!==null){
          res.redirect(303, req.body.delete_button);
      }else{
          res.sendStatus(404);
      }
  }).catch((err) =>res.sendStatus(404))
  
});

//redeem reward
app.post('/api/redeem/:rewardId/:userId', async(req, res) => {
    const rewardId = req.params.rewardId;
    const userId = req.params.userId;
    let reward;
    try{
        reward =  await axios(`http://localhost:3000/api/reward/${rewardId}`);
        reward = reward.data;
        //console.log(assigneeId);
    } catch{
        res.status(404).json("reward not found");
        return
    }
    
    var points = Number(reward.points);
    let description;
    //update user points
    try {
        //get user
        //console.log("test")
        const user =  await axios(`http://localhost:3000/api/user/${userId}`);        
        //update points
        if(Number(user.data.points) < points){
            res.status(422).json("Not enough user points");
            return
        }
        description = `${user.data.firstName} has claimed '${reward.name}' for ${reward.points} points`;
         
        points = Number(user.data.points) - points;
        //update user
        await HTDL.updateUser(userId,user.data.firstName,user.data.lastName,user.data.email,user.data.password,user.data.householdId,user.data.isTaskManager,points)
    } catch {
        res.status(500).json("Could not update user points");
        return;
    }
    
    //notify users
    //fetch all users in household
    let users =  await axios(`http://localhost:3000/api/users?householdId=${reward.householdId}`);
    users = users.data;
    //loop through all of them, creating a notification for each
    const title = `The reward '${reward.name}' has been claimed!`;
    
    for (const user of users) {

        //console.log(user.firstName);
        //console.log(notificationMessage);
        try {
            await axios({"url": `http://localhost:3000/api/notifications/`,
            "method": "post", "data":{ "title": title,
            "description": description,
            "userId": user._id}});
        } catch {
            console.log(`Could not create notification for user ${user._id}`);
        }
    }
    //res.status(200).json("Reward redeemed and points removed");
    res.redirect(303, req.body.redeem_button);
    
});





///////////////////////// NOTIFICATIONS //////////////////////////////
//get all user notifications
app.get('/api/notifications', async (req, res) => {
  const query = req.query;
  let filter = {};

    if (query.userId) {
      filter = {'userId': query.userId };
    }
    
    await HTDL.getNotifications(filter).then((data) => {
        res.status(200).send(JSON.stringify(data))
    }).catch((err) => {
        console.log(err);
        res.sendStatus(404);
    });
  
});


//get specific notification
app.get('/api/notification/:notificationId', async (req, res) => {
    const notificationId = req.params.notificationId;
    await HTDL.getNotification(notificationId).then((data) => {
        res.status(200).send(JSON.stringify(data))
    }).catch((err) => {
        console.log(err);
        res.sendStatus(404);
    });
    
});

//create notification
app.post('/api/notifications', async (req, res) => {

    const title = req.body.title;
    const description = req.body.description;
    const userId = req.body.userId;
    //isRead createdAt
    
    
    await HTDL.createNotification(title,description,userId).then((data) => {
        res.status(200).send(JSON.stringify(data));

    }).catch((err) => { 
        console.log(err);
        res.sendStatus(500);
    })
    
});  

//read notification
app.post('/api/notifications/:notificationId', async(req, res) => {
    const notificationId = req.params.notificationId;
    let notification;
    try{
        notification =  await axios(`http://localhost:3000/api/notification/${notificationId}`);
        notification = notification.data;
        //console.log(assigneeId);
    } catch{
        res.status(404).json("notification not found");
        return
    }
    
    notification.isRead = true;  
      
    
    await HTDL.notificationRead(notificationId,notification).then((data) => {
        //res.status(200).send(JSON.stringify(data));
        res.redirect(303, req.body.read_button);

    }).catch((err) => { 
        console.log(err);
        res.sendStatus(500);
    })
});

//delete notification
app.post('/api/notification/:notificationId/delete', async(req, res) => {
  const notificationId = req.params.notificationId;

  await HTDL.deleteNotification(notificationId).then((data) => {
      if(data!==null){
          //res.status(200).send(JSON.stringify(data));
          res.redirect(303, req.body.delete_button);
      }else{
          res.sendStatus(404);
      }
  }).catch((err) =>res.sendStatus(404))
  
});

//monitor user notifications
app.get('/api/monitor/:userId', async(req, res) => {
    const userId = req.params.userId;
     
    try{
        tasks =  await axios(`http://localhost:3000/api/tasks?userId=${userId}`);
        tasks = tasks.data;
        //console.log(assigneeId);
    } catch{
        res.status(404).json("user tasks not found");
        return
    }
    
    try{
        //get user
        //console.log("test")
        var userX =  await axios(`http://localhost:3000/api/user/${userId}`);
        //console.log(userX)
        userX = userX.data;
    }catch{
        res.status(404).json("user not found");
        return
    }
    
    let users =  await axios(`http://localhost:3000/api/users?householdId=${userX.householdId}`);
    users = users.data;
    //loop through all of them, creating a notification for each

    let title;
    let description;
    for (const task of tasks) {
        //check if task is overdue
        if(new Date(task.dueDate) < new Date()){
            title = `Task '${task.name}' is overdue!`;
            description = `The task '${task.name}', assigned to ${userX.firstName}, was due on ${task.dueDate} and is now overdue!`;
        }else if(Math.abs(new Date(task.dueDate).getTime() - new Date().getTime()) < 86400000){ 
                //check if task is due soon
                title = `Task '${task.name}' is due soon!`;
                description = `The task '${task.name}', assigned to ${userX.firstName}, is due on ${task.dueDate} in < 1 day!`;
        }else{
            continue
        }
        
        for (const user of users) {
            //console.log(user)
            //If user isn't taskmanager or wasn't their task ignore
            if((!user.isTaskManager) && (user._id != userId)){ //new ObjectId()
                continue
            }
            try {
                await axios({"url": `http://localhost:3000/api/notifications/`,
                "method": "post", "data":{ "title": title,
                "description": description,
                "userId": user._id}});
            } catch {
                console.log(`Could not create notification for user ${user._id}`);
                res.sendStatus(500);
            }
        }
    }
    res.sendStatus(200);//.send(JSON.stringify(data));

});


app.get('/login.html',async(req,res) => {   
    const contents = fs.readFileSync('login.html', 'utf8');
    res.send(contents);
})


app.get('/signup.html' ,async(req,res) => {
    const contents = fs.readFileSync('signup.html', 'utf8');
    res.send(contents);

})

app.get('/add_rewards.html', async (req, res) => {
    try {
      res.render('add_rewards.ejs', { myData });
    } catch (err) {
      res.status(404).send(err);
    }
});

app.get('/add_tasks.html', async (req, res) => {
    try {
      res.render('add_tasks.ejs', { myData });
    } catch (err) {
      res.status(404).send(err);
    }
});

app.get('/add_users.html', async (req, res) => {
    try {
      res.render('add_users.ejs', { myData });
    } catch (err) {
      res.status(404).send(err);
    }
});

app.get('/edit_rewards/:rewardId/edit.html', async (req, res) => {
    try {
        const rewardId = req.params.rewardId;    
        res.render('edit_rewards.ejs', { rewardId, myData });
    } catch (err) {
      res.status(404).send(err);
    }
});

app.get('/edit_tasks/:taskId/edit.html', async (req, res) => {
    try {
        const taskId = req.params.taskId;
        res.render('edit_tasks.ejs', { taskId, myData });
    } catch (err) {
      res.status(404).send(err);
    }
});

app.get('/edit_users/:userId/edit.html', async (req, res) => {
    try {
        const userId = req.params.userId;
        //console.log(userId)
        res.render('edit_users.ejs', { userId, myData });
    } catch (err) {
      res.status(404).send(err);
    }
});


app.get('/home.html', async (req, res) => {
    try {
      const response =  await axios(`http://localhost:3000/api/tasks?userId=${myData._id}`);
      const tasks = response.data;
      const response2 = await axios(`http://localhost:3000/api/tasks?householdId=${myData.householdId}`);
      const all_tasks = response2.data;
      //console.log(tasks)
      res.render('home.ejs', { tasks, myData, all_tasks });
    } catch (err) {
      res.status(404).send(err);
    }
});

app.get('/notifications.html', async (req, res) => {
    try {
      
      const response =  await axios(`http://localhost:3000/api/notifications?userId=${myData._id}`);
      const notifications = response.data;
      //console.log(notifications)
      //referesh notifications
      if(refresh){
          await axios(`http://localhost:3000/api/monitor/${myData._id}`);
          refresh = false;
      }   
      res.render('notifications.ejs', { notifications, myData });
    } catch (err) {
      res.status(404).send(err);
    }
});

app.get('/manage.html', async (req, res) => {
    try {
      
      const response =  await axios(`http://localhost:3000/api/tasks?householdId=${myData.householdId}`);
      const response2 = await axios(`http://localhost:3000/api/users?householdId=${myData.householdId}`);
      const tasks = response.data;
      const users = response2.data;
      res.render('manage.ejs', { tasks, users, myData });
    } catch (err) {
      res.status(404).send(err);
    }
});

app.get('/rewards.html', async (req, res) => {
    try {
      //update user points
      var user =  await axios(`http://localhost:3000/api/user/${myData._id}`);
      myData = user.data;
      const response =  await axios(`http://localhost:3000/api/rewards?householdId=${myData.householdId}`);
      const rewards = response.data;
      res.render('rewards.ejs', { rewards , myData });
    } catch (err) {
      res.status(404).send(err);
    }
});


app.listen(port, () => {
  console.log(`Server is listening on port ${port}.`);
});



