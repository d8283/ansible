"use strict";

const co = require('co');
const solr = require('./solr');
const tt = require('./translate-type')

module.exports = function (word, opts) {
    if (`${word}`.length == 0) {
        return Promise.reject('empty word');
    }

    opts = opts || {};
    opts.perPage = parseInt(opts.perPage || 20);
    opts.page = parseInt(opts.page || 1);

    return co(function *() {
        var query = solr.createQuery();
        query.q(`"${word}"`)
        query.start(opts.perPage * (opts.page - 1));
        query.rows(opts.perPage);
        query.sort({ "entity_id":"asc" });
        query.set('hl=true');
        query.set('hl.fl=*');
        query.fl('entity_id,name');

        var result = yield solr.query(query);
        var docs = [];
        result.response.docs.forEach(d => {
            var [ type, id ] = d.entity_id.split('|');
            docs.push({
                id: id,
                type: type,
                typeTranslated: tt(type),
                name: d.name,
                matches: result.highlighting[d.entity_id]
            })
        });

        return Promise.resolve({
            page: opts.page,
            keyword: word,
            pages: Math.ceil(result.response.numFound / opts.perPage),
            totalDocs: result.response.numFound,
            docs: docs
        });
    });
};
