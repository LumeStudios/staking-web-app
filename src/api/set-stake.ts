import axios from 'axios'
import { Address, ApiResult, ProjectId, Tokens } from '../types/types';

export const setStake = async (address: Address, projectId: ProjectId, tokensId: Tokens): ApiResult<void> => {
    try {
        await axios.post(
            process.env.SERVER + '/set-staked',
            { address, projectId, tokensId },
            {
                headers: {
                    authentication:
                        process.env.AUTHENTICATION as string,
                },
            }
        );
    } catch (error) {
        console.log(error);
    }
    return;
};