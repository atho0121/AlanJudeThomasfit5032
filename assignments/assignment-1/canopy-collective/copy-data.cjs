const fs = require('fs')
fs.cpSync('src/data', 'functions/data', { recursive: true })