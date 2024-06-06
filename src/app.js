"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
//TASK-1
class User {
    constructor(id, username, password, email, fullname) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.fullname = fullname;
        this.providerId = null;
        this.meters = [];
    }
}
let users = [];
const addUser = (username, password, email, fullname) => {
    const newUser = new User(users.length + 1, username, password, email, fullname);
    users.push(newUser);
    return newUser;
};
// Return all users
app.get('/users', (req, res) => {
    res.json(users);
});
// Create a user with attributes username, password, email and fullname
app.post('/users', (req, res) => {
    const { username, password, email, fullname } = req.body;
    const newUser = addUser(username, password, email, fullname);
    users.push(newUser);
    res.send("User added successfully");
});
// Return a user with parameter id if not exists return message saying 'user not found'
const getUserById = (id) => {
    return users.find(user => user.id === id);
};
app.get('/users/:id', (req, res) => {
    const user = getUserById(parseInt(req.params.id));
    if (user) {
        console.log(user);
        res.json(user);
    }
    else {
        res.status(404).send('User not found');
    }
});
// update user information for given id
app.put('/users/:id', (req, res) => {
    const user = getUserById(parseInt(req.params.id));
    if (user) {
        const { username, password, email, fullname } = req.body;
        user.username = username !== null && username !== void 0 ? username : user.username;
        user.password = password !== null && password !== void 0 ? password : user.password;
        user.email = email !== null && email !== void 0 ? email : user.email;
        user.fullname = fullname !== null && fullname !== void 0 ? fullname : user.fullname;
        res.json(user);
    }
    else {
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
    constructor(id, name, charge) {
        this.id = id;
        this.name = name;
        this.charge = charge;
    }
}
let providers = [];
const addProvider = (name, charge) => {
    const newProvider = new Provider(providers.length + 1, name, charge);
    providers.push(newProvider);
    return newProvider;
};
const getProviderById = (id) => {
    return providers.find(provider => provider.id === id);
};
app.get('/providers', (req, res) => {
    res.send(providers);
});
app.get('/providers/:id', (req, res) => {
    const provider = getProviderById(parseInt(req.params.id));
    if (provider) {
        res.json(provider);
    }
    else {
        res.send('Provider not found');
    }
});
app.post('/providers', (req, res) => {
    const { name, charge } = req.body;
    const newProvider = addProvider(name, charge);
    providers.push(newProvider);
    res.send("Provider added successfully");
});
app.put('/providers/:id', (req, res) => {
    var _a, _b;
    const provider = getProviderById(parseInt(req.params.id));
    if (provider) {
        provider.name = (_a = req.body.name) !== null && _a !== void 0 ? _a : provider.name;
        provider.charge = (_b = req.body.charge) !== null && _b !== void 0 ? _b : provider.charge;
        res.send("Updated Successfully");
    }
    else {
        res.send('Provider not found');
    }
});
app.delete('/providers/:id', (req, res) => {
    const providerId = parseInt(req.params.id);
    providers = providers.filter(provider => provider.id !== providerId);
    res.status(204).send();
});
// TASK-3 - User choosing a provider - subscribing
app.post('/users/:id/subscribe', (req, res) => {
    const user = getUserById(parseInt(req.params.id));
    const provider = getProviderById(req.body.providerId);
    if (user && provider) {
        user.providerId = provider.id;
        res.json(user);
    }
    else {
        res.send('User or Provider not found');
    }
});
// TASK-4 
class Meter {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.readings = [];
    }
}
let meters = [];
const addMeter = (name) => {
    const newMeter = new Meter(meters.length + 1, name);
    meters.push(newMeter);
    return newMeter;
};
const getMeterById = (id) => {
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
    }
    else {
        res.send('Meter not found');
    }
});
app.post('/meters/:id/readings', (req, res) => {
    const meter = getMeterById(parseInt(req.params.id));
    if (meter) {
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
    if (user && meter) {
        user.meters.push(meter.id);
        res.json(user);
    }
    else {
        res.send('User or Meter not found');
    }
});
// Gets all readings of a user
app.get('/users/:userId/readings', (req, res) => {
    const user = getUserById(parseInt(req.params.userId));
    if (user) {
        const readings = user.meters.flatMap(meterId => {
            const meter = getMeterById(meterId);
            return meter ? meter.readings : [];
        });
        res.json(readings);
    }
    else {
        res.send('User not found');
    }
});
// Calculates bill for a user
app.get('/users/:userId/bill', (req, res) => {
    const user = getUserById(parseInt(req.params.userId));
    if (user) {
        const provider = getProviderById(user.providerId);
        if (provider) {
            const totalUnits = user.meters.reduce((total, meterId) => {
                const meter = getMeterById(meterId);
                return total + (meter ? meter.readings.reduce((sum, reading) => sum + reading.units, 0) : 0);
            }, 0);
            const billAmount = totalUnits * provider.charge;
            res.json({ user_id: user.id, amount: billAmount });
        }
        else {
            res.send('Provider not found');
        }
    }
    else {
        res.send('User not found');
    }
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
