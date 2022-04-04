import { default as Web3 } from "web3"
import { AbiItem } from 'web3-utils'
import ABI from './contracts/ABI.json'
import ABIunity from './contracts/ABI55Unity.json'
import ABI_TOXIC_POWER from './contracts/ABI_TOXIC_POWER.json'
import { getStake } from "./api/get-stake"
import { setStake } from "./api/set-stake"
import { getTokensFromDb } from "./api/get-tokens-from-db"
import { createUser } from "./api/create-user"
import { Address, TokenFromContract, Tokens, TokensFromDb, ToxicBalance } from "./types/types"
import { checkEthereumInstalled, handleAccountChanged, handleChainChanged } from "./utils/events"

const web3 = new Web3(Web3.givenProvider);

const CONTRACT_ADDRESS_TOKEN = process.env.CONTRACT_ADDRESS_TOKEN as string
const CONTRACT_ADDRESS_55 = process.env.CONTRACT_ADDRESS_55 as string
const CONTRACT_ADDRESS_TOXIC_POWER = process.env.CONTRACT_ADDRESS_TOXIC_POWER as string
const PROJECT_ID = process.env.PROJECT_ID as string

const connectButton = document.querySelector('.connect-button') as HTMLButtonElement;
const connectedTo = document.querySelector('.connected-to') as HTMLDivElement;
const balanceWrapper = document.querySelector('.balance-wrapper') as HTMLDivElement;
const balanceText = document.querySelector('.balance-text') as HTMLDivElement;
const totalClaimable = document.querySelector('.earnings_item-claim-text') as HTMLDivElement;
const claimButton = document.querySelector('.claim-button') as HTMLButtonElement;
const loadingState = document.getElementsByClassName('loading-animation') as HTMLCollectionOf<HTMLDivElement>;
const totalNftsOfUser = document.querySelector('.total-nfts') as HTMLDivElement;
const totalNftsOfUserSpan = document.querySelector(
  '.rarity_low-opacity-text-span'
) as HTMLSpanElement;
const nftLayout = document.querySelector('.owned-nfts_list-layout') as HTMLDivElement;
const saveChangesButton = document.querySelector('.earnings_select-button') as HTMLButtonElement;
const dailyWield = document.querySelector('.daily-wield') as HTMLDivElement;
const navTopBar = document.querySelector('.top-nav_connected-wrapper') as HTMLDivElement;
const navTopBarWrapper = document.querySelector('.top-nav_buttons-wrapper') as HTMLDivElement;
const quantityToxicPower = Array.from(document.getElementsByClassName('quantity_toxic_power') as HTMLCollectionOf<HTMLDivElement>)
const noToxicPowerAvailable = document.querySelector('.no-toxic-power__wrapper') as HTMLDivElement
const earningsItemDetailsList = Array.from(document.getElementsByClassName('earnings_item-details-list') as HTMLCollectionOf<HTMLDivElement>)
const earningsItemImage = Array.from(document.getElementsByClassName('earnings_item-details-image') as HTMLCollectionOf<HTMLImageElement>)
const burnButtonWrapper = document.querySelector('.burn-button__wrapper') as HTMLButtonElement

const contractToken = new web3.eth.Contract(ABI as AbiItem[], CONTRACT_ADDRESS_TOKEN);
const contract55 = new web3.eth.Contract(ABIunity as AbiItem[], CONTRACT_ADDRESS_55);
const contractToxicPower = new web3.eth.Contract(ABI_TOXIC_POWER as AbiItem[], CONTRACT_ADDRESS_TOXIC_POWER)

let tokenStake: Tokens = [];
let tokenFromContract: Tokens = [];
let stakedBalanceFromUser = 0;
let balance = 0;
let sumToClaim = 0;

const getTotalClaimable = async (address: Address) => {
  contractToken.methods
    .getTotalClaimable(address)
    .call()
    .then((total: string) => {
      if (+total !== 0) {
        claimButton.classList.remove('is-disabled');
      }
      totalClaimable.innerText =
        Number(web3.utils.fromWei(total, 'ether')).toFixed(3) + ' $SURVIVE';
      sumToClaim = +web3.utils.fromWei(total, 'ether');
    }).catch((error: Error) => console.log(error))
};

const balanceOf = async (address: Address): Promise<void> => {
  contractToken.methods
    .balanceOf(address)
    .call()
    .then((userBalance: string) => {
      balanceText.innerText = Number(
        web3.utils.fromWei(userBalance, 'ether')
      ).toFixed(3);
      balanceWrapper.classList.remove('is-hidden');
      balance = +web3.utils.fromWei(userBalance, 'ether');
    })
    .catch((error: Error) => console.log(error));
};

const showToxicPowerInfo = (index: number, balance: string) => {
  quantityToxicPower[index].innerText = balance + 'x'
  earningsItemDetailsList[index].classList.remove('is-hidden')
  quantityToxicPower[index].classList.remove('is-hidden')
  earningsItemImage[index].classList.remove('is-hidden')
  quantityToxicPower[index].style.justifySelf = 'end'
}

const getToxicPowerBalanceFromContract = async (address: Address): Promise<Array<string>> => {

  let balanceQuantities = [];

  const array = [0, 1, 2]
  try {
    for await (let item of array) {
      const balance = await contractToxicPower.methods.balanceOf(address, item).call()
      balanceQuantities.push(balance)
    }
  } catch (error) {
    console.log(error)
  }
  return balanceQuantities
}

const balanceOfToxicPower = async (address: Address): Promise<void> => {
  let sumBalanceOfToxicPower: number = -1;

  noToxicPowerAvailable.classList.add('is-hidden')

  try {
    const balanceQuantities: Array<string> = await getToxicPowerBalanceFromContract(address)
    console.log(balanceQuantities)

    balanceQuantities.slice().reverse().forEach((quantity, i) => {
      if (Number(quantity) > 0) {
        showToxicPowerInfo(i, quantity)
        sumBalanceOfToxicPower++;
      }
    })

    if (sumBalanceOfToxicPower < 0) {
      noToxicPowerAvailable.classList.remove('is-hidden')
    } else {
      burnButtonWrapper.classList.remove('is-hidden')
    }
  } catch (error) { console.log(error) }
}

const fillInfo = async (address: Address) => {
  connectedTo.innerText =
    'CONNECTED TO: ' +
    address.substring(0, 5) +
    '...' +
    address.substring(address.length - 4, address.length);
  connectedTo.classList.remove('is-hidden');
  connectButton.classList.add('is-hidden');
  navTopBar.classList.remove('is-hidden');
  navTopBarWrapper.classList.add('is-hidden');

  await balanceOf(address);

  await getTotalClaimable(address);

  await balanceOfToxicPower(address)

  contractToken.methods
    .lastUpdate(address)
    .call()
    .then((info: string) => {
      if (+info === 0) {
        claimButton.classList.add('is-disabled');
      }
    });

  contractToken.methods
    .stakedBalance(address)
    .call()
    .then((stakedBalance: number) => {
      console.log(stakedBalance);
      stakedBalanceFromUser = stakedBalance;
      console.log('staked', stakedBalanceFromUser);
    });

  contract55.methods
    .walletOfOwner(address)
    .call()
    .then((tokens: TokenFromContract) => {
      let tokensFromWallet: TokenFromContract = []
      saveChangesButton.classList.remove('is-hidden');
      tokensFromWallet = tokens
      console.log('token from contract', tokenFromContract);
      tokenFromContract = tokensFromWallet.map((x) => parseInt(x));
      totalNftsOfUserSpan.innerText = '(' + tokenFromContract.length + ')';

      getStake(address, PROJECT_ID).then((response) => {
        if (response) {
          const { tokens } = response.data
          tokenStake = tokens;
          tokenStake.sort();
          totalNftsOfUser.innerText = String(tokens.length);
          dailyWield.innerText = (tokens.length * 0.27369863013).toFixed(3);
        }
      });

      getTokensFromDb(tokenFromContract).then((response) => {
        const tokens = response?.data;
        tokens?.forEach((info: TokensFromDb, i: number) => {
          nftLayout.classList.remove('is-hidden');
          const rarityItemContentWrapper = document.createElement('div');
          const rarityItemContent = document.createElement('div');
          const rarityItemMainContentWrapper = document.createElement('div');
          const rarityItemMainContentLayoutLeft = document.createElement('div');
          const rarityItemMainContentLayoutRight =
            document.createElement('div');
          const rarityItemInfoWrapperCollection = document.createElement('div');
          const rarityItemInfoWrapperRarity = document.createElement('div');
          const rarityItemInfoWrapperId = document.createElement('div');
          const rarityItemInfoWrapperRank = document.createElement('div');
          const earningsItemStatusWrapper = document.createElement('div');
          const earningsItemStatusButtonHq = document.createElement('div');
          const earningsItemStatusButtonMission = document.createElement('div');
          earningsItemStatusButtonHq.classList.add(
            'earnings_item-status-button'
          );
          earningsItemStatusButtonMission.classList.add(
            'earnings_item-status-button'
          );
          earningsItemStatusButtonMission.classList.add('is-selected');
          earningsItemStatusWrapper.classList.add(
            'earnings_item-status-wrapper'
          );
          rarityItemContentWrapper.classList.add('rarity_item-content-wrapper');
          rarityItemContent.classList.add('rarity_item-content');
          rarityItemMainContentWrapper.classList.add(
            'rarity_item-main-content-wrapper'
          );
          rarityItemMainContentLayoutLeft.classList.add(
            'rarity_item-main-content-layout'
          );
          rarityItemMainContentLayoutRight.classList.add(
            'rarity_item-main-content-layout'
          );
          rarityItemInfoWrapperCollection.classList.add(
            'rarity_item-info-wrapper'
          );
          rarityItemInfoWrapperRarity.classList.add('rarity_item-info-wrapper');
          rarityItemInfoWrapperId.classList.add('rarity_item-info-wrapper');
          rarityItemInfoWrapperRank.classList.add('rarity_item-info-wrapper');
          const labelCollection = document.createElement('div');
          const labelId = document.createElement('div');
          const labelRarity = document.createElement('div');
          const labelRank = document.createElement('div');
          labelCollection.classList.add('rarity_item-label');
          labelRarity.classList.add('rarity_item-label');
          labelRank.classList.add('rarity_item-label');
          labelId.classList.add('rarity_item-label');
          labelCollection.innerText = 'Collection';
          labelRarity.innerText = 'Rarity Score';
          labelRank.innerText = 'Rank';
          labelId.innerText = 'ID';
          const infoCollection = document.createElement('div');
          const infoId = document.createElement('div');
          const infoRarity = document.createElement('div');
          const infoRank = document.createElement('div');
          infoCollection.classList.add('rarity_item-text');
          infoRarity.classList.add('rarity_item-text');
          infoRank.classList.add('rarity_item-text');
          infoId.classList.add('rarity_item-text');
          infoCollection.innerText = '55Unity';
          infoRarity.innerText = info.score;
          infoRank.innerText = info.rank;
          infoId.innerText = String(tokenFromContract[i]);
          earningsItemStatusButtonHq.innerText = 'HQ';
          earningsItemStatusButtonMission.innerText = 'Mission';
          earningsItemStatusWrapper.appendChild(earningsItemStatusButtonHq);
          earningsItemStatusWrapper.appendChild(
            earningsItemStatusButtonMission
          );
          rarityItemInfoWrapperCollection.appendChild(labelCollection);
          rarityItemInfoWrapperCollection.appendChild(infoCollection);
          rarityItemInfoWrapperRarity.appendChild(labelRarity);
          rarityItemInfoWrapperRarity.appendChild(infoRarity);
          rarityItemMainContentLayoutLeft.appendChild(
            rarityItemInfoWrapperCollection
          );
          rarityItemMainContentLayoutLeft.appendChild(
            rarityItemInfoWrapperRarity
          );
          rarityItemInfoWrapperId.appendChild(labelId);
          rarityItemInfoWrapperId.appendChild(infoId);
          rarityItemInfoWrapperRank.appendChild(labelRank);
          rarityItemInfoWrapperRank.appendChild(infoRank);
          rarityItemMainContentLayoutRight.appendChild(rarityItemInfoWrapperId);
          rarityItemMainContentLayoutRight.appendChild(
            rarityItemInfoWrapperRank
          );
          rarityItemMainContentWrapper.appendChild(
            rarityItemMainContentLayoutLeft
          );
          rarityItemMainContentWrapper.appendChild(
            rarityItemMainContentLayoutRight
          );
          rarityItemContent.appendChild(rarityItemMainContentWrapper);
          rarityItemContentWrapper.appendChild(rarityItemContent);
          rarityItemContentWrapper.appendChild(earningsItemStatusWrapper);
          const elementImage = document.createElement('img');
          elementImage.setAttribute('src', info.imageUrl);
          elementImage.classList.add('rarity_item-image');
          const newNftCard = document.createElement('div');
          newNftCard.classList.add('owned-nfts_item-component');
          newNftCard.appendChild(elementImage);
          newNftCard.appendChild(rarityItemContentWrapper);
          nftLayout.appendChild(newNftCard);
        });

        const buttons = Array.from(
          document.getElementsByClassName('earnings_item-status-button') as HTMLCollectionOf<HTMLButtonElement>)

        buttons.forEach((button, i) => {
          let index = Math.floor(i / 2);
          if (
            tokenStake.includes(tokenFromContract[index]) &&
            button.innerText === 'HQ'
          ) {
            button.classList.add('is-selected');
            buttons[i + 1].classList.remove('is-selected');
          }

          button.onclick = () => {
            if (button.innerText === 'HQ') {
              if (!tokenStake.includes(tokenFromContract[index])) {
                tokenStake.push(tokenFromContract[index]);
              }
              button.classList.add('is-selected');
              buttons[i + 1].classList.remove('is-selected');
            } else {
              let filteredtokenStake = tokenStake.filter(
                (id) => tokenFromContract[index] !== id
              );
              tokenStake = filteredtokenStake;
              button.classList.add('is-selected');
              buttons[i - 1].classList.remove('is-selected');
            }
          };
        });
      });
    });
};


const connectWallet = async function () {
  try {
    const accounts = await (window as any).ethereum.request({
      method: 'eth_requestAccounts',
    });
    if (accounts.length > 0) {
      await createUser(accounts[0], PROJECT_ID);

      await fillInfo(accounts[0]);

    }
  } catch (error) {
    console.log(error);
  }
};

const claimToken = async function () {
  claimButton.classList.add('is-hidden');
  saveChangesButton.classList.add('is-hidden');
  loadingState[1].classList.remove('is-hidden');

  try {
    const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
    if (accounts.length !== 0) {
      await contractToken.methods
        .claim()
        .send({ from: accounts[0], to: CONTRACT_ADDRESS_TOKEN });
      claimButton.classList.remove('is-hidden');
      loadingState[1].classList.add('is-hidden');
      balance += sumToClaim;
      balanceText.innerText = Number(balance).toFixed(3);
      claimButton.classList.add('is-disabled');
      totalClaimable.innerText = '0 $SURVIVE';
      saveChangesButton.classList.remove('is-hidden');
    }
  } catch (error) {
    saveChangesButton.classList.remove('is-hidden');
    claimButton.classList.remove('is-hidden');
    loadingState[1].classList.add('is-hidden');
  }
};

const saveChanges = async function () {
  saveChangesButton.classList.add('is-hidden');
  loadingState[0].classList.remove('is-hidden');
  const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
  console.log('staked balance', stakedBalanceFromUser);
  console.log('token stake', tokenStake);

  if (accounts.length !== 0) {
    if (tokenStake.length !== Number(stakedBalanceFromUser)) {
      if (tokenStake.length === 0) {
        const answer = window.confirm('There are no heroes at the HQ. Are you sure you want to continue?')
        if (answer) {
          contractToken.methods
            .stake(tokenStake.length)
            .send({
              from: accounts[0],
              to: CONTRACT_ADDRESS_TOKEN,
            })
            .then((response: any) => {
              setStake(accounts[0], PROJECT_ID, tokenStake)
                .then((response) => {
                  getTotalClaimable(accounts[0]);

                  balanceOf(accounts[0]);

                  contractToken.methods
                    .stakedBalance(accounts[0])
                    .call()
                    .then((stakedBalance: number) => {
                      console.log(stakedBalance);
                      stakedBalanceFromUser = stakedBalance;
                      console.log('staked', stakedBalanceFromUser);
                    });

                  getStake(accounts[0], PROJECT_ID).then((response) => {
                    if (response) {
                      const { tokens } = response.data;
                      tokenStake = tokens;
                      tokenStake.sort();
                      totalNftsOfUser.innerText = String(tokens.length);
                      dailyWield.innerText = (tokens.length * 0.27369863013).toFixed(
                        3
                      );
                      saveChangesButton.classList.remove('is-hidden');
                      loadingState[0].classList.add('is-hidden');
                    }

                  });
                })
                .catch((error) => {
                  loadingState[0].classList.add('is-hidden');
                  saveChangesButton.classList.remove('is-hidden');
                  console.log(error);
                });
            })
            .catch((error: Error) => {
              console.log(error);
              loadingState[0].classList.add('is-hidden');
              saveChangesButton.classList.remove('is-hidden');
            });
        } else {
          saveChangesButton.classList.remove('is-hidden');
          loadingState[0].classList.add('is-hidden');
        }
      } else {
        contractToken.methods
          .stake(tokenStake.length)
          .send({
            from: accounts[0],
            to: CONTRACT_ADDRESS_TOKEN,
          })
          .then((response: any) => {
            setStake(accounts[0], PROJECT_ID, tokenStake)
              .then((response) => {
                getTotalClaimable(accounts[0]);

                balanceOf(accounts[0]);

                contractToken.methods
                  .stakedBalance(accounts[0])
                  .call()
                  .then((stakedBalance: number) => {
                    console.log(stakedBalance);
                    stakedBalanceFromUser = stakedBalance;
                    console.log('staked', stakedBalanceFromUser);
                  });

                getStake(accounts[0], PROJECT_ID).then((response) => {
                  if (response) {
                    const { tokens } = response.data;
                    tokenStake = tokens;
                    tokenStake.sort();
                    totalNftsOfUser.innerText = String(tokens.length);
                    dailyWield.innerText = (tokens.length * 0.27369863013).toFixed(
                      3
                    );
                    saveChangesButton.classList.remove('is-hidden');
                    loadingState[0].classList.add('is-hidden');
                  }

                });
              })
              .catch((error) => {
                loadingState[0].classList.add('is-hidden');
                saveChangesButton.classList.remove('is-hidden');
                console.log(error);
              });
          })
          .catch((error: Error) => {
            console.log(error);
            loadingState[0].classList.add('is-hidden');
            saveChangesButton.classList.remove('is-hidden');
          });
      }

    } else {
      setStake(accounts[0], PROJECT_ID, tokenStake)
        .then((response) => {
          getTotalClaimable(accounts[0]);

          balanceOf(accounts[0]);

          getStake(accounts[0], PROJECT_ID).then((response) => {
            if (response) {
              const { tokens } = response.data
              tokenStake = tokens
              tokenStake.sort();
              totalNftsOfUser.innerText = String(tokens.length);
              dailyWield.innerText = (tokens.length * 0.27369863013).toFixed(3);
              saveChangesButton.classList.remove('is-hidden');
              loadingState[0].classList.add('is-hidden');
            }

          });
        })
        .catch((error) => {
          loadingState[0].classList.add('is-hidden');
          saveChangesButton.classList.remove('is-hidden');
          console.log(error);
        });
    }
  }
};

const checkUserIsConnected = async () => {
  try {
    const accounts = await web3.eth.getAccounts();

    if (accounts.length > 0) {
      await createUser(accounts[0], PROJECT_ID);

      await fillInfo(accounts[0]);

    }
  } catch (error) {
    console.log(error);
  }
};

checkUserIsConnected();

saveChangesButton.addEventListener('click', saveChanges);
claimButton.addEventListener('click', claimToken);
connectButton.addEventListener('click', connectWallet);

const hasMetamask = checkEthereumInstalled()
if (!hasMetamask) {
  connectedTo.innerText = 'PLEASE INSTALL METAMASK';
  navTopBar.classList.remove('is-hidden')
  connectedTo.classList.remove('is-hidden');
  connectButton.classList.add('is-hidden');
  balanceWrapper.classList.add('is-hidden')
}


(window as any).ethereum.on('chainChanged', (chainId: string) => handleChainChanged(chainId, connectedTo, connectButton));

(window as any).ethereum.on('accountsChanged', handleAccountChanged);






