const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { v4: uuidv4 } = require('uuid');

app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const users = []
const data = []

app.post('/api/users', (req, res) => {
  const username = req.body.username
  if(!username) {
    res.send({error});
    return;
  }
  const _id = users.length;
  users.push({username, log:[]});
  res.send({username, _id})
})

app.get('/api/users', (req, res) => {
  res.send(
    users.map(({ username }, i) => ({
      _id: i.toString(),
      username,
    }))
  );
})

app.post('/api/users/:id/exercises', (req, res) => {
  const _id = Number(req.params.id);
  const date = req.body.date? new Date(req.body.date): new Date()
  let dateString = date.toDateString();
  if(dateString === 'Invalid Date') console.log(req.body.date)

  let workout = {
    description:  req.body.description,
    duration: Number(req.body.duration),
    date: dateString
  }

  users[_id].log.push(workout)
  workout = {username: users[_id].username, _id, ...workout }
  res.send(workout)
})

app.get('/api/users/:id/logs', (req, res) => {
  const {limit, from , to} = req.query

  const _id = req.params.id;
  if (_id > users.length - 1) {
    res.send({error})
    return;
  }
  const {log, ...rest} = users[_id];
  let filteredLog =  log

  if(from) {
    fromDate =Date.parse(from)
    const logs = filteredLog.filter(log => {
      let date = Date.parse(log.date)
      return date > fromDate
    })
    filteredLog = logs
  }
  if (to) {
    toDate = Date.parse(to)
    const logs = filteredLog.filter(log => {
      let date = Date.parse(log.date)
      return date < toDate
    })

    filteredLog = logs
  }

  if (limit) filteredLog = filteredLog.slice(0, limit)

  const logs = {...rest, log:  filteredLog, count: filteredLog.length}

  res.send(logs)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
