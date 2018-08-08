import { App } from './app';
const port = process.env.PORT || 3000;


const server = App.listen(port, function() {
  console.log('Express server listening on port ' + port);
});