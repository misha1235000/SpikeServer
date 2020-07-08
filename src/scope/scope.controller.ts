// scope.controller

import { Request, Response } from 'express';
import { OAuth2Controller } from '../oauth2/oauth2.controller';
import { LOG_LEVEL, log, parseLogData } from '../utils/logger';
import { ClientRepository } from '../client/client.repository';
import { TeamRepository } from '../team/team.repository';
import { IClient } from '../client/client.interface';
import { InvalidParameter, NotFound } from '../utils/error';
import { Types } from 'mongoose';
import { ScopeRepository } from './scope.repository';
import { IScope } from './scope.interface';
import { ITeam } from '../team/team.interface';

export class ScopeController {

    static readonly SCOPE_MESSAGES = {
        INVALID_INFORMATION: 'Invalid information given, user does not have teams.',
        SCOPE_NOT_FOUND: 'Scopes not found.',
        ID_PARAMETER_MISSING: 'Scope id parameter is missing.',
        SCOPE_INFORMATION_MISSING: 'Scope information parameter is missing.',
        ID_OR_INFORMATION_MISSING: 'Scope id or scope information parameter is missing.',
        CLIENT_ID_INVALID: 'Client id parameter is invalid.',
        NO_STACK: 'No stack was found.',
    };

    /**
     * Find all scopes belonging to team (by all clients which the team owns)
     * @param req - Request
     * @param res - Response
     */
    public static async findByToken(req: Request, res: Response) {
        // Extracting all teams for current user
        const teams = await TeamRepository.findByUserId(req.person.genesisId);

        if (teams) {

            // Getting all clients that belongs to the teams
            const teamIds = teams.map((team) => { return Types.ObjectId(team._id); });
            const returnedClients: IClient[] | null = await ClientRepository.findByTeamIds(teamIds);

            // If there's clients, getting all their scopes
            if (returnedClients) {
                const scopes = await ScopeRepository.findByClientIds(returnedClients.map(client => client.clientId));

                if (scopes) {
                    return res.status(200).send(scopes.map(scope => ScopeController.parseScopeData(scope)));
                }
            }

            // If there's no clients, or theres no scopes, throw not found
            log(
                LOG_LEVEL.INFO,
                parseLogData(
                    ScopeController.SCOPE_MESSAGES.SCOPE_NOT_FOUND,
                    'ScopeController',
                    '404',
                    ScopeController.SCOPE_MESSAGES.NO_STACK,
                ),
            );

            throw new NotFound(ScopeController.SCOPE_MESSAGES.SCOPE_NOT_FOUND);
        }

        log(LOG_LEVEL.INFO, parseLogData(ScopeController.SCOPE_MESSAGES.INVALID_INFORMATION,
                                         'ScopeController',
                                         '400',
                                         ScopeController.SCOPE_MESSAGES.NO_STACK));

        throw new InvalidParameter(ScopeController.SCOPE_MESSAGES.INVALID_INFORMATION);
    }

    /**
     * Find scope by id.
     * @param req - Request
     * @param res - Response
     */
    public static async findById(req: Request, res: Response) {
        const scopeId = req.params.scopeId;

        if (scopeId) {
            const scope = await ScopeRepository.findById(scopeId);

            if (scope) {
                return res.status(200).send(ScopeController.parseScopeData(scope));
            }

            // Scope not found
            log(
                LOG_LEVEL.INFO,
                parseLogData(
                    ScopeController.SCOPE_MESSAGES.SCOPE_NOT_FOUND,
                    'ScopeController',
                    '404',
                    ScopeController.SCOPE_MESSAGES.NO_STACK,
                ),
            );

            throw new NotFound(ScopeController.SCOPE_MESSAGES.SCOPE_NOT_FOUND);
        }

        // Scope id field not provided, invalid request
        log(
            LOG_LEVEL.INFO,
            parseLogData(
                ScopeController.SCOPE_MESSAGES.ID_PARAMETER_MISSING,
                'ScopeController',
                '400',
                ScopeController.SCOPE_MESSAGES.NO_STACK,
            ),
        );

        throw new InvalidParameter(ScopeController.SCOPE_MESSAGES.ID_PARAMETER_MISSING);
    }

    /**
     * Create a new scope locally and in oauth server.
     * @param req - Request
     * @param res - Response
     */
    public static async create(req: Request, res: Response) {
        const scopeInformation = req.body.scopeInformation;

        // If scope information is given
        if (scopeInformation) {

            // Get the token of the client owner
            const ownerClient = await ClientRepository.findById(scopeInformation.clientId);

            // If referenced non existing client
            if (!ownerClient) {
                throw new InvalidParameter(ScopeController.SCOPE_MESSAGES.CLIENT_ID_INVALID);
            }

            // Create the scope in the oauth2 server and locally
            await OAuth2Controller.createScope(scopeInformation, ownerClient.token);
            const createdScope = await ScopeRepository.create(scopeInformation);

            return res.status(201).send(ScopeController.parseScopeData(createdScope));
        }

        // Scope information field not provided, invalid request
        log(
            LOG_LEVEL.INFO,
            parseLogData(
                ScopeController.SCOPE_MESSAGES.SCOPE_INFORMATION_MISSING,
                'ScopeController',
                '400',
                ScopeController.SCOPE_MESSAGES.NO_STACK,
            ),
        );

        throw new InvalidParameter(ScopeController.SCOPE_MESSAGES.SCOPE_INFORMATION_MISSING);
    }

    /**
     * Update scope locally and in oauth server.
     * @param req - Request
     * @param res - Response
     */
    public static async update(req: Request, res: Response) {
        const scopeInformation = req.body.scopeInformation;
        const scopeId = req.params.scopeId;

        // If scope id parameter and the scope information are provided
        if (scopeId && Object.keys(scopeInformation).length > 0) {

            // First, get the scope and acquire the client token
            const fullScope = await ScopeRepository.findById(scopeId, { path: 'clientId', select: 'token' });

            // Scope is not found
            if (!fullScope) {
                log(LOG_LEVEL.INFO, parseLogData(ScopeController.SCOPE_MESSAGES.SCOPE_NOT_FOUND,
                                                 'ScopeController',
                                                 '400',
                                                 ScopeController.SCOPE_MESSAGES.NO_STACK));

                throw new NotFound(ScopeController.SCOPE_MESSAGES.SCOPE_NOT_FOUND);
            }

            // Scope exists, update it in oauth server and locally
            await OAuth2Controller.updateScope(scopeId, scopeInformation, (fullScope.clientId as IClient).token);
            const updatedScope = await ScopeRepository.update((fullScope.clientId as IClient).clientId, fullScope.value, scopeInformation);
            return res.status(200).send(ScopeController.parseScopeData(updatedScope as IScope));
        }

        // Scope id field or scope information not provided, invalid request
        log(
            LOG_LEVEL.INFO,
            parseLogData(
                ScopeController.SCOPE_MESSAGES.ID_OR_INFORMATION_MISSING,
                'ScopeController',
                '400',
                ScopeController.SCOPE_MESSAGES.NO_STACK,
            ),
        );

        throw new InvalidParameter(ScopeController.SCOPE_MESSAGES.ID_OR_INFORMATION_MISSING);

    }

    /**
     * Delete scope locally and in oauth server.
     * @param req - Request
     * @param res - Response
     */
    public static async delete(req: Request, res: Response) {
        const scopeId = req.params.scopeId;

        // If scope id parameter provided
        if (scopeId) {

            // Acquire full scope properties including client reference details
            const fullScope = await ScopeRepository.findById(scopeId);

            // If the scope not exists, throw not found
            if (!fullScope) {
                log(LOG_LEVEL.INFO, parseLogData(ScopeController.SCOPE_MESSAGES.SCOPE_NOT_FOUND,
                                                 'ScopeController',
                                                 '400',
                                                 ScopeController.SCOPE_MESSAGES.NO_STACK));

                throw new NotFound(ScopeController.SCOPE_MESSAGES.SCOPE_NOT_FOUND);
            }

            // First delete the scope in the oauth server, and after it delete locally
            await OAuth2Controller.deleteScope(scopeId, (fullScope.clientId as IClient).token);
            await ScopeRepository.delete(scopeId);

            return res.sendStatus(204);
        }

        // Scope id field not provided, invalid request
        log(
            LOG_LEVEL.INFO,
            parseLogData(
                ScopeController.SCOPE_MESSAGES.ID_PARAMETER_MISSING,
                'ScopeController',
                '400',
                ScopeController.SCOPE_MESSAGES.NO_STACK,
            ),
        );

        throw new InvalidParameter(ScopeController.SCOPE_MESSAGES.ID_PARAMETER_MISSING);
    }

    /**
     * Parsing scope information to readable format for web client
     * @param scopeData - Scope information to parse
     */
    private static parseScopeData(scopeData: IScope) {
        return {
            ...scopeData,
            client: {
                clientId: (scopeData.clientId as IClient).clientId,
                name: (scopeData.clientId as IClient).name,
            },
            teamname: ((scopeData.clientId as IClient).teamId as ITeam).teamname,
        };
    }
}
