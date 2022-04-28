import axios from "axios";
import { Address, ApiResult, ProjectId } from "../types/types";

export const createUser = async (address: Address, projectId: ProjectId): ApiResult<{ token: string, address: string, _v: number, _id: number }> => {
    try {
        return await axios.post(
            process.env.SERVER + '/auth/login',
            { address, projectId },
        );
    } catch (error) {
        console.log(error);
    }

    return;
};