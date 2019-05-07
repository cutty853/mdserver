const path = require('path');
const fs = require('fs');
const hljs = require('highlight.js');
const MarkdownIt = require('markdown-it');
const multer = require('multer');

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
    
      if (files) {
        for (const file of files) {
          if (file.isFile()) {
            var filename = path.parse(path.basename(file.name)).name;
            console.log("loading memo tile for: " + filename);
            markdownFiles.push(filename);
          }
        }
      } else {
        console.log("memos folder is not present");
      }

      treatmentCallback(markdownFiles);
    });
  }

  _multerDiskStorage(directory) {
    return multer.diskStorage({
      destination: function (req, file, cb) {
        console.log("choosing destination");
        if (path.extname(file.originalname) == ".md" && file.mimetype == "text/markdown") {
          console.log("choosing destination for markdown file");
          cb(null, path.join(__dirname, directory));
        } else if (file.mimetype == "image/png" || file.mimetype == "image/jpeg") {
          console.log("choosing destination for image file");
          cb(null, path.join(__dirname, directory, "images"));
        }
      },
    
      filename: function (req, file, cb) {
        console.log("choosing filename");
        if (path.extname(file.originalname) == ".md" && file.mimetype == "text/markdown") {
          console.log("choosing filename for markdown file");
          cb(null, file.originalname);
        } else if (file.mimetype == "image/jpeg") {
          console.log("choosing filename for image file");
          cb(null, file.originalname);
        }
      }
    });
  }

  _mutlerFilesFilter(req, file, cb) {
    console.log("filtering file");
    var extension = path.extname(file.originalname);
    // TODO: Faire un check de la taille de l'image (seulement)
    // voir objet "limits" via la configuration de multer
  
    if (extension == ".md" && file.mimetype == "text/markdown") {
      console.log("markdown file was ok");
      cb(null, true);
    } else if (file.mimetype == "image/jpeg" && (extension == ".jpg" || extension == ".jpeg")) {
      console.log("jpeg image file was ok");
      cb(null, true);
    } else {
      console.log("file was not good");
      cb(null, false);
    }
  }

  /**
   * Handle the user posted files corresponding to a memo.
   */
  multerFilesHandler() {
    var multerFilesStorage = this._multerDiskStorage(this.config.directory);
    var mutlerFilesFilter = this._mutlerFilesFilter;

    var memosUpload = multer({
      storage: multerFilesStorage,
      fileFilter: mutlerFilesFilter
    });

    var memosPostFiles = memosUpload.fields([
      {name: 'memo-file', maxCount: 1},
      {name: 'memo-image', maxCount: 1}
    ]);

    return memosPostFiles;
  }
}

exports = module.exports = Memorizer;