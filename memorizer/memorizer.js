const path = require('path');
const fs = require('fs');
const hljs = require('highlight.js');
const MarkdownIt = require('markdown-it');

var md = new MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(lang, str, true).value +
               '</code></pre>';
      } catch (__) {}
    }
 
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

class Memorizer {
  constructor (category, configuration) {
    this.category = category;
    this.config = configuration;
  }

  set config(config) {
    this._config = config;
  }

  get config() {
    return this._config;
  }

  set category (category) {
    this._category = category;
  }

  get category () {
    return this._category;
  }

  memoPath(memoName) {
    return path.join(__dirname, this.config.directory, memoName + '.md');
  }

  imagePath (memoName) {
    return path.join(__dirname, this.config.directory, 'images', memoName + '.jpg');
  }

  show(memoName, treatmentCallback) {
    fs.readFile(this.memoPath(memoName), {encoding: 'utf-8'}, function (err, content) {
      if (err) {
        console.log("error while loading memo called " + memoName);
        res.send("nope"); // TODO: redirect with error
      } else {
        console.log("loading memo called" + memoName);
        treatmentCallback(md.render(content));
      }
    });
  }

  listAll(treatmentCallback) {
    fs.readdir(path.join(__dirname, this.config.directory), {withFileTypes: true}, function(err, files) {
      var markdownFiles = [];

      for (const file of files) {
        if (file.isFile()) {
          var filename = path.parse(path.basename(file.name)).name;
          console.log("loading memo tile for: " + filename);
          markdownFiles.push(filename);
        }
      }

      treatmentCallback(markdownFiles);
    });
  }
}

exports = module.exports = Memorizer;