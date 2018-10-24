let Data = require('../models/data');
let express = require('express');
let router = express.Router();

// --------------------- connect to mongo database --------------------- //
let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/nba');

let db = mongoose.connection;

db.on('error', function (err) {
    console.log('Unable to Connect to [ ' + db.name + ' ]', err);
});

db.once('open', function () {
    console.log('Successfully Connected to [ ' + db.name + ' ]');
});



function getTotalVotes(array) {
    array.forEach(function(obj) { var totalVotes = obj.player });
    return totalVotes;
}

router.findTotalVotes = (req, res) => {
    Data.find(function(err, donations) {
        if (err)
            res.send(err);
        else
            res.json({ totalvotes : getTotalVotes(donations) });
    });
}





//  --------------------- get methods --------------------- //
router.getDisplay = (req, res) => {
    // Return a JSON representation of our list
    res.setHeader('Content-Type', 'application/json');

    Data.find(function(err, players) {
        if (err)
            res.send({message : 'Failed to process command. Try again pls.'});

        else
        res.send(JSON.stringify(players,null,5));

    });
}

router.getNumberOfTeams = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Data.find(function(err, players) {
        if (err)
            res.send({message : 'Failed to count players'});
        else
            res.send('Total number of teams in the Database is => ' + players.length);

    });
}

router.getTeam = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Data.find({ "_id" : req.params.id },function(err, team) {
        if (err)
            res.json({ message: 'Donation NOT Found!', errmsg : err } );
        else
            res.send(JSON.stringify(team,null,5));
    });
}

function getPlayer(array) {
    var data = [];
    for ( var i = 0; i < array.length; i++)
    {
        for ( var j = 0; j < array.length; j++) {
            data.push(array[i].player[j]).toString();
        }
    }
    return data;
}


router.getAllPlayers = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Data.find(function(err, players) {
        if (err)
            res.send({message : 'Failed to count players'});
        else
            res.send(JSON.stringify(getPlayer(players),null,5));
    });
}


function getRev(array) {
    var data = [];
    for ( var i = 0; i < array.length; i++)
    {
        data.push(array[i].revenue).toString();
    }
    return data;
}

router.getRevenue = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Data.find({ "_id" : req.params.id },function(err, team) {
        if (err)
            res.json({ message: 'Revenue NOT Found!', errmsg : err } );
        else
            res.json('The Revenue for ' + req.params.id + ' is =>' + ' ' + getRev(team) );

    });
}

// --------------------- put methods --------------------- //
router.putChamps = (req, res) => {
    Data.findById(req.params.id, function(err,team) {
        if (err)
            res.json({ message: 'Team NOT Found!', errmsg : err } );
        else {
            team.champs += 1;
            team.save(function (err) {
                if (err)
                    res.json({ message: 'Team Championship status NOT UpVoted!', errmsg : err } );
                else

                    res.send(JSON.stringify(team,null,5));
            });
        }
    });
}

router.putSeason = (req, res) => {
    Data.find(req.params.id, function(err,team) {
        if (err) {
            res.json({message: 'Team NOT Found!', errmsg: err});
        }
        else {
            team.player.seasons_played += 1;
            team.save(function (err) {
                if (err)
                    res.json({message: 'Team Championship status NOT UpVoted!', errmsg: err});
                else

                    res.send(JSON.stringify(team, null, 5));
            });
        }
    });
}


// --------------------- delete methods --------------------- //
router.deleteTeam = (req, res) => {
    Data.findByIdAndRemove(req.params.id, function(err) {
        if (err)
            res.json({ message: 'Team NOT DELETED!', errmsg : err } );
        else
            res.json({ message: 'Team Successfully Deleted!'});
    });
}




// --------------------- post methods --------------------- //

router.addTeam = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    var data = new Data();

    data.team = req.body.team;

    data.player = [];

    data.champs = req.body.champs;
    data.revenue = req.body.revenue;

    data.save(function(err) {
        if (err)
            res.json({ message: 'New Team NOT Added!', errmsg : err } );
        else
            res.json({ message: 'Team Successfully Added!', data: donation });
    });
}


router.addPlayer = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    var data = new Data();

    var player = {"name": req.body.name, "seasons_played": req.body.seasons_played};
    data.player.push(player);
    data.save(function(err) {
        if (err)
            res.json({ message: 'Failed to add new Player!', errmsg : err } );
        else
            res.json({ message: 'New Player Successfully Added!', data: data });
    });
}


module.exports = router;
