function renderDocs(docs) {
    var html = '';
    html += "<ul>\n";
    docs.forEach(function (d) {
        html += "    <li>\n";
        html += `        <h1>${d.typeTranslated} (ID: ${d.id}, 名称: ${d.name})</h1>\n`;
        html += "        <ul>\n";
        for (var field in d.matches) {
            html += `            <li style="position:relative;padding-left:200px;">\n`;
            html += `                <span style="position:absolute;top:0;left:0">${field}</span>\n`;
            html += `                <span style="background-color:#ddd">${d.matches[field]}</span>\n`;
            html += "            </li>\n";
        }
        html += "        </ul>\n";
        html += "    </li>\n";
    });

    html += "</ul>\n";

    return html;
};

function KeywordSearch() {
    this.eventHandlers = {};
}

KeywordSearch.prototype = {
    search: function (keyword, page) {
        if (!keyword.length) {
            this.fire('error', xhttp.responseText);
            return;
        }

        var search = this;
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4) {
                if (xhttp.status == 200) {
                    search.setResult(JSON.parse(xhttp.responseText));
                } else {
                    search.fire('error', xhttp.responseText);
                }
            }
        };
        xhttp.open("GET", "/find?keyword=" + keyword + '&page=' + page);
        xhttp.send();
    },

    setResult: function (result) {
        this.lastResult = result;
        this.fire('result', result);
    },

    on: function (event, cb) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }

        this.eventHandlers[event].push(cb);
    },

    fire: function (event) {
        if (!this.eventHandlers[event]) {
            return;
        }

        var args = Array.prototype.splice.call(arguments, 1);

        for (var i = 0; i < this.eventHandlers[event].length; ++i) {
            this.eventHandlers[event][i].apply(null, args);
        }
    }
}