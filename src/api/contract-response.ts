import axios from "axios";
import { Address, ApiResult } from "../types/types";

export const callContractResponse = async (): ApiResult<void> => {
    try {
        return await axios.put(
            process.env.SERVER + `/claim/contract-response/`,
        );
    } catch (error) {
        console.log(error);
    }

    return;
};