import userResolver from './user';
import merge from 'lodash.merge';

const resolvers = merge({}, userResolver);

export default resolvers;