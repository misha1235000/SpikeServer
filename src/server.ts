// server

import { App } from './app';
const port = process.env.PORT || 3001;

const server = App.listen(port, () => {
    console.log('Express server listening on port ' + port);
});
