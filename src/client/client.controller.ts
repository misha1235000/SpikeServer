// client.controller

import { Request, Response } from 'express';
import { OAuth2Controller } from '../oauth2/oauth2.controller';
import { LOG_LEVEL, log, parseLogData } from '../utils/logger';
import { IClientBasicInformation, IClientInformation, OAuth2Parser } from '../oauth2/oauth2.parser';
import { ClientRepository } from './client.repository';
import { TeamRepository } from '../team/team.repository';
import { IClient } from './client.interface';
import { InvalidParameter, NotFound, DuplicateUnique, BadRequest } from '../utils/error';
import { Types } from 'mongoose';
import { ScopeRepository } from '../scope/scope.repository';

export class ClientController {
    static readonly CLIENT_MESSAGES = {
        INVALID_PARAMETER: 'Client information or team id parameter is missing.',
        CLIENT_NOT_FOUND: 'Clients not found.',
        ID_PARAMETER_MISSING: 'id Parameter is missing.',
        CLIENT_IDS_PARAMETER_MISSING: 'Client ids parameter is missing.',
        DUPLICATE_HOSTURI: 'Duplicate hostUri Was Given.',
        NO_STACK: 'No stack was found.',
        SUCCESSFULLY_CREATED: 'Client Successfully Created',
        GET_CLIENT_INFORMATION: 'Got Client Information from OSpike.',
        CLIENT_UNDELETABLE: 'Client cannot be deleted, need to delete scopes first.',
    };

    /**
     * Creates a new client.
     * @param req - Request
     * @param res - Response
     */
    public static async create(req: Request, res: Response) {

        // Gets the client information required for register client in authorization server.
        const clientInformation = req.body.clientInformation as IClientBasicInformation;
        const teamId = clientInformation.teamId;
        const teamName = clientInformation.teamName;
        delete clientInformation.teamId;
        delete clientInformation.teamName;

        // If there is clientInformation (data) and there is a teamId, then proceed.
        if (clientInformation) {
            // Set the all the host uris, to lower case.
            clientInformation.hostUris = clientInformation.hostUris.map(hostUri => hostUri.toLowerCase());

            // Set the client name first digit to uppercase and the other to lower.
            clientInformation.name = clientInformation.name.charAt(0).toUpperCase() +
                                     clientInformation.name.substr(1).toLowerCase();

            // Creates the client in OSpike first
            const registeredClient = await OAuth2Controller.registerClient(clientInformation);

            // Recover the deleted key - team

            // Creates the client in the Spike Server db
            await ClientRepository.create({ teamId, ...registeredClient });

            log(LOG_LEVEL.INFO, parseLogData(ClientController.CLIENT_MESSAGES.SUCCESSFULLY_CREATED,
                                             'ClientController',
                                             '200',
                                             ClientController.CLIENT_MESSAGES.NO_STACK));

            registeredClient.teamId = teamId;
            registeredClient.teamName = teamName;
            return res.status(200).send(registeredClient);
        }

        log(LOG_LEVEL.INFO, parseLogData(ClientController.CLIENT_MESSAGES.INVALID_PARAMETER,
                                         'ClientController',
                                         '400',
                                         ClientController.CLIENT_MESSAGES.NO_STACK));

        throw new InvalidParameter(ClientController.CLIENT_MESSAGES.INVALID_PARAMETER);
    }

    /**
     * Reads client's full information from the authorization server.
     * @param req - Request
     * @param res - Response
     */
    public static async read(req: Request, res: Response) {

        // Gets the client's id to read
        const clientId = req.params.clientId;

        if (clientId) {

            // Getting the client registration token associated to the client
            const clientDoc = await ClientRepository.findById(clientId);

            // Checks if the client is unexist or client not associated to the team
            // (we do that to avoid exposing our db to user who performs information gathering attacks)
            if (!clientDoc) {
                log(LOG_LEVEL.INFO, parseLogData(ClientController.CLIENT_MESSAGES.INVALID_PARAMETER,
                                                 'ClientController',
                                                 '400',
                                                 ClientController.CLIENT_MESSAGES.NO_STACK));

                throw new InvalidParameter(ClientController.CLIENT_MESSAGES.INVALID_PARAMETER);
            }

            // Gettting all client's scopes to determine if it deletable
            const isDeletable = (await ScopeRepository.findByAudienceId(clientDoc.audienceId)).length === 0;

            const clientAfterRead = await OAuth2Controller.readClientInformation(clientId, clientDoc.token);
            clientAfterRead.teamId = clientDoc.teamId;
            clientAfterRead.isDeletable = isDeletable;
            return res.status(200).send(clientAfterRead);
        }

        log(LOG_LEVEL.INFO, parseLogData(this.CLIENT_MESSAGES.INVALID_PARAMETER,
                                         'ClientController',
                                         '400',
                                         ClientController.CLIENT_MESSAGES.NO_STACK));

        throw new InvalidParameter(this.CLIENT_MESSAGES.INVALID_PARAMETER);
    }

    /**
     * Get all clients with sorting and pagination.
     * @param req - Request
     * @param res - Response
     */
    public static async getAllClients(req: Request, res: Response) {
        const sort = req.query.sort || ClientRepository.SortOptions.NAME;
        const desc = parseInt(req.query.desc, 10) === 1 ? true : false;
        let limit = parseInt(req.query.limit, 10);
        let skip = parseInt(req.query.skip, 10);
        let teams = [];

        // Validate limit value
        if (isNaN(limit) || limit > 50 || limit <= 0) {
            limit = 50;
        }

        // Validate skip value
        if (isNaN(skip) || skip < 0) {
            skip = 0;
        }

        // Need to pass the teams of the user to filter only the permitted clients of the user teams.
        if (req.person) {
            teams = (await TeamRepository.findByUserId(req.person.genesisId)).map(team => team._id);
        }

        const clients = await ClientRepository.find(limit, skip, sort, desc, teams);

        return res.status(200).send(clients);
    }

    /**
     * Get client's active tokens count list.
     * @param req - Request
     * @param res - Response
     */
    public static async getClientActiveTokens(req: Request, res: Response) {

        // Gets the client's id to read
        const clientId = req.params.clientId;

        if (clientId) {

            // Getting the client registration token associated to the client
            const clientDoc = await ClientRepository.findById(clientId);

            // Checks if the client is unexist or client not associated to the team
            // (we do that to avoid exposing our db to user who performs information gathering attacks)
            if (!clientDoc) {
                log(
                    LOG_LEVEL.INFO,
                    parseLogData(
                        ClientController.CLIENT_MESSAGES.INVALID_PARAMETER,
                        'ClientController',
                        '400',
                        ClientController.CLIENT_MESSAGES.NO_STACK,
                    ),
                );

                throw new InvalidParameter(ClientController.CLIENT_MESSAGES.INVALID_PARAMETER);
            }

            // Get client's active tokens count list from the authorization server
            const activeTokenList = await OAuth2Controller.getClientActiveTokens(clientId, clientDoc.token);

            return res.status(200).send(activeTokenList);
        }

        log(
            LOG_LEVEL.INFO,
            parseLogData(
                this.CLIENT_MESSAGES.INVALID_PARAMETER,
                'ClientController',
                '400',
                ClientController.CLIENT_MESSAGES.NO_STACK,
            ),
        );

        throw new InvalidParameter(this.CLIENT_MESSAGES.INVALID_PARAMETER);
    }

    /**
     * Get all permitted scopes available to a given client.
     * @param req - Request
     * @param res - Response
     */
    public static async getClientPermittedScopes(req: Request, res: Response) {

        // Gets the client's id
        const clientId = req.params.clientId;
        const sort = req.query.sort || ScopeRepository.SortOptions;
        const desc = parseInt(req.query.desc, 10) === 1 ? true : false;

        if (clientId) {

            // Get client's permitted scopes list (The list is list of clients, which contains scopes array)
            const clientsPermittedScopes = await ScopeRepository.findPermittedScopes(clientId, sort, desc);

            return res.status(200).send(clientsPermittedScopes);
        }

        log(
            LOG_LEVEL.INFO,
            parseLogData(
                this.CLIENT_MESSAGES.INVALID_PARAMETER,
                'ClientController',
                '400',
                ClientController.CLIENT_MESSAGES.NO_STACK,
            ),
        );

        throw new InvalidParameter(this.CLIENT_MESSAGES.INVALID_PARAMETER);
    }

    /**
     * Find all clients of a specified team id.
     * @param req - Request
     * @param res - Response
     */

    public static async findByToken(req: Request, res: Response) {
        const jwtToken = (req.headers['authorization'] as string).split('.')[1];
        const jwtDecrypt = JSON.parse(Buffer.from(jwtToken, 'base64').toString());
        const teams = await TeamRepository.findByUserId(jwtDecrypt.genesisId);
        if (teams) {
            const teamIds = teams.map((team) => { return Types.ObjectId(team._id); });
            const returnedClients: IClient[] | null = await ClientRepository.findByTeamIds(teamIds);

            if (!returnedClients) {
                log(LOG_LEVEL.INFO, parseLogData(ClientController.CLIENT_MESSAGES.CLIENT_NOT_FOUND,
                                                 'ClientController',
                                                 '404',
                                                 ClientController.CLIENT_MESSAGES.NO_STACK));

                throw new NotFound(ClientController.CLIENT_MESSAGES.CLIENT_NOT_FOUND);
            }

            return res.status(200).send(returnedClients);
        }

        log(LOG_LEVEL.INFO, parseLogData(ClientController.CLIENT_MESSAGES.INVALID_PARAMETER,
                                         'ClientController',
                                         '400',
                                         ClientController.CLIENT_MESSAGES.NO_STACK));

        throw new InvalidParameter(ClientController.CLIENT_MESSAGES.ID_PARAMETER_MISSING);
    }

    /**
     * Find many clients by ids array
     * @param req - Request
     * @param res - Response
     */
    public static async findByIds(req: Request, res: Response) {
        const clientIds = req.body.clientIds;

        // Check if client ids provided
        if (clientIds) {
            return res.status(200).send(await ClientRepository.findByIds(clientIds));
        }

        // Client ids parameter missing
        log(LOG_LEVEL.INFO,
            parseLogData(
                ClientController.CLIENT_MESSAGES.CLIENT_IDS_PARAMETER_MISSING,
                'ClientController',
                '400',
                ClientController.CLIENT_MESSAGES.NO_STACK,
            ),
        );

        throw new InvalidParameter(ClientController.CLIENT_MESSAGES.CLIENT_IDS_PARAMETER_MISSING);
    }

    /**
     * Fuzzy searching client by name.
     * @param req - Request
     * @param res - Response
     */
    public static async searchByName(req: Request, res: Response) {
        const view = req.query.view === 'true';

        // Check if name is given
        if (req.query.name) {

            let clients = [];

            // If the search was made from the dashboard
            if (view) {

                // const population = [
                //     { path: 'teamId', select: 'teamname desc ownerId' },
                //     { path: 'scopes', select: 'value type description permittedClients -audienceId' },
                // ];
                // const selection = 'name description clientId audienceId';

                // clients = (await ClientRepository.searchByName(req.query.name, selection, population)).map((client: any) => {
                //     const clientObj = client.toJSON();
                //     if (clientObj.teamId) {
                //         clientObj.team = { ...clientObj.teamId };
                //         delete clientObj.teamId;
                //     }

                //     return clientObj;
                // });
                let teams = [];

                // Need to pass the teams of the user to filter only the permitted clients of the user teams.
                if (req.person) {
                    teams = (await TeamRepository.findByUserId(req.person.genesisId)).map(team => team._id);
                }

                clients = await ClientRepository.searchByNameWithAggregation(req.query.name, teams);
                
            } else {

                // Find all clients with fuzzy search
                clients = await ClientRepository.searchByName(req.query.name);
            }

            // If there's clients
            if (clients) {
                return res.status(200).send(clients);
            }
        }

        // Name is not given or no clients was found
        throw new NotFound('Clients not found');
    }

    /**
     * Updates an old client with a new one.
     * @param req - Request
     * @param res - Response
     */
    public static async update(req: Request, res: Response) {

        // Gets the client information required for register client in authorization server
        const clientInformation = req.body.clientInformation as Partial<IClientBasicInformation>;
        const clientId = req.params.clientId;

        if (Object.keys(clientInformation).length > 0 && clientId) {

            // Getting the client registration token associated to the client
            const clientDoc = await ClientRepository.findById(clientId);

            // Checks if the client is unexist or client not associated to the team
            // (we do that to avoid exposing our db to user who performs information gathering attacks)
            if (!clientDoc) {
                log(LOG_LEVEL.INFO, parseLogData(ClientController.CLIENT_MESSAGES.INVALID_PARAMETER,
                                                 'ClientController',
                                                 '400',
                                                 ClientController.CLIENT_MESSAGES.NO_STACK));

                throw new InvalidParameter(this.CLIENT_MESSAGES.INVALID_PARAMETER);
            }

            // If there are hostUris (Data), then set them all to lowercase.
            if (clientInformation.hostUris) {
                clientInformation.hostUris = clientInformation.hostUris.map(hostUri => hostUri.toLowerCase());
                const setHostUris = new Set(clientInformation.hostUris);

                if (clientInformation.hostUris.length !== setHostUris.size) {
                    log(LOG_LEVEL.INFO, parseLogData(ClientController.CLIENT_MESSAGES.DUPLICATE_HOSTURI,
                                                     'ClientController',
                                                     '400',
                                                     ClientController.CLIENT_MESSAGES.NO_STACK));

                    throw new DuplicateUnique(ClientController.CLIENT_MESSAGES.DUPLICATE_HOSTURI);
                }
            }

            const updatedClient = await OAuth2Controller.updateClientInformation(clientId,
                                                                                 clientInformation,
                                                                                 clientDoc.token);
            // Update the client metadata in client model
            await clientDoc.update(OAuth2Parser.parseClientInfoToModel(updatedClient));

            return res.status(200).send(updatedClient);
        }

        log(LOG_LEVEL.INFO, parseLogData(ClientController.CLIENT_MESSAGES.INVALID_PARAMETER,
                                         'ClientController',
                                         '400',
                                         ClientController.CLIENT_MESSAGES.NO_STACK));

        throw new InvalidParameter(ClientController.CLIENT_MESSAGES.INVALID_PARAMETER);
    }

    /**
     * Reset client credentials by specified id.
     * @param req - Request
     * @param res - Response
     */
    public static async reset(req: Request, res: Response) {
        const clientId = req.params.clientId;

        if (clientId) {

            // Getting the client registration token associated to the client
            const clientDoc = await ClientRepository.findById(clientId);

            // Checks if the client is unexist or client not associated to the team
            // (we do that to avoid exposing our db to user who performs information gathering attacks)
            if (!clientDoc) {
                log(LOG_LEVEL.INFO, parseLogData(ClientController.CLIENT_MESSAGES.INVALID_PARAMETER,
                                                 'ClientController',
                                                 '400',
                                                 ClientController.CLIENT_MESSAGES.NO_STACK));

                throw new InvalidParameter(ClientController.CLIENT_MESSAGES.INVALID_PARAMETER);
            }

            // Resetting client credentials and update in local db
            const updatedClient = await OAuth2Controller.resetClientCredentials(clientId, clientDoc.token);
            // await ClientRepository.update(clientId, { clientId: updatedClient.clientId });

            return res.status(200).send(updatedClient);
        }

        log(LOG_LEVEL.INFO, parseLogData(ClientController.CLIENT_MESSAGES.INVALID_PARAMETER,
                                         'ClientController',
                                         '400',
                                         ClientController.CLIENT_MESSAGES.NO_STACK));

        throw new InvalidParameter(ClientController.CLIENT_MESSAGES.INVALID_PARAMETER);
    }

    /**
     * Deletes a client by a specified id.
     * @param req - Request
     * @param res - Response
     */
    public static async delete(req: Request, res: Response) {
        const clientId = req.params.clientId;

        if (clientId) {

            // Getting the client registration token associated to the client
            const clientDoc = await ClientRepository.findById(clientId);

            // Checks if the client is unexist or client not associated to the team
            // (we do that to avoid exposing our db to user who performs information gathering attacks)
            if (!clientDoc) {
                log(LOG_LEVEL.INFO, parseLogData(ClientController.CLIENT_MESSAGES.INVALID_PARAMETER,
                                                 'ClientController',
                                                 '400',
                                                 ClientController.CLIENT_MESSAGES.NO_STACK));

                throw new InvalidParameter(ClientController.CLIENT_MESSAGES.INVALID_PARAMETER);
            }

            // Checking if the client has scopes (so he cant be deleted)
            const isDeletable = (await ScopeRepository.findByAudienceId(clientDoc.audienceId)).length === 0;

            // If client undeletable
            if (!isDeletable) {
                log(
                    LOG_LEVEL.INFO,
                    parseLogData(
                        ClientController.CLIENT_MESSAGES.CLIENT_UNDELETABLE,
                        'ClientController',
                        '400',
                        ClientController.CLIENT_MESSAGES.NO_STACK,
                    ),
                );

                throw new BadRequest(ClientController.CLIENT_MESSAGES.CLIENT_UNDELETABLE);
            }

            // First delete the client from OSpike
            await OAuth2Controller.deleteClient(clientId, clientDoc.token);

            // Than if succeed, delete the client from our db
            await clientDoc.remove();

            return res.sendStatus(204);
        }

        log(LOG_LEVEL.INFO, parseLogData(ClientController.CLIENT_MESSAGES.INVALID_PARAMETER,
                                         'ClientController',
                                         '400',
                                         ClientController.CLIENT_MESSAGES.NO_STACK));

        throw new InvalidParameter(ClientController.CLIENT_MESSAGES.INVALID_PARAMETER);
    }
}
