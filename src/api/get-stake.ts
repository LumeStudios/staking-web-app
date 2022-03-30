import axios from "axios";
import { Address, ApiResult, ProjectId, Tokens } from "../types/types";

export const getStake = async (address: Address, projectId: ProjectId): ApiResult<{ tokens: Tokens }> => {
    try {
        const response = await axios.get(
            process.env.SERVER + '/users/get-staked',
            {
                params: { address, projectId },
                headers: {
                    authentication:
                        process.env.AUTHENTICATION as string,
                },
            }
        );
        return response;
    } catch (error) {
        console.log(error);
    }
    return;
};