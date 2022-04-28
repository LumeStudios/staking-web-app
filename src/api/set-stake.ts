import axios from 'axios'
import { Address, ApiResult, ProjectId, Tokens } from '../types/types';

export const setStake = async (address: Address, projectId: ProjectId, tokens: Tokens): ApiResult<void> => {
    try {
        await axios.post(
            process.env.SERVER + '/users/set-staked',
            { address, projectId, tokens },
        );
    } catch (error) {
        console.log(error);
    }
    return;
};