const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')
const PORT = 3456

http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname
  if (pathname === '/') {
    const filename = path.resolve(__dirname, './files/1.txt')
    fs.stat(filename, (err, stat) => {
      if (err) {
        res.statusCode = 404
        return res.end('Not Fount')
      }
      if (stat.isFile()) {
        const timeGMT = stat.ctime.toGMTString()
        console.log(timeGMT)
        if (req.headers['if-modified-since'] === timeGMT) {
          console.log('文件未改动')
          res.statusCode = 304
          return res.end()
        }
        // 让浏览器以 utf-8 格式解析文本
        res.setHeader('Content-Type', 'text/plain; charset=utf-8',)
        res.setHeader('Last-Modified', timeGMT)
        console.log('没有走缓存')
        fs.createReadStream(filename).pipe(res)
      }
    })
  }
}).listen(PORT)