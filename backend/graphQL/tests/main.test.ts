// load API key from ../../.env GRAPHQL_API_KEY
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '../../.env.local' });

import { eMealFaker } from '../src/util/faker/eMeal_faker';
import {
  client,
  clientWithoutAuth,
  createNewCamp,
  getCampByID,
  subscribeToCamp,
  updateCamp,
  wsClient,
} from './utils/graphql_operations';
import { firstValueFrom, lastValueFrom, take } from 'rxjs';

describe('Basic Camp Tests', () => {
  afterEach(() => {
    // TODO: clear database
  });

  it('unauthenticated user cannot create a camp', async () => {
    const camp_name = eMealFaker.camp.name();
    await expect(createNewCamp(clientWithoutAuth, camp_name)).rejects.toThrow();
  });

  it('if authenticated user can create a camp', async () => {
    const camp_name = eMealFaker.camp.name();
    expect(await createNewCamp(client, camp_name)).toBeTruthy();
  });

  it('if camp with persistent name can be created', async () => {
    const camp_name = eMealFaker.camp.name();
    const camp_id = await createNewCamp(client, camp_name);
    const camp = await getCampByID(client, camp_id);
    expect(camp.name).toBe(camp_name);
  });

  it('if camp with persistent description can be created', async () => {
    const camp_name = eMealFaker.camp.name();
    const camp_description = eMealFaker.camp.motto();
    const camp_id = await createNewCamp(client, camp_name, camp_description);
    const camp = await getCampByID(client, camp_id);
    expect(camp.description).toBe(camp_description);
  });

  it('if camp name must be at least 3 characters long', async () => {
    const camp_name = 'ab';
    await expect(createNewCamp(client, camp_name)).rejects.toThrow();

    const camp_id = await createNewCamp(client, 'abc');
    const camp = await getCampByID(client, camp_id);
    expect(camp.name).toBe('abc');
  });

  it('must pass valid uuid to fetch camp', async () => {
    await expect(getCampByID(client, 'invalid-uuid')).rejects.toThrow();
    await expect(
      getCampByID(client, '00000000-0000-0000-0000-000000000000')
    ).rejects.toThrow();

    const valid_uuid4 = '14a85a4d-b1ff-41fe-9fa6-0f214678fd22';
    await expect(getCampByID(client, valid_uuid4)).resolves.toBeTruthy();
  });

  it('if camp description cannot exceed 255 characters', async () => {
    const camp_name = eMealFaker.camp.name();
    const camp_description = eMealFaker.string.alphanumeric(256);
    await expect(createNewCamp(client, camp_name, camp_description)).rejects.toThrow();

    const camp_description_valid = eMealFaker.string.alphanumeric(255);
    const camp_id = await createNewCamp(client, camp_name, camp_description_valid);
    const camp = await getCampByID(client, camp_id);
    expect(camp.description).toBe(camp_description_valid);
  });

  it('camp can be updated', async () => {
    const camp_name = eMealFaker.camp.name();
    const camp_id = await createNewCamp(client, camp_name);
    const camp = await getCampByID(client, camp_id);
    expect(camp.name).toBe(camp_name);

    const new_camp_name = eMealFaker.camp.name();
    await expect(updateCamp(client, camp_id, new_camp_name)).resolves.toBeTruthy();

    const updated_camp = await getCampByID(client, camp_id);
    expect(updated_camp.name).toBe(new_camp_name);
  });

  it('can subscribe to camp and subscription fires on camp update', async () => {
    const camp_name = eMealFaker.camp.name();
    const camp_id = await createNewCamp(client, camp_name);
    const camp = await getCampByID(client, camp_id);
    expect(camp.name).toBe(camp_name);

    // subscribe to camp
    const observable = subscribeToCamp(wsClient, camp_id);
    expect(observable).toBeTruthy();

    const campSub1 = await firstValueFrom(observable);
    expect(campSub1.name).toBe(camp_name);

    // modify camp
    const new_camp_name = eMealFaker.camp.name();
    await expect(updateCamp(client, camp_id, new_camp_name)).resolves.toBeTruthy();

    // the next value the stream will emit should be the updated camp
    const campSub2_Promise = lastValueFrom(observable.pipe(take(1)));
    const campSub2 = await campSub2_Promise;
    expect(campSub2.name).toBe(new_camp_name);
  });
});
