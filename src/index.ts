import { default as Web3 } from "web3"
import { verifyBalance } from "./api/balance"

import { cancelClaim } from "./api/cancel-claim"
import { confirmClaim } from "./api/confirm-claim"
import { callContractResponse } from "./api/contract-response"
import { createClaim } from "./api/create-claim"
import { getChapterReward } from "./api/get-reward"
import { getStake } from "./api/get-stake"
import { getTokensFromDb } from "./api/get-tokens-from-db"
import { createUser } from "./api/login"
import { setStake } from "./api/set-stake"
import {
  Address,
  ProjectId,
  TokenFromContract,
  Tokens,
  TokensFromDb,
} from "./types/types";
import {
  burn,
  claim,
  claimRewardFromContract,
  convertBalance,
  getBalanceOf,
  getLastUpdate,
  getStakedBalance,
  getTotalClaimable,
  getToxicPowerBalanceFromContract,
  getWalletOfOwner,
  stake,
} from "./utils/contract-utils";
import {
  checkEthereumInstalled,
  handleAccountChanged,
  handleChainChanged,
} from "./utils/events";
import Auth from "./utils/token";

const web3 = new Web3(Web3.givenProvider);

const PROJECT_ID = process.env.PROJECT_ID as string;

const D: Document = document;

const connectButton = D.querySelector(".connect-button") as HTMLButtonElement;
const connectedTo = D.querySelector(".connected-to") as HTMLDivElement;
const balanceWrapper = D.querySelector(".balance-wrapper") as HTMLDivElement;
const balanceText = D.querySelector(".balance-text") as HTMLDivElement;
const totalClaimable = D.querySelector(
  ".earnings_item-claim-text"
) as HTMLDivElement;
const claimButton = D.querySelector(".claim-button") as HTMLButtonElement;
const loadingState = D.getElementsByClassName(
  "loading-animation"
) as HTMLCollectionOf<HTMLDivElement>;
const totalNftsOfUser = D.querySelector(".total-nfts") as HTMLDivElement;
const totalNftsOfUserSpan = D.querySelector(
  ".rarity_low-opacity-text-span"
) as HTMLSpanElement;
const chapterReward = D.querySelector(
  ".earnings_item-game-text"
) as HTMLDivElement;
const nftLayout = D.querySelector(".owned-nfts_list-layout") as HTMLDivElement;
const saveChangesButton = D.querySelector(
  ".earnings_select-button"
) as HTMLButtonElement;
const dailyWield = D.querySelector(".daily-wield") as HTMLDivElement;
const navTopBar = D.querySelector(
  ".top-nav_connected-wrapper"
) as HTMLDivElement;
const navTopBarWrapper = D.querySelector(
  ".top-nav_buttons-wrapper"
) as HTMLDivElement;
const quantityToxicPowerShown = Array.from(
  D.getElementsByClassName(
    "quantity_toxic_power"
  ) as HTMLCollectionOf<HTMLDivElement>
);
const noToxicPowerAvailable = D.querySelector(
  ".no-toxic-power__wrapper"
) as HTMLDivElement;
const earningsItemDetailsList = Array.from(
  D.getElementsByClassName(
    "earnings_item-details-list"
  ) as HTMLCollectionOf<HTMLDivElement>
);
const earningsItemImage = Array.from(
  D.getElementsByClassName(
    "earnings_item-details-image"
  ) as HTMLCollectionOf<HTMLImageElement>
);
const burnButtonWrapper = D.querySelector(
  ".burn-button__wrapper"
) as HTMLDivElement;
const burnButton = D.querySelector(".burn-button") as HTMLButtonElement;
const quantityWrapper = Array.from(
  D.getElementsByClassName(
    "quantity-wrapper"
  ) as HTMLCollectionOf<HTMLDivElement>
);
const minusButton = Array.from(
  D.getElementsByClassName(
    "minus-button"
  ) as HTMLCollectionOf<HTMLButtonElement>
);
const sumButton = Array.from(
  D.getElementsByClassName("sum-button") as HTMLCollectionOf<HTMLButtonElement>
);
const rewardClaimButton = D.querySelector(
  ".game-claim__button"
) as HTMLButtonElement;

const convertButton = D.querySelector('.convert-button') as HTMLButtonElement;

console.log(loadingState);

let tokenStake: Tokens = [];
let tokenFromContract: Tokens = [];
let stakedBalanceFromUser = 0;
let balance = 0;
let sumToClaim = 0;
let balanceToxicPower: Array<string> = [];
const quantityToxicPowerChosen: Array<number> = [];
let sumRewardToClaim = 0;

const setError = (i: number) => {
  burnButton.classList.remove("is-hidden");
  claimButton.classList.remove("is-hidden");
  rewardClaimButton.classList.remove("is-hidden");
  saveChangesButton.classList.remove("is-hidden");
  convertButton.classList.remove("is-hidden");
  loadingState[i].classList.add("is-hidden");
};

const setLoading = (i: number) => {
  burnButton.classList.add("is-hidden");
  claimButton.classList.add("is-hidden");
  rewardClaimButton.classList.add("is-hidden");
  saveChangesButton.classList.add("is-hidden");
  convertButton.classList.add("is-hidden");
  loadingState[i].classList.remove("is-hidden");
};

const setConnectedWallet = (address: Address) => {
  connectedTo.innerText =
    "CONNECTED TO: " +
    address.substring(0, 5) +
    "..." +
    address.substring(address.length - 4, address.length);
  connectedTo.classList.remove("is-hidden");
  connectButton.classList.add("is-hidden");
  navTopBar.classList.remove("is-hidden");
  navTopBarWrapper.classList.add("is-hidden");
};

const loginUser = async (address: Address, projectId: ProjectId) => {
  try {
    const response = await createUser(address, projectId);
    const token = response?.data.token;
    if (token) {
      Auth.user.setAccessToken(token);
      Auth.user.setAuthorizationHeader(token);
    }
  } catch (err) {
    console.log(err);
  }
};

const setTotalClaimable = async (address: Address): Promise<void> => {
  const total = await getTotalClaimable(address);
  if (Number(total) !== 0) claimButton.classList.remove("is-disabled");

  totalClaimable.innerText =
    Number(web3.utils.fromWei(total, "ether")).toFixed(3) + " $SURVIVE";
  sumToClaim = +web3.utils.fromWei(total, "ether");
};

const setBalanceOf = async (address: Address): Promise<void> => {
  const userBalance: string = await getBalanceOf(address);

  balanceText.innerText = Number(
    web3.utils.fromWei(userBalance, "ether")
  ).toFixed(3);
  balanceWrapper.classList.remove("is-hidden");
  balance = +web3.utils.fromWei(userBalance, "ether");
};

const showToxicPowerInfo = (index: number, balance: string) => {
  earningsItemDetailsList[index].classList.remove("is-hidden");
  quantityToxicPowerShown[index].classList.remove("is-hidden");
  earningsItemImage[index].classList.remove("is-hidden");
  quantityToxicPowerShown[index].style.justifySelf = "end";
  quantityWrapper[index].classList.remove("is-hidden");
};

const setBalanceOfToxicPower = async (address: Address): Promise<void> => {
  let sumBalanceOfToxicPower = -1;
  noToxicPowerAvailable.classList.add("is-hidden");
  try {
    balanceToxicPower = await getToxicPowerBalanceFromContract(address);

    balanceToxicPower.forEach((quantity, i) => {
      if (Number(quantity) > 0) {
        showToxicPowerInfo(i, quantity);
        sumBalanceOfToxicPower++;
      }
    });

    if (sumBalanceOfToxicPower < 0) {
      noToxicPowerAvailable.classList.remove("is-hidden");
    } else {
      burnButtonWrapper.classList.remove("is-hidden");
    }
  } catch (error) {
    console.log(error);
  }
};

const setLastUpdate = async (address: Address) => {
  const lastUpdate = await getLastUpdate(address);

  if (Number(lastUpdate) === 0) {
    claimButton.classList.add("is-disabled");
  }
};

const setStakedBalance = async (address: Address) => {
  const stakedBalance = await getStakedBalance(address);
  stakedBalanceFromUser = stakedBalance;
};

const setWalletOfOwner = async (address: Address) => {
  const tokens: TokenFromContract = await getWalletOfOwner(address);

  let tokensFromWallet: TokenFromContract = [];
  saveChangesButton.classList.remove("is-hidden");
  tokensFromWallet = tokens;
  tokenFromContract = tokensFromWallet.map((x) => parseInt(x));
  totalNftsOfUserSpan.innerText = "(" + tokenFromContract.length + ")";
};

const showStakeInformation = async (address: Address) => {
  const response = await getStake(address, PROJECT_ID);

  if (response) {
    const { tokens } = response.data;
    tokenStake = tokens;
    tokenStake.sort();
    totalNftsOfUser.innerText = String(tokens.length);
    dailyWield.innerText = (tokens.length * 0.27369863013).toFixed(3);
  }
};

const showChapterReward = async (address: Address) => {
  const response = await getChapterReward(address);
  if (response) {
    chapterReward.innerText =
      String(response.data.storyRewards.toFixed(3)) + " $SURVIVE";
    if (response.data.storyRewards > 0) {
      // rewardClaimButton.classList.remove('is-disabled')
      sumRewardToClaim = response.data.storyRewards;
    }
  }
};

const showTokens = async () => {
  const response = await getTokensFromDb(tokenFromContract);

  if (response) {
    const tokens = response?.data;
    tokens?.forEach((info: TokensFromDb, i: number) => {
      nftLayout.classList.remove("is-hidden");
      const rarityItemContentWrapper = D.createElement("div");
      const rarityItemContent = D.createElement("div");
      const rarityItemMainContentWrapper = D.createElement("div");
      const rarityItemMainContentLayoutLeft = D.createElement("div");
      const rarityItemMainContentLayoutRight = D.createElement("div");
      const rarityItemInfoWrapperCollection = D.createElement("div");
      const rarityItemInfoWrapperRarity = D.createElement("div");
      const rarityItemInfoWrapperId = D.createElement("div");
      const rarityItemInfoWrapperRank = D.createElement("div");
      const earningsItemStatusWrapper = D.createElement("div");
      const earningsItemStatusButtonHq = D.createElement("div");
      const earningsItemStatusButtonMission = D.createElement("div");
      earningsItemStatusButtonHq.classList.add("earnings_item-status-button");
      earningsItemStatusButtonMission.classList.add(
        "earnings_item-status-button"
      );
      earningsItemStatusButtonMission.classList.add("is-selected");
      earningsItemStatusWrapper.classList.add("earnings_item-status-wrapper");
      rarityItemContentWrapper.classList.add("rarity_item-content-wrapper");
      rarityItemContent.classList.add("rarity_item-content");
      rarityItemMainContentWrapper.classList.add(
        "rarity_item-main-content-wrapper"
      );
      rarityItemMainContentLayoutLeft.classList.add(
        "rarity_item-main-content-layout"
      );
      rarityItemMainContentLayoutRight.classList.add(
        "rarity_item-main-content-layout"
      );
      rarityItemInfoWrapperCollection.classList.add("rarity_item-info-wrapper");
      rarityItemInfoWrapperRarity.classList.add("rarity_item-info-wrapper");
      rarityItemInfoWrapperId.classList.add("rarity_item-info-wrapper");
      rarityItemInfoWrapperRank.classList.add("rarity_item-info-wrapper");
      const labelCollection = D.createElement("div");
      const labelId = D.createElement("div");
      const labelRarity = D.createElement("div");
      const labelRank = D.createElement("div");
      labelCollection.classList.add("rarity_item-label");
      labelRarity.classList.add("rarity_item-label");
      labelRank.classList.add("rarity_item-label");
      labelId.classList.add("rarity_item-label");
      labelCollection.innerText = "Collection";
      labelRarity.innerText = "Rarity Score";
      labelRank.innerText = "Rank";
      labelId.innerText = "ID";
      const infoCollection = D.createElement("div");
      const infoId = D.createElement("div");
      const infoRarity = D.createElement("div");
      const infoRank = D.createElement("div");
      infoCollection.classList.add("rarity_item-text");
      infoRarity.classList.add("rarity_item-text");
      infoRank.classList.add("rarity_item-text");
      infoId.classList.add("rarity_item-text");
      infoCollection.innerText = "55Unity";
      infoRarity.innerText = info.score;
      infoRank.innerText = info.rank;
      infoId.innerText = String(tokenFromContract[i]);
      earningsItemStatusButtonHq.innerText = "Mission";
      earningsItemStatusButtonMission.innerText = "HQ";
      earningsItemStatusWrapper.appendChild(earningsItemStatusButtonHq);
      earningsItemStatusWrapper.appendChild(earningsItemStatusButtonMission);
      rarityItemInfoWrapperCollection.appendChild(labelCollection);
      rarityItemInfoWrapperCollection.appendChild(infoCollection);
      rarityItemInfoWrapperRarity.appendChild(labelRarity);
      rarityItemInfoWrapperRarity.appendChild(infoRarity);
      rarityItemMainContentLayoutLeft.appendChild(
        rarityItemInfoWrapperCollection
      );
      rarityItemMainContentLayoutLeft.appendChild(rarityItemInfoWrapperRarity);
      rarityItemInfoWrapperId.appendChild(labelId);
      rarityItemInfoWrapperId.appendChild(infoId);
      rarityItemInfoWrapperRank.appendChild(labelRank);
      rarityItemInfoWrapperRank.appendChild(infoRank);
      rarityItemMainContentLayoutRight.appendChild(rarityItemInfoWrapperId);
      rarityItemMainContentLayoutRight.appendChild(rarityItemInfoWrapperRank);
      rarityItemMainContentWrapper.appendChild(rarityItemMainContentLayoutLeft);
      rarityItemMainContentWrapper.appendChild(
        rarityItemMainContentLayoutRight
      );
      rarityItemContent.appendChild(rarityItemMainContentWrapper);
      rarityItemContentWrapper.appendChild(rarityItemContent);
      rarityItemContentWrapper.appendChild(earningsItemStatusWrapper);
      const elementImage = D.createElement("img");
      elementImage.setAttribute("src", info.imageUrl);
      elementImage.classList.add("rarity_item-image");
      const newNftCard = D.createElement("div");
      newNftCard.classList.add("owned-nfts_item-component");
      newNftCard.appendChild(elementImage);
      newNftCard.appendChild(rarityItemContentWrapper);
      nftLayout.appendChild(newNftCard);
    });
  }
};

const checkMissionButton = (i: number, button: HTMLButtonElement) => {
  return (
    tokenStake.includes(tokenFromContract[i]) && button.innerText === "Mission"
  );
};

const selectMissionButton = (
  button: HTMLButtonElement,
  buttons: HTMLButtonElement[],
  i: number
) => {
  button.classList.add("is-selected");
  buttons[i + 1].classList.remove("is-selected");
};

const selectHQButton = (
  index: number,
  button: HTMLButtonElement,
  buttons: HTMLButtonElement[],
  i: number
) => {
  const filteredtokenStake = tokenStake.filter(
    (id) => tokenFromContract[index] !== id
  );
  tokenStake = filteredtokenStake;
  button.classList.add("is-selected");
  buttons[i - 1].classList.remove("is-selected");
};

const fillInfo = async (address: Address) => {
  setConnectedWallet(address);
  await verifyBalance();
  await confirmClaim();
  await showChapterReward(address);
  await setBalanceOf(address);
  await setTotalClaimable(address);
  await setBalanceOfToxicPower(address);
  await setLastUpdate(address);
  await setStakedBalance(address);
  await setWalletOfOwner(address);
  await showStakeInformation(address);
  await showTokens();

  const buttons = Array.from(
    D.getElementsByClassName(
      "earnings_item-status-button"
    ) as HTMLCollectionOf<HTMLButtonElement>
  );

  buttons.forEach((button, i) => {
    const index = Math.floor(i / 2);
    if (checkMissionButton(index, button)) {
      selectMissionButton(button, buttons, i);
    }

    button.onclick = () => {
      if (button.innerText === "Mission") {
        if (!tokenStake.includes(tokenFromContract[index])) {
          tokenStake.push(tokenFromContract[index]);
        }
        selectMissionButton(button, buttons, i);
      } else {
        selectHQButton(index, button, buttons, i);
      }
    };
  });
};

const connectWallet = async function () {
  try {
    const accounts = await (window as any).ethereum.request({
      method: "eth_requestAccounts",
    });
    if (accounts.length > 0) {
      await loginUser(accounts[0], PROJECT_ID);
      await fillInfo(accounts[0]);
    }
  } catch (error) {
    console.log(error);
  }
};

const showClaimToken = () => {
  claimButton.classList.remove("is-hidden");
  loadingState[1].classList.add("is-hidden");
  balance += sumToClaim;
  balanceText.innerText = Number(balance).toFixed(3);
  claimButton.classList.add("is-disabled");
  totalClaimable.innerText = "0 $SURVIVE";
  saveChangesButton.classList.remove("is-hidden");
};

const claimToken = async function () {
  setLoading(1);
  try {
    const accounts = await (window as any).ethereum.request({
      method: "eth_accounts",
    });
    if (accounts.length !== 0) {
      await claim(accounts[0]);
      showClaimToken();
    }
  } catch (error) {
    claimButton.classList.remove("is-hidden");
    burnButton.classList.remove("is-hidden");
    setError(1);
  }
};

const claimReward = async () => {
  setLoading(2);
  try {
    const accounts = await (window as any).ethereum.request({
      method: "eth_accounts",
    });
    const response = await createClaim(
      accounts[0],
      +sumRewardToClaim,
      +balance
    );
    if (response) {
      const { id, signature } = response.data;
      await claimRewardFromContract(
        accounts[0],
        signature.v,
        signature.r,
        signature.s,
        id,
        Math.ceil(sumRewardToClaim)
      );
      await callContractResponse();
      await setBalanceOf(accounts[0]);
      loadingState[2].classList.add("is-hidden");
      rewardClaimButton.classList.remove("is-hidden");
      claimButton.classList.remove("is-hidden");
      saveChangesButton.classList.remove("is-hidden");
      chapterReward.innerText = "0 $SURVIVE";
    }
  } catch (err) {
    setError(2);
    console.log(err);
    const accounts = await (window as any).ethereum.request({
      method: "eth_accounts",
    });
    await cancelClaim();
  }
};

const saveChanges = async function () {
  setLoading(0);
  const accounts = await (window as any).ethereum.request({
    method: "eth_accounts",
  });
  if (accounts.length !== 0) {
    if (tokenStake.length !== Number(stakedBalanceFromUser)) {
      if (tokenStake.length === 0) {
        const answer = window.confirm(
          "There are no heroes on mission. Are you sure you want to continue?"
        );
        if (answer) {
          await stake(accounts[0], tokenStake.length);
          await setStake(accounts[0], PROJECT_ID, tokenStake);
          await setTotalClaimable(accounts[0]);
          await setBalanceOf(accounts[0]);
          await setStakedBalance(accounts[0]);
          await showStakeInformation(accounts[0]);
          saveChangesButton.classList.remove("is-hidden");
          claimButton.classList.remove("is-hidden");
          burnButton.classList.remove("is-hidden");
          loadingState[0].classList.add("is-hidden");
        } else {
          setError(0);
        }
      } else {
        await stake(accounts[0], tokenStake.length);
        await setStake(accounts[0], PROJECT_ID, tokenStake);
        await setTotalClaimable(accounts[0]);
        await setBalanceOf(accounts[0]);
        await setStakedBalance(accounts[0]);
        await showStakeInformation(accounts[0]);
        claimButton.classList.remove("is-hidden");
        burnButton.classList.remove("is-hidden");
        saveChangesButton.classList.remove("is-hidden");
        loadingState[0].classList.add("is-hidden");
      }
    } else {
      await setStake(accounts[0], PROJECT_ID, tokenStake);
      await setTotalClaimable(accounts[0]);
      await setBalanceOf(accounts[0]);
      await setStakedBalance(accounts[0]);
      await showStakeInformation(accounts[0]);
      claimButton.classList.remove("is-hidden");
      burnButton.classList.remove("is-hidden");
      saveChangesButton.classList.remove("is-hidden");
      loadingState[0].classList.add("is-hidden");
    }
  }
};

const burnToxicPower = async () => {
  console.log(balanceToxicPower);
  setLoading(2);
  try {
    const accounts = await web3.eth.getAccounts();

    await burn(accounts[0], quantityToxicPowerChosen);

    await setBalanceOf(accounts[0]);

    await setBalanceOfToxicPower(accounts[0]);

    claimButton.classList.remove("is-hidden");
    burnButton.classList.remove("is-hidden");
    setError(2);
  } catch (err) {
    console.log(err);
    setError(2);
  }
};

const checkUserToken = async (address: Address, projectId = PROJECT_ID) => {
  try {
    const token = Auth.user.getAccessToken();
    if (token) {
      Auth.user.setAuthorizationHeader(token);
    } else {
      Auth.user.logout();
      await loginUser(address, projectId);
    }
  } catch (err) {
    console.log(err);
  }
};

const checkUserIsConnected = async () => {
  try {
    const accounts = await web3.eth.getAccounts();

    if (accounts.length > 0) {
      await checkUserToken(accounts[0]);

      await fillInfo(accounts[0]);
    }
  } catch (error) {
    console.log(error);
  }
};

checkUserIsConnected();

sumButton.forEach(
  (button, i) =>
  (button.onclick = () => {
    if (
      Number(quantityToxicPowerShown[i].innerText) <
      Number(balanceToxicPower[i])
    ) {
      let temp = Number(quantityToxicPowerShown[i].innerText);
      temp++;
      quantityToxicPowerShown[i].innerText = String(temp);
      quantityToxicPowerChosen.push(i);
      quantityToxicPowerChosen.sort();
      if (quantityToxicPowerChosen.length > 0) {
        burnButton.classList.remove("is-disabled");
      }
    }
  })
);

minusButton.forEach(
  (button, i) =>
  (button.onclick = () => {
    if (Number(quantityToxicPowerShown[i].innerText) > 0) {
      let temp = Number(quantityToxicPowerShown[i].innerText);
      temp--;
      quantityToxicPowerShown[i].innerText = String(temp);
      const element = i;
      const index = quantityToxicPowerChosen.indexOf(element);
      if (index > -1) {
        quantityToxicPowerChosen.splice(index, 1);
      }
      quantityToxicPowerChosen.sort();
      if (quantityToxicPowerChosen.length === 0) {
        burnButton.classList.add("is-disabled");
      }
    }
  })
);

const convertToken = async () => {
  setLoading(3)
  try {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length > 0) {
      const userBalance: string = await getBalanceOf(accounts[0]);
      console.log(userBalance)
      await convertBalance(accounts[0], userBalance);
      const response = await verifyBalance();
      if (response) {
        balanceText.innerText = response.data.balance.toString()
        chapterReward.innerText = response.data.storyRewards.toFixed(3)
      }
      loadingState[3].classList.add('is-hidden')
      convertButton.classList.remove('is-hidden')
      saveChangesButton.classList.remove('is-hidden')
      claimButton.classList.remove("is-hidden");
      rewardClaimButton.classList.remove("is-hidden");
    }
  } catch (error) {
    console.log(error)
    setError(3)
  }
}

rewardClaimButton.addEventListener("click", claimReward);
saveChangesButton.addEventListener("click", saveChanges);
claimButton.addEventListener("click", claimToken);
connectButton.addEventListener("click", connectWallet);
burnButton.addEventListener("click", burnToxicPower);
convertButton.addEventListener("click", convertToken);

const hasMetamask = checkEthereumInstalled();
if (!hasMetamask) {
  connectedTo.innerText = "PLEASE INSTALL METAMASK";
  navTopBar.classList.remove("is-hidden");
  connectedTo.classList.remove("is-hidden");
  connectButton.classList.add("is-hidden");
  balanceWrapper.classList.add("is-hidden");
}

(window as any).ethereum.on("chainChanged", (chainId: string) =>
  handleChainChanged(chainId, connectedTo, connectButton)
);

(window as any).ethereum.on("accountsChanged", handleAccountChanged);
