import axios from "axios";
import { Address, ApiResult, ProjectId, Tokens } from "../types/types";

export const getStake = async (address: Address, projectId: ProjectId): ApiResult<{ tokens: Tokens }> => {
    try {
        return await axios.get(
            process.env.SERVER + `/users/get-staked/${projectId}`,
        );
    } catch (error) {
        console.log(error);
    }
    return;
};