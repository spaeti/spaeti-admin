
/*
 * GET users listing.
 */

exports.list = function(req, res){
    res.render('spaeti/list');
};

exports.add = function(req, res){
    res.render('spaeti/new');
};