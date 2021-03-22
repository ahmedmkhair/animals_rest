let express = require("express")
let jwt = require('jsonwebtoken')
let cookieParser = require('cookie-parser')
let app = express()
let port = 3000
let appSecretKey = '23984lsdfjLJosidfjoiw023'

app.use(express.static('webfiles'))
app.use(express.json())
app.use(cookieParser())

let allAnimals = [
    { id: 1, name: 'dog', says: 'woof'},
    { id: 2, name: 'cat', says: 'meow'},
    { id: 3, name: 'cow', says: 'moo'},
    { id: 4, name: 'lion', says: 'tweet'}
]

app.get('/api/animals', (req, res) => {
    try {
        let authToken = req.cookies['animal-token']
        let userDetails = jwt.verify(authToken, appSecretKey)
        res.send(allAnimals)
    }
    catch (e) {
        res.status(401)
        res.send('not authorized')
    }
    //res.send(allAnimals)
})

app.get('/api/animals/:id', (req, res) => {
    let elt = allAnimals.find((e) => {
        return e.id == req.params.id
    })
    if (!elt) {
        res.status(404)
        res.send("not found")
        return
    }
    res.send(elt)
})

app.put('/api/animals/:id', (req, res) => {
    let elt = allAnimals.find((e) => e.id == req.params.id)
    if (!elt) {
        res.status(404)
        res.send('not found')
        return
    }
    elt.name = req.body.name
    elt.says = req.body.says
    res.send('ok')
})

app.post('/api/animals', (req, res) => {
    let maxId = 0
    allAnimals.forEach((e) => {
        if (e.id > maxId) {
            maxId = e.id
        }
    })
    maxId++
    let obj = {
        id: maxId,
        name: req.body.name,
        says: req.body.says
    }
    allAnimals.push(obj)
    res.status(201)
    res.set('Location', `/api/animals/${maxId}`)
    res.send("created")
})

app.post('/api/login', (req, res) => {
    let u = req.body.username
    let p = req.body.password
    if (u === 'admin' && p === 'password') {
        let userInfo = {
            name: u,
            type: 'admin'
        }
        let token = jwt.sign(userInfo, appSecretKey)
        res.cookie('animal-token',token, {httpOnly: true})
        res.send("ok")
        return
    }
    res.status(401)
    res.send("not authorized")

})

app.post('/api/logout', (req, res) => {
    // do nothing here for now but maybe we could record the action in the log
    res.cookie('animal-token','', {expires: new Date(Date.now()-1)})
    res.send('ok')
})


app.listen(port, () => {
    console.log("The application has started")
})

