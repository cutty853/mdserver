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

/**
 * The Memorizer is here to manage a database of memos.
 */
class Memorizer {
  /**
   * 
   * @param {String} category The category of the memos
   * @param {options} configuration A javascript object with the following attributes:
   *        directory: the subfolder where to put all the memos and their images
   */
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

  /**
   * Get the absolute path of a memo.
   * 
   * @param {String} memoName The name of the memo you want to get the full path.
   */
  memoPath(memoName) {
    return path.join(__dirname, this.config.directory, memoName + '.md');
  }

  /**
   * Get the absolute path of the image of a memo.
   * 
   * @param {String} memoName The name of the memo you want to get the image's full path
   */
  imagePath (memoName) {
    return path.join(__dirname, this.config.directory, 'images', memoName + '.jpg');
  }

  /**
   * Get the HTML content of a memo with its name.
   * 
   * @param {String} memoName The name of a memo
   * @param {function} treatmentCallback A callback function to handle the html content of the memo.
   */
  show(memoName, treatmentCallback) {
    // TODO: Put error handling outside of the Memorizer object.
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

  /**
   * Get the list of all memos managed by the Memorizer.
   * 
   * @param {function} treatmentCallback A callback function to handle the list of memos.
   */
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