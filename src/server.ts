// server

import { App } from './app';
const port = process.env.PORT || 3000;

const server = App.listen(port, () => {
    console.log('Express server listening on port ' + port);
});

export const Server = server;
