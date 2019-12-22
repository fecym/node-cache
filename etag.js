const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')
// hash 加密用
const crypto = require('crypto')
const PORT = 6543

http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname
  if (pathname === '/') {
    const filename = path.resolve(__dirname, './files/etag.txt')
    fs.stat(filename, (err, stat) => {
      if (err) {
        res.statusCode = 404
        return res.end('Not Fount')
      }
      if (stat.isFile()) {
        // Etag 的实体内容，根据文件的内容计算出一个唯一的 hash 值
        const md5 = crypto.createHash('md5')
        const rs = fs.createReadStream(filename)
        // 要先写入响应头在写入响应体
        const arr = []
        rs.on('data', chunk => {
          md5.update(chunk)
          arr.push(chunk)
        })
        rs.on('end', () => {
          const etag = md5.digest('base64')
          if (req.headers['if-none-match'] === etag) {
            console.log(req.headers['if-none-match'])
            console.log('文件未改动')
            res.statusCode = 304
            return res.end()
          }
          console.log('没有走缓存')
          // 让浏览器以 utf8 格式解析文本
          res.setHeader('Content-Type', 'text/plain; charset=utf8')
          res.setHeader('Etag', etag)
          res.end(Buffer.concat(arr))
        })
      }
    })
  }
}).listen(PORT)