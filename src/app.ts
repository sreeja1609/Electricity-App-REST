import express from 'express'; 
import bodyParser from 'body-parser'; 

const app = express(); 
const port = 3000;

app.use(express.json());
app.use(bodyParser.json());

//TASK-1

class User {
    constructor(
        public id: number,
        public username: string,
        public password: string,
        public email: string,
        public fullname: string,
        public providerId: number | null = null,
        public meters: any[] = []
    ){}
}
let users: User[] = [];
let userIdCounter = 1;

// Return all users
app.get('/users', (req, res) => {
    res.json(users);
});

app.post('/users', (req, res) => {
    const { username, password, email, fullname } = req.body;
    const newUser = new User(userIdCounter++, username, password, email, fullname);
    users.push(newUser);
    res.status(201).json(newUser);
});

// Return a user with parameter id if not exists return message saying 'user not found'
const getUserById = (id: number) => {
    return users.find(user => user.id === id);
};

app.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (user) {
        res.json(user);
    } else {
        res.status(404).send('User not found');
    }
});

app.put('/users/:id', (req, res) => {
    const { username, password, email, fullname } = req.body;
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (user) {
        user.username = username || user.username;
        user.password = password || user.password;
        user.email = email || user.email;
        user.fullname = fullname || user.fullname;
        res.json(user);
    } else {
        res.status(404).send('User not found');
    }
});

// delete user for given id
app.delete('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    users = users.filter(user => user.id !== userId);
    res.status(204).send();
});

// TASK-2 API's for providers
class Provider {
    id: number;
    name: string;
    charge: number;
  
    constructor(id: number, name: string, charge: number) {
      this.id = id;
      this.name = name;
      this.charge = charge;
    }
}
  
let providers: Provider[] = [];
let providerIdCounter = 1;
  
const getProviderById = (id: number) => {
    return providers.find(provider => provider.id === id);
};
  
app.get('/providers', (req, res) => {
    res.send(providers);
});

app.get('/providers/:id', (req, res) => {
    const provider = providers.find(p => p.id === parseInt(req.params.id));
    if (provider) {
        res.json(provider);
    } else {
        res.status(404).send('Provider not found');
    }
});

app.post('/providers', (req, res) => {
    const { name, charge } = req.body;
    const newProvider = new Provider(providerIdCounter++, name, charge);
    providers.push(newProvider);
    res.status(201).json(newProvider);
});
  
app.put('/providers/:id', (req, res) => {
    const provider = getProviderById(parseInt(req.params.id));
    if(provider){
      provider.name = req.body.name ?? provider.name;
      provider.charge = req.body.charge ?? provider.charge;
      res.send("Updated Successfully");
    }
    else{
      res.send('Provider not found');
    }
});

app.delete('/providers/:id', (req, res) => {
    const providerId = parseInt(req.params.id);
    providers = providers.filter(provider => provider.id !== providerId);
    res.status(204).send();
});
  
// TASK-3 - User choosing a provider - subscribing
app.post('/users/:id/subscription', (req, res) => {
    const user = getUserById(parseInt(req.params.id));
    const provider = getProviderById(parseInt(req.body.providerId));
    console.log(user);
    console.log(provider);
    if(user && provider){
        user.providerId = provider.id;
        res.json(user);
    }
    else{
        res.send('User or Provider not found');
    }
});

// TASK-4 
class Meter{
    id: number;
    name: string;
    readings: { units: number, time: string }[];
  
    constructor(id: number, name: string) {
      this.id = id;
      this.name = name;
      this.readings = [];
    }
}
  
let meters: Meter[] = [];
  
const addMeter = (name: string) => {
    const newMeter = new Meter(meters.length + 1, name);
    meters.push(newMeter);
    return newMeter;
};
  
const getMeterById = (id: number) => {
    return meters.find(meter => meter.id === id);
};
  
app.get('/meters', (req, res) => {
    res.json(meters);
});
  
app.post('/meters', (req, res) => {
    const { name } = req.body;
    const newMeter = addMeter(name);
    meters.push(newMeter);
    res.send("Meter created successfully");
});

app.get('/meters/:id/readings', (req, res) => {
    const meter = getMeterById(parseInt(req.params.id));
    if (meter) {
      res.send(meter.readings);
    } else {
      res.send('Meter not found');
    }
});

app.post('/meters/:id/readings', (req, res) => {
    const meter = getMeterById(parseInt(req.params.id));
    if(meter){
        meter.readings.push({
            units: req.body.units,
            time: req.body.time
        });
        console.log("Updated successfully");
        res.send(meter.readings);
    }
    else {
      res.send('Meter not found');
    }
});
  
//TASK-5
// Associate meter to user
app.post('/users/:userId/meters/:meterId', (req, res) => {
    const user = getUserById(parseInt(req.params.userId));
    const meter = getMeterById(parseInt(req.params.meterId));
    if(user && meter){
      user.meters.push(meter.id);
      res.json(user);
    }
    else{
      res.send('User or Meter not found');
    }
});
  
// Gets all readings of a user
app.get('/users/:userId/readings', (req, res) => {
    const user = getUserById(parseInt(req.params.userId));
    if (user){
        const readings = user.meters.flatMap(meterId => {
            const meter = getMeterById(meterId);
            return meter ? meter.readings : [];
        });
        res.json(readings);
    }
    else{
      res.send('User not found');
    }
});
  
// Calculates bill for a user
app.get('/users/:userId/bill', (req, res) => {
    const user = getUserById(parseInt(req.params.userId));
    if (user){
        const provider = getProviderById(user.providerId!);
        if(provider){
            const totalUnits = user.meters.reduce((total, meterId) => {
            const meter = getMeterById(meterId);
            return total + (meter ? meter.readings.reduce((sum, reading) => sum + reading.units, 0) : 0);
            }, 0);
            const billAmount = totalUnits * provider.charge;
            res.json({ user_id: user.id, amount: billAmount });
        }
        else{
            res.send('Provider not found');
        }
    }
    else{
      res.send('User not found');
    }
});
  

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
