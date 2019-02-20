const express = require('express');
const fs = require('fs');
const path = require('path');
const memorizer = require('../memorizer/memorizer');

var memos = new memorizer('dummy', {
  directory: "memos/"
});

var router = express.Router();

/**
 * Produce a list of list by tiling the originalArray.
 * 
 * @param {int} tileAmount amount of tiles per ligne
 * @param {*} originalArray the array to tile
 */
function tiler(tileAmount, originalArray) {
  tiles = [];

  for (let index = 0; index < originalArray.length; index++) {
    const element = originalArray[index];
    if (index % tileAmount == 0) {
      tiles.push([]);
    }
    tiles[Math.floor(index / tileAmount)].push(element);
  }

  return tiles;
}

/**
 * Permet de supprimer les fichiers qui aurait été upload alors qu'un
 * des fichiers n'était pas correct
 * 
 * @param {multer.File} files liste de fichier au sens de Multer:
 *                            https://www.npmjs.com/package/multer#file-information
 */
function removeUploadedFile(files) {
  for (const file in files) {
    if (file) {
      fs.unlink(file.path, function(err) {
        if (err) {
          if (err.code === "ENOENT") {
            console.log("nothing to suppress, file does not exists");
          }
        } else {
          console.log("suppressed file");
        }
      });
    }
  }
}

router.get('/', function (req, res){
  res.redirect('summary');
});

router.get('/summary', function (req, res) {
  memos.listAll(function (markdownFiles) {
    res.render("summary", {
      summaryTitle: "Sommaire des memos",
      tiles: tiler(3, markdownFiles)
    });
  });
});

router.get('/add', function (req, res) {
  res.render('add');
})

router.post('/add', memos.multerFilesHandler(), function(req, res) {
  // TODO: Ask Hugo C. to improve the way we handle uploaded files
  memoFile = req.files['memo-file'];
  memoImage = req.files['memo-image'];
  console.log(req.files);

  if (memoFile === undefined) {
      console.log("memoFile was filtered");
      removeUploadedFile([memoFile, memoImage]);
      res.status(415).redirect("/add");
  }
  if (memoImage === undefined) {
      console.log("memoImage was filtered");
      removeUploadedFile([memoFile, memoImage]);
      res.status(415).redirect("/add");
  }

  console.log("added files to database");
  res.render('add')
})

router.get('/show/:memo', function (req, res) {
  memos.show(req.params.memo, function(markdownContent) {
    res.render("memo", {
      title: "Memo: " + req.params.memo,
      content: markdownContent
    });
  });
});

router.get('/image/:memo', function (req, res) {
  res.sendFile(memos.imagePath(req.params.memo), function(err) {
    if (err) {
      console.log("error while sending image file");
    } else {
      console.log("image successfully sent");
    }
  })
});

module.exports = router;