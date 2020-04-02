"use strict";

var solr = require('solr-client'),
    client = solr.createClient(
        "solr.daoxila.org",
        8983,
        "greentea",
        '/solr'
    );

exports.createQuery = client.createQuery;

exports.query = function (query) {
    return new Promise(function (resolve, reject) {
        client.search(query, function (err, obj) {
            if (!err) {
                resolve(obj);
            } else {
                reject(err);
            }
        });
    });
};
