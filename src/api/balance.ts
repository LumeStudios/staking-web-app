import axios from "axios";
import { ApiResult, BalanceCheck } from "../types/types";

export const verifyBalance = async (): ApiResult<BalanceCheck> => {
    try {
        return await axios.get(
            process.env.SERVER + `/users/balance/`,
        );
    } catch (error) {
        console.log(error);
    }

    return;
};