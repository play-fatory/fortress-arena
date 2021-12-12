const setTheme = (theme) => (document.documentElement.className = theme);
setTheme("aquamarine"); // initialize

let nftAddress = "0x2e9f329691be10f2d6d59f980a27dab5d560b394"; // rinkeby
let nftContract;

let chainId = 4;
const networkList = {
  1: "Ethereum Mainnet",
  4: "Rinkeby Testnet",
};
let myAddr;
let mintingFee;

window.addEventListener("load", function () {
  loadWeb3();
  if (typeof window.web3 !== "undefined") {
    watchChainAccount();
    startApp();
  } else {
    alert("You need to install dapp browser first to use this site!");
  }
});

function loadWeb3() {
  if (typeof window.ethereum !== "undefined") {
    window.web3 = new Web3(window.ethereum);
  } else {
    window.web3 = new Web3(
      "https://mainnet.infura.io/v3/302b2ccfd49a40d480567a132cb7eb1d"
    );
  }
}

function watchChainAccount() {
  web3.currentProvider.on("accountsChanged", (accounts) => {
    startApp();
    // showMsg("<p>Your account has been changed!</p><button onclick='location.reload()'>Reload</button>");
  });
  web3.currentProvider.on("chainChanged", (chainId) => {
    startApp();
    // showMsg("<p>Network (Chain) has been changed!</p><button onclick='location.reload()'>Reload</button>");
    // console.log('aa');
  });
}

async function startApp() {
  console.log("startApp");
  try {
    var currentChainId = await web3.eth.getChainId();
    chainId = currentChainId;

    await getAccount();

    // initializeClock();
  } catch (err) {
    console.log("startApp => ", err);
  }
}

async function getAccount() {
  try {
    getContracts();

    var accounts = await web3.eth.getAccounts();
    console.log("accounts => ", accounts);
    console.log("getAccount() => chainId => ", chainId);
    if (accounts.length > 0) {
      // myAddr = web3.utils.toChecksumAddress(accounts[0]);
      myAddr = accounts[0];

      $("#div-myaddress").show();
      $(".my-address").html(getLink(myAddr, chainId));
      $("#content_body").show();
      $("#connect-btn").hide();
    } else {
      console.log("No ethereum account is available!");
      $("#div-myaddress").hide();
      $("#content_body").hide();
      $("#connect-btn").show();
    }
  } catch (err) {
    console.log("getAccount => ", err);
    $("#div-myaddress").hide();
    $("#content_body").hide();
    $("#connect-btn").show();
    $(".my-address").html("");
  }
}

function connectWallet() {
  if (typeof ethereum === "undefined") {
    return showMsg(noAddrMsg);
  }

  ethereum
    .request({ method: "eth_requestAccounts" })
    .then((accounts) => {
      myAddr = accounts[0];
      $(".my-address").html(getLink(myAddr, chainId));
      startApp();
      //   $("#div-mintable").show();
      //   isMintingAvailable(true);
    })
    .catch((err) => {
      //   isMintingAvailable(false);
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log("Please connect to Your wallet!");
      } else {
        console.error(err);
      }
    });
}

async function getContracts() {
  nftContract = new web3.eth.Contract(nftAbi, nftAddress);
  $(".nft-address").html(getLink(nftAddress, chainId));
}
async function getTotalSupply() {
  return nftContract.methods.totalSupply().call();
}

async function nftMint() {
  /*
        const options = {value: ethers.utils.parseEther(“1.0”)}
        const reciept = await contract.buyPunk(1001, options);
        nft.publicMint(10, options)    

    */
  $("#div-mint-result").hide();
  $("#minting-loading").show();

  // getMinting Fee
  const fee_wei = await nftContract.methods.MINTING_FEE().call();
  const fee_gwei = ethers.utils.formatUnits(fee_wei, 18);

  const mintingCount = $("#claimcount option:selected").val();
  const total_mintingfee = parseFloat(fee_gwei) * parseFloat(mintingCount);
  console.log("total_mintingfee =>", total_mintingfee);

  nftContract.methods
    .publicMint(mintingCount)
    .send({
      from: myAddr,
      value: ethers.utils.parseEther(total_mintingfee.toString()),
    })
    .on("transactionHash", (txid) => {
      // console.log(`txid: ${txid}`)
    })
    .once("allEvents", (allEvents) => {
      // console.log('allEvents')
      // console.log(transferEvent)
    })
    .once("Transfer", (transferEvent) => {
      // console.log('trasferEvent', transferEvent)
    })
    .once("receipt", (receipt) => {
      $("#minting-loading").hide();
      console.log("receipt => ", receipt);

      if (receipt.status) {
        $("#div-mint-result").show();
        let resultTokenids = [];
        if (Array.isArray(receipt.events.Transfer)) {
          receipt.events.Transfer.map((tranfervalue) => {
            console.log(
              "receipt.events.Transfer => ",
              tranfervalue.returnValues.tokenId
            );
            resultTokenids.push(tranfervalue.returnValues.tokenId);
            console.log("resultTokenids => ", resultTokenids);
          });
        } else {
          console.log(
            "receipt.events.Transfer=>",
            receipt.events.Transfer.returnValues.tokenId
          );
          resultTokenids.push(receipt.events.Transfer.returnValues.tokenId);
          console.log("resultTokenids => ", resultTokenids);
        }
        showCardList("mintresult", resultTokenids);
      }
    })
    .on("error", (error) => {
      $("#minting-loading").hide();
      console.log(error);
      // $(`#pending-sendDkey-tx`).html('(Transaction fail!)');
      // $(`#pending-sendDkey-tx`).css('color', 'red');
    });
}

getCardInfo = async (tokenId) => {
  try {
    let tokenInfoBase64 = await nftContract.methods.tokenURI(tokenId).call();
    let jsonInfo = JSON.parse(atob(tokenInfoBase64.substring(29)));
    return jsonInfo;
  } catch (errGetCardInfo) {
    console.log(errGetCardInfo);
  }
};

showCardList = async (kind, tokenIds) => {
  console.log("showCardList kind =>", kind);
  console.log("showCardList tokenIds =>", tokenIds);
  $("#minting-loading").show();
  let claimTokenIdList = [];

  switch (kind) {
    case "mintresult":
      claimTokenIdList = tokenIds;
      break;
    case "mintedcards":
      claimTokenIdList = await nftContract.methods.tokensOf(myAddr).call();
      break;
  }

  let tokenId = claimTokenIdList;

  let arr = [];

  const cardInfoList = await Promise.all(
    tokenId.map((id) => {
      return getCardInfo(id);
    })
  );
  cardInfoList.forEach((info, i) => {
    arr.push({ tokenId: tokenId[i], image: info.image });
  });

  arr.sort(function (a, b) {
    return parseFloat(a.tokenId) - parseFloat(b.tokenId);
  });

  // console.log(arr);
  function cardsDeck(arr) {
    switch (kind) {
      case "mintresult":
        document.getElementById("cards_deck").innerHTML = "";
        break;
      case "mintedcards":
        document.getElementById("minted_cards_deck").innerHTML = "";
        break;
    }

    for (let i = 0; i < arr.length; i++) {
      let card = document.createElement("div");
      let imgBox = document.createElement("div");
      let descriptionBox = document.createElement("div");
      let tokenId = document.createElement("div");
      let label = document.createElement("div");
      card.className = "card";
      imgBox.className = "imgbox";
      descriptionBox.className = "descriptionBox";
      tokenId.className = "tokenID";

      label.innerHTML = ``;
      imgBox.innerHTML = `<label class="checkbox-label" for="checkBox${arr[i].tokenId}" />
          <img style="width: auto; height: auto; max-width: 200px; "  src="${arr[i].image}" />         
          `;

      tokenId.innerHTML = `#${arr[i].tokenId} </label>`;
      card.appendChild(imgBox);
      card.appendChild(descriptionBox);
      descriptionBox.appendChild(tokenId);
      card.style.marginBottom = "10px";

      switch (kind) {
        case "mintresult":
          document.getElementById("cards_deck").appendChild(card);
          showCardList("mintedcards", null);
          break;
        case "mintedcards":
          document.getElementById("minted_cards_deck").appendChild(card);
          break;
      }
    }
  }

  cardsDeck(arr);
  $("#minting-loading").hide();
};
