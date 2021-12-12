const setTheme = (theme) => (document.documentElement.className = theme);
setTheme("red"); // initialize

let nftAddress = "0x2e9f329691be10f2d6d59f980a27dab5d560b394"; // rinkeby
var nftContract;

var chainId = 4;
var networkList = {
  1: "Ethereum Mainnet",
  4: "Rinkeby Testnet",
};
let myAddr;

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
      $(".my-address").html(getLink(myAddr, chainId));
      $("#connect-btn").hide();
    } else {
      console.log("No ethereum account is available!");
      $("#connect-btn").show();
    }
  } catch (err) {
    console.log("getAccount => ", err);
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
