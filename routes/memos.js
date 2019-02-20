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