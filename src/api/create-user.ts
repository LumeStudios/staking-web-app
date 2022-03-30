import axios from "axios";
import { Address, ApiResult, ProjectId } from "../types/types";

export const createUser = async (address: Address, projectId: ProjectId): ApiResult<void> => {
    try {
        await axios.post(
            process.env.SERVER + '/users/create',
            { address, projectId },
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