const express = require('express');
const fs = require('fs');
const path = require('path');

var router = express.Router();

var config = {
  markdown: {
    directory: "../memos/",
    template: "../views/memo.pug"
  }
}

router.get('/', function (req, res){
  res.redirect('summary');
});

router.get('/summary', function (req, res) {
  fs.readdir(path.join(__dirname, config.markdown.directory), {withFileTypes: true}, function(err, files) {
    // Construction de la liste des noms des fichiers markdown
    markdownFiles = []
    for (const file of files) {
      if (file.isFile()) {
        filename = path.parse(path.basename(file.name)).name;
        console.log("loading memo tile for: " + filename);
        markdownFiles.push(filename);
      }
    }

    // construction des tuiles pour la vue
    tiles = []
    for (let index = 0; index < markdownFiles.length; index++) {
      const element = markdownFiles[index];
      if (index % 3 == 0) {
        tiles.push([]);
      }
      tiles[Math.floor(index / 3)].push(element);
    }

    // sending the view with its variables
    res.render("summary", {
      summaryTitle: "Sommaire des memos",
      tiles: tiles
    });
  });
});

router.get('/show/:memo', function (req, res) {
  // octicons.markdown.toSVG()
  var filePath = path.join(__dirname, config.markdown.directory, req.params.memo + '.md');
  fs.readFile(filePath, {encoding: 'utf-8'}, function (err, content) {
    if (err) {
      console.log("error while loading memo called " + req.params.memo);
      res.send("nope"); // TODO: redirect with error
    } else {
      console.log("loading memo called" + req.params.memo);
      
      console.log(path.join(__dirname, config.markdown.template));
      res.render("memo", {
        title: "Memo: " + req.params.memo,
        content: content
      });
    }
  })
});

router.get('/image/:memo', function (req, res) {
  imagesDirectory = path.join(__dirname, config.markdown.directory, 'images');
  res.sendFile(path.join(imagesDirectory, req.params.memo + '.jpg'), function(err) {
    if (err) {
      console.log("error while sending image file");
    } else {
      console.log("image successfully sent");
    }
  })
});

module.exports = router;