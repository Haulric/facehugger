/*
BSD-2 License
Copyright (c) 2013, Nicolas Lantoing
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this
  list of conditions and the following disclaimer in the documentation and/or
  other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

//Strict mode
"use strict";

/**
 * 
 */
function Facehugger(service, query, containerQuery, callback){
    if(!service) return false;
    this.service = service;
    this.query = query || 'a';
    this.containerQuery = containerQuery;
    this.callback = callback || null;


    this.scripts = [];
    this.stylesheets = [];

    this.getContent = function(event){
        var url = event.target.getAttribute('href');

        event.preventDefault();
	var ret = this.service.get(url,true, this._parseResults.bind(this));
        history.pushState(null,null,url);
    }.bind(this);

    //get current scripts and stylesheets
    var scripts = document.getElementsByTagName('script');
    var stylesheets = document.getElementsByTagName('link');

    var len = scripts.length, i = 0;
    for(i;i<len;i++){
        var src = scripts[i].getAttribute('src');
        if(src) this.scripts.push(src);
    }

    var len = stylesheets.length, i = 0;
    for(i;i<len;i++){
        var href = scripts[i].getAttribute('href');
        if(href) this.stylesheets.push(href);
    }

    this.pond(document);
    return this;
};

Facehugger.prototype.pond = function(host){
    var tags = host.querySelectorAll(this.query), len = tags.length, i = 0;
    for(i;i<len;i++){
	//TODO: find a way to check if the listener have already be bounded to the element
        tags[i].removeEventListener('click', this.getContent, false);
        tags[i].addEventListener('click', this.getContent, false);
    }
};

Facehugger.prototype._parseResults = function(result){
    var newDocument = (result.responseXML) ? result.responseXML: this._parseTextResponse();
    var container = window.document.querySelector(this.containerQuery);
    var newContent = newDocument.querySelector(this.containerQuery);
    var title = newDocument.getElementsByTagName('title')[0];

    //loading external ressources.
    this._getRessources(newDocument);
    this.pond(newContent);

    if(title) document.title = title.innerHTML;

    if(this.callback) this.callback(container, newContent);
    else{
	while(container.firstChild) container.removeChild(container.firstChild);
	for(var i = 0, len = newContent.childNodes.length; i< len; i++)
	    container.appendChild(newContent.childNodes[0]);
    }
};

Facehugger.prototype._parseTextResponse = function(result){
    var tmp = document.createElement('article');
    tmp.innerHTML = result;
    return tmp;
};

Facehugger.prototype._getRessources = function(dom){
    //get current scripts and stylesheets
    var scripts = dom.getElementsByTagName('script');
    var stylesheets = dom.getElementsByTagName('link');

    var len = scripts.length, i = 0;
    for(i;i<len;i++){
        var src = scripts[i].getAttribute('src');
        if(src && this.scripts.indexOf(src) === -1){
	    //TODO
            __E.loader.loadScript('text/javascript', src, false);
            this.scripts.push(src);
        }
    }

    var len = stylesheets.length, i = 0;
    for(i;i<len;i++){
        var href = scripts[i].getAttribute('href');
        if(href && this.stylesheets.indexOf(href) === -1){
	    //TODO
            __E.loader.loadCss(href);
            this.stylesheets.push(href);
        }
    }
};
