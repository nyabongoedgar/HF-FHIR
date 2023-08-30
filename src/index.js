import app from './app'
import { port } from './config/vars'

app.listen(port, () => {
  console.log(`Server listening on port: ${port}`)
})
