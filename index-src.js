const web3 = new Web3(Web3.givenProvider);

const CHAIN_ID = '0x1';
const CONTRACT_ADDRESS_TOKEN = '0xFBB3c73779Ef59F0C4A2e662F9A42A82a145e638';
const CONTRACT_ADDRESS_55 = '0xD8723058f2B456484E3cdE4ccfaeA903116fA9e4';
const PROJECT_ID = '62182600ca0013b6790f02e5';

const connectButton = document.querySelector('.connect-button');
const connectedTo = document.querySelector('.connected-to');
const balanceWrapper = document.querySelector('.balance-wrapper');
const balanceText = document.querySelector('.balance-text');
const totalClaimable = document.querySelector('.earnings_item-claim-text');
const claimButton = document.querySelector('.claim-button');
const loadingState = document.getElementsByClassName('loading-animation');
const totalNftsOfUser = document.querySelector('.total-nfts');
const totalNftsOfUserSpan = document.querySelector(
  '.rarity_low-opacity-text-span'
);
const tokenImages = document.getElementsByClassName('rarity_item-image');
const tokenRarity = document.getElementsByClassName('token-rarity');
const tokenId = document.getElementsByClassName('token-id');
const tokenRank = document.getElementsByClassName('token-rank');
const nftLayout = document.querySelector('.owned-nfts_list-layout');
const saveChangesButton = document.querySelector('.earnings_select-button');
const dailyWield = document.querySelector('.daily-wield');
const navTopBar = document.querySelector('.top-nav_connected-wrapper');
const navTopBarWrapper = document.querySelector('.top-nav_buttons-wrapper');

const contractToken = new web3.eth.Contract(ABI, CONTRACT_ADDRESS_TOKEN);
const contract55 = new web3.eth.Contract(ABIunity, CONTRACT_ADDRESS_55);

let tokenStake = [];

const getStake = async (address, projectId) => {
  try {
    const response = await axios.get(
      'https://server.55unity.com/users/get-staked',
      {
        params: { address, projectId },
        headers: {
          authentication:
            'a9a5d580243b9ee0ab8377695b573e3aa8877803ac2596067d4b8e4ac8254266',
        },
      }
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

const setStake = async (address, projectId, tokens) => {
  try {
    const response = await axios.post(
      'https://server.55unity.com/users/set-staked',
      { address, projectId, tokens },
      {
        headers: {
          authentication:
            'a9a5d580243b9ee0ab8377695b573e3aa8877803ac2596067d4b8e4ac8254266',
        },
      }
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

const createUser = async (address, projectId) => {
  try {
    const response = await axios.post(
      'https://server.55unity.com/users/create',
      { address, projectId },
      {
        headers: {
          authentication:
            'a9a5d580243b9ee0ab8377695b573e3aa8877803ac2596067d4b8e4ac8254266',
        },
      }
    );
    return response;
  } catch {
    console.log(error);
  }
};

const getTokensFromDb = async (tokensId) => {
  try {
    const response = await axios.post(
      'https://seamore.55unity.com/assets/get-infos',
      { tokensId }
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

const getTotalClaimable = async (accounts) => {
  contractToken.methods
    .getTotalClaimable(accounts)
    .call()
    .then((total) => {
      if (+total !== 0) {
        claimButton.classList.remove('is-disabled');
      }
      totalClaimable.innerText =
        Number(web3.utils.fromWei(total, 'ether')).toFixed(3) + ' $SURVIVE';
      sumToClaim = +web3.utils.fromWei(total, 'ether');
    });
};

const balanceOf = async (accounts) => {
  contractToken.methods
    .balanceOf(accounts)
    .call()
    .then((userBalance) => {
      balanceText.innerText = Number(
        web3.utils.fromWei(userBalance, 'ether')
      ).toFixed(3);
      balanceWrapper.classList.remove('is-hidden');
      balance = +web3.utils.fromWei(userBalance, 'ether');
    })
    .catch((error) => console.log(error));
};

const fillInfo = async (accounts) => {
  connectedTo.innerText =
    'CONNECTED TO: ' +
    accounts.substring(0, 5) +
    '...' +
    accounts.substring(accounts.length - 4, accounts.length);
  connectedTo.classList.remove('is-hidden');
  connectButton.classList.add('is-hidden');
  navTopBar.classList.remove('is-hidden');
  navTopBarWrapper.classList.add('is-hidden');

  balanceOf(accounts);

  getTotalClaimable(accounts);

  contractToken.methods
    .lastUpdate(accounts)
    .call()
    .then((info) => {
      if (+info === 0) {
        claimButton.classList.add('is-disabled');
      }
    });

  contract55.methods
    .walletOfOwner(accounts)
    .call()
    .then((tokens) => {
      saveChangesButton.classList.remove('is-hidden');
      let tokenIds = tokens;
      tokenIds = tokenIds.map((x) => parseInt(x));
      totalNftsOfUserSpan.innerText = '(' + tokenIds.length + ')';

      getStake(accounts[0], PROJECT_ID).then((response) => {
        const { tokens } = response.data;
        tokenStake = tokens;
        tokenStake.sort();
        totalNftsOfUser.innerText = tokens.length;
        dailyWield.innerText = (tokens.length * 0.27369863013).toFixed(3);
      });

      getTokensFromDb(tokens).then((response) => {
        const { data } = response;
        data.forEach((info, i) => {
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
          infoId.innerText = tokenIds[i];
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
          document.getElementsByClassName('earnings_item-status-button')
        );

        buttons.forEach((button, i) => {
          let index = Math.floor(i / 2);
          if (
            tokenStake.includes(tokenIds[index]) &&
            button.innerText === 'HQ'
          ) {
            button.classList.add('is-selected');
            buttons[i + 1].classList.remove('is-selected');
          }

          button.onclick = () => {
            if (button.innerText === 'HQ') {
              if (!tokenStake.includes(tokenIds[index])) {
                tokenStake.push(tokenIds[index]);
              }
              button.classList.add('is-selected');
              buttons[i + 1].classList.remove('is-selected');
            } else {
              let filteredtokenStake = tokenStake.filter(
                (id) => tokenIds[index] !== id
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

let balance = 0;
let sumToClaim = 0;

const connectWallet = async function () {
  try {
    const accounts = await window.ethereum.request({
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
  const accounts = await ethereum.request({ method: 'eth_accounts' });

  contractToken.methods
    .claim()
    .send({
      from: accounts[0],
      to: CONTRACT_ADDRESS_TOKEN,
    })
    .then((claim) => {
      claimButton.classList.remove('is-hidden');
      loadingState[1].classList.add('is-hidden');
      balance += sumToClaim;
      balanceText.innerText = Number(balance).toFixed(3);
      claimButton.classList.add('is-disabled');
      totalClaimable.innerText = '0 $SURVIVE';
      saveChangesButton.classList.remove('is-hidden');
    })
    .catch((error) => {
      saveChangesButton.classList.remove('is-hidden');
      claimButton.classList.remove('is-hidden');
      loadingState[1].classList.add('is-hidden');
    });
};

const saveChanges = async function () {
  saveChangesButton.classList.add('is-hidden');
  loadingState[0].classList.remove('is-hidden');
  const accounts = await ethereum.request({ method: 'eth_accounts' });
  contractToken.methods
    .stake(tokenStake.length)
    .send({
      from: accounts[0],
      to: CONTRACT_ADDRESS_TOKEN,
    })
    .then((response) => {
      saveChangesButton.classList.remove('is-hidden');
      loadingState[0].classList.add('is-hidden');
      setStake(accounts[0], PROJECT_ID, tokenStake)
        .then((response) => {
          getTotalClaimable(accounts[0]);

          balanceOf(accounts[0]);

          getStake(accounts[0], PROJECT_ID).then((response) => {
            const { tokens } = response.data;
            tokenStake = tokens;
            tokenStake.sort();
            totalNftsOfUser.innerText = tokens.length;
            dailyWield.innerText = (tokens.length * 0.27369863013).toFixed(3);
          });
        })
        .catch((error) => {
          loadingState[0].classList.add('is-hidden');
          saveChangesButton.classList.remove('is-hidden');
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
      loadingState[0].classList.add('is-hidden');
      saveChangesButton.classList.remove('is-hidden');
    });
};

saveChangesButton.addEventListener('click', saveChanges);
claimButton.addEventListener('click', claimToken);
connectButton.addEventListener('click', connectWallet);

if (!window.ethereum) {
  connectedTo.innerText = 'PLEASE INSTALL METAMASK';
  connectedTo.classList.remove('is-hidden');
  connectButton.classList.add('is-hidden');
}

ethereum.on('chainChanged', handleChainChanged);

function handleChainChanged(_chainId) {
  if (_chainId !== CHAIN_ID) {
    connectButton.classList.add('is-hidden');
    connectedTo.classList.remove('is-hidden');
    connectedTo.innerText = 'PLEASE CHANGE YOUR CHAIN TO THE MAINNET';
  } else {
    window.location.reload();
  }
}

ethereum.on('accountsChanged', handleAccountChanged);

function handleAccountChanged(_account) {
  if (connectedTo.innerText !== '') {
    window.location.reload();
  }
}

const checkUserIsConnected = async () => {
  try {
    const accounts = await web3.eth.getAccounts();

    if (accounts.length > 0) {
      await fillInfo(accounts[0]);
    }
  } catch (error) {
    console.log(error);
  }
};
