import * as axios from 'axios';
import { getToken } from '../get-token';

export class PersonUtils {
    public static async getPerson(givenPersons: any) {
        const persons = [];

        for (const personId of givenPersons) {
            const currData = await axios.default.
                get(`${process.env.KARTOFFEL_URL}/api/persons/${personId}`,
                    { headers: { authorization: await getToken() } });
            persons.push(currData.data);
        }

        return persons;
    }
}
