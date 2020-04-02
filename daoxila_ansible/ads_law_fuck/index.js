"use strict";

const findWord = require('./find-word'),
    co = require('co'),
    http = require('http'),
    url = require('url'),
    fileSystem = require('fs'),
    path = require('path'),
    qs = require('querystring'),
    csv = require('to-csv');

const ct = 'text/html; charset=UTF-8';

http.createServer(function (req, res) {
    var { pathname, query } = url.parse(req.url);
    switch (pathname) {
        case '/export.csv':
            handleExport(query, res);
            break;
        case '/find':
            handleFind(query, res);
            break;
        case '/':
            handleStatic('search.html', res);
            break;
        case '/all.js':
            handleStatic('all.js', res);
            break;
        default:
            res.writeHead(404, {
                'Content-Type': ct
            });
            res.end('not found');
    }
}).listen(8123);

function handleStatic(file, res) {
    var filePath = path.join(__dirname, 'public', file);
    res.writeHead(200, {
        'Content-Type': ct
    });
    fileSystem.createReadStream(filePath).pipe(res);
}

function handleFind(query, res) {
    co(function *() {
        var q = qs.parse(query);
        var result = yield findWord(q.keyword, q);
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=UTF-8'
        });
        res.end(JSON.stringify(result));
    }).catch((e) => {
        console.error(query);
        console.error(e.stack || e);
        res.writeHead(500, {
            'Content-Type': ct
        });
        res.end('An error has occurred.');
    });
}

function handleExport(query, res) {
    co(function *() {
        var q = qs.parse(query);

        q.perPage = 0;
        var r = yield findWord(q.keyword, q);

        q.perPage = r.totalDocs;
        var all = yield findWord(q.keyword, q);
        res.writeHead(200, {
            'Content-Type': 'text/csv; charset=UTF-8'
        })

        all.docs.forEach(d => {
            res.write(csv({
                title: `${d.typeTranslated} (ID:${d.id}, 名称: ${d.name})`
            }, { headers: false }));

            for (var field in d.matches) {
                res.write(csv({
                    field: field,
                    hl: d.matches[field]
                }, { headers: false }));
            }
        });

        res.end();
    }).catch((e) => {
        console.error(query);
        console.error(e.stack || e);
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });
        res.end('An error has occurred.');
    });
}
