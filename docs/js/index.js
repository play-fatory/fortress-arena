const setTheme = (theme) => (document.documentElement.className = theme);
setTheme("aquamarine"); // initialize

// let nftAddress = "0x2e9f329691be10f2d6d59f980a27dab5d560b394"; // rinkeby old
// let nftAddress = "0xe43ed3a4fa0b9850ce4ecc3e5e550ecf7ce45d4f"; // rinkeby
let nftAddress = "0x2391fCeF71ED00669aa9accAACbD904437C89834"; // rinkeby
let nftContract;

let chainId = 4;
const networkList = {
  1: "Ethereum Mainnet",
  4: "Rinkeby Testnet",
};
let myAddr;
let mintingFee;
let totalsupplyInterval;

let openMyCardsView = false;
let mintingState = 0; // 0:minting is not allowed , 1: pre minting , 2: public minting , 3: public minting is not allowed
let multiCount = 0;

const openseaurl = {
  1: "https://testnets.opensea.io/assets/0x2e9f329691be10f2d6d59f980a27dab5d560b394/",
  4: "https://testnets.opensea.io/assets/0x2391fCeF71ED00669aa9accAACbD904437C89834/",
};
// 4: "https://testnets.opensea.io/assets/0xe43ed3a4fa0b9850ce4ecc3e5e550ecf7ce45d4f/",
// 4: "https://testnets.opensea.io/assets/0x2e9f329691be10f2d6d59f980a27dab5d560b394/",
// 4: "https://testnets.opensea.io/assets/0x33991d6d07a58cdb9ac54a0414d10f19540d1838/",

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
  bgImageScale();

  function bgImageScale() {
    console.log("getWindowWidth() => ", getWindowWidth());
    console.log("getWindowHeight()=>", getWindowHeight());
    let winWidth = getWindowWidth();
    let winHeight = getWindowHeight();
    const winWidthpx = winWidth + "px";
    const winHeightpx = winHeight + "px";
    console.log("winHeightpx =>", winHeightpx);
    if (winWidth > winHeight) {
      if (winWidth < 1920) {
        if (winHeight > 1080) {
          $("#bg-body").html(
            '<img id="bg-image" height="' +
              winHeightpx +
              '" src="./asset/body_bg2.png" />'
          );
        } else {
          $("#bg-body").html(
            '<img id="bg-image" width="auto" src="./asset/body_bg2.png" />'
          );
        }
      } else {
        $("#bg-body").html(
          '<img id="bg-image" width="' +
            winWidthpx +
            '" src="./asset/body_bg2.png" />'
        );
      }
    } else {
      if (winHeight < 1080) {
        $("#bg-body").html(
          '<img id="bg-image" height=auto src="./asset/body_bg2.png" />'
        );
      } else {
        $("#bg-body").html(
          '<img id="bg-image" height="' +
            winHeightpx +
            '" src="./asset/body_bg2.png" />'
        );
      }
    }
  }

  try {
    var currentChainId = await web3.eth.getChainId();
    chainId = currentChainId;

    // if (chainId == 1 || chainId == 4) {
    if (chainId == 4) {
      $("#div-network").show();
      $("#network-info").hide();
      $(".current-network").html(networkList[chainId]);
      await getAccount();
    } else {
      $("#div-network").hide();
      $("#network-info").show();
    }

    // initializeClock();
  } catch (err) {
    console.log("startApp => ", err);
  }
}

async function getAccount() {
  try {
    await getContracts();

    var accounts = await web3.eth.getAccounts();

    if (accounts.length > 0) {
      // myAddr = web3.utils.toChecksumAddress(accounts[0]);
      myAddr = accounts[0];

      $("#div-myaddress").show();
      $(".my-address").html(getLink(myAddr, chainId));
      $("#content_body").show();
      $("#connect-btn").hide();
      await getTotalSupply();
      if (mintingState == 1 || mintingState == 2) {
        let sigInfo = await getPreMintSig(nftAddress, myAddr);
        // console.log("siginfo =>", sigInfo);
        if (sigInfo == null || sigInfo.r == undefined) {
          $("#comingsoon-div").show();
          $("#comingsoon-content").html(
            '<h2 style="color:var(--second-color)">You cannot participate in minting.</h2><h3>Your address is not whitelisted.</h3>'
          );
          $("#minting-body").hide();
        }
      }
    } else {
      console.log("No ethereum account is available!");
      $("#div-myaddress").hide();
      $("#content_body").hide();
      $("#connect-btn").show();

      $(".description").html(
        "<p>To participate in minting, click the Connect Wallet button to connect your wallet.</p>"
      );
    }
  } catch (err) {
    console.log("getAccount => ", err);
    $("#div-myaddress").hide();
    $("#content_body").hide();
    $("#connect-btn").show();
    $(".description").html(
      "<p>To participate in minting, click the Connect Wallet button to connect your wallet.</p>"
    );
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
  $(".opensea-address").html(getOpenSeaLink(chainId));
  await getMintingState();
}

async function getMintingState() {
  mintingState = await nftContract.methods.getMintingState().call();

  if (mintingState === 0 || mintingState === 3) {
    $("#comingsoon-div").show();
    $("#minting-body").hide();
  } else {
    $("#comingsoon-div").hide();
    $("#minting-body").show();
  }

  await getMultiClaimCount();
}

async function getTotalSupply() {
  clearInterval(totalsupplyInterval);

  const maxPublic = await nftContract.methods.MAX_PUBLIC_ID().call();
  let totalsupply = 0;
  totalsupply = await nftContract.methods.totalSupply().call();
  console.log("totalsupply =>", totalsupply);
  $(".claimedcnt").html(totalsupply + "/" + maxPublic);

  // update every 2sec
  totalsupplyInterval = setInterval(async function () {
    totalsupply = await nftContract.methods.totalSupply().call();
    console.log("totalsupply =>", totalsupply);
    $(".claimedcnt").html(totalsupply + "/" + maxPublic);
  }, 2000);
}

async function getMultiClaimCount() {
  let claimcount = document.getElementById("claimcount");
  let optionItem = "";
  // getMinting Fee
  const fee_wei = await nftContract.methods.MINTING_FEE().call();
  const fee_gwei = ethers.utils.formatUnits(fee_wei, 18);

  switch (mintingState.toString()) {
    // pre-mint
    case "1":
      multiCount = await nftContract.methods.MAX_PRE_MULTI().call();
      $(".minting-title").html("<b>Fortress Arena Minting (Pre-sale)</b>");

      break;
    case "2":
      // public mint
      multiCount = await nftContract.methods.MAX_PUBLIC_MULTI().call();
      $(".minting-title").html("<b>Fortress Arena Minting (Public sale)</b>");

      break;
    default:
      multiCount = 0;
      break;
  }
  $(".mintingfee").html("[ " + fee_gwei + " ETH ]");
  $(".description").html(
    "<p>The price of 1 TANK NFT is " +
      fee_gwei +
      " ETH, and you can claim up to " +
      multiCount +
      " at a time.</p>"
  );

  // console.log("multiCount -> ", multiCount);

  for (let i = 1; i < parseInt(multiCount) + 1; i++) {
    if (i === 1) {
      optionItem =
        optionItem +
        '<option value="' +
        i +
        '" selected="selected">' +
        i +
        "</option>";
    } else {
      optionItem = optionItem + '<option value="' + i + '" >' + i + "</option>";
    }
  }
  // console.log("optionItem -> ", optionItem);
  // <option value="1" selected="selected">1</option>
  // <option value="2">2</option>
  // <option value="3">3</option>
  // <option value="4">4</option>
  // <option value="5">5</option>
  // <option value="6">6</option>
  // <option value="7">7</option>
  // <option value="8">8</option>
  // <option value="9">9</option>
  // <option value="10">10</option>
  claimcount.innerHTML = optionItem;
}
async function nftMint() {
  /*
        const options = {value: ethers.utils.parseEther(“1.0”)}
        const reciept = await contract.buyPunk(1001, options);
        nft.publicMint(10, options)    

    */
  // window.scrollTo(0, 0);
  $("html, body").animate({ scrollTop: 100 }, "slow");
  $("#div-mint-result").hide();
  $("#minting-loading").show();
  $("#minterror").hide();
  try {
    console.log("mintingState -> ", mintingState);
    // getMinting Fee
    const fee_wei = await nftContract.methods.MINTING_FEE().call();
    const fee_gwei = ethers.utils.formatUnits(fee_wei, 18);

    const mintingCount = $("#claimcount option:selected").val();
    const total_mintingfee = parseFloat(fee_gwei) * parseFloat(mintingCount);
    // console.log("total_mintingfee =>", total_mintingfee);

    switch (mintingState.toString()) {
      case "1":
        // pre minting
        console.log("pre-Minting");
        mintMethod = "preMint";
        let sigInfo = await getPreMintSig(nftAddress, myAddr);

        // console.log("sigInfo => ", sigInfo);
        if (sigInfo.r != null) {
          let minted_cnt = await nftContract.methods.preMints(myAddr).call();
          // console.log(
          //   "mintingCount + minted_cnt =>",
          //   mintingCount + minted_cnt
          // );
          // console.log("multiCount =>", multiCount);
          if (parseInt(mintingCount) + parseInt(minted_cnt) <= multiCount) {
            nftContract.methods
              .preMint(sigInfo.v, sigInfo.r, sigInfo.s, mintingCount)
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
                // console.log("receipt => ", receipt);
                setMintResult(receipt);
              })
              .on("error", (error) => {
                $("#minting-loading").hide();
                console.log(error);
              });
          } else {
            let cardcnt = parseInt(multiCount) - parseInt(minted_cnt);
            switch (cardcnt.toString()) {
              case "0":
                showMintError("You have minted all the cards you can mint on.");
                break;
              case "1":
                showMintError("You can mint only " + cardcnt + " card.");
                break;
              default:
                showMintError("You can mint only " + cardcnt + " cards.");
                break;
            }

            $("#minting-loading").hide();
          }
        } else {
          showMintError("Your address is not whitelisted. ");
          $("#minting-loading").hide();
        }

        break;
      case "2":
        // public minting
        console.log("public Minting");

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

            setMintResult(receipt);
          })
          .on("error", (error) => {
            $("#minting-loading").hide();
            console.log(error);
          });
        break;
    }
  } catch (error) {
    console.log("error =>", error);
    $("#minting-loading").hide();
  }

  function showMintError(content) {
    $("#minterror").html(content);
    $("#minterror").show();
  }

  function setMintResult(receipt) {
    if (receipt.status) {
      $("#div-mint-result").show();
      let resultTokenids = [];
      if (Array.isArray(receipt.events.Transfer)) {
        receipt.events.Transfer.map((tranfervalue) => {
          // console.log(
          //   "receipt.events.Transfer => ",
          //   tranfervalue.returnValues.tokenId
          // );
          resultTokenids.push(tranfervalue.returnValues.tokenId);
          // console.log("resultTokenids => ", resultTokenids);
        });
      } else {
        // console.log(
        //   "receipt.events.Transfer=>",
        //   receipt.events.Transfer.returnValues.tokenId
        // );
        resultTokenids.push(receipt.events.Transfer.returnValues.tokenId);
        // console.log("resultTokenids => ", resultTokenids);
      }
      getTotalSupply();
      showCardList("mintresult", resultTokenids);
    }
  }
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

function showMyCards() {
  openMyCardsView = true;
  showCardList("mintedcards", null);
}

showCardList = async (kind, tokenIds) => {
  // console.log("showCardList kind =>", kind);
  // console.log("showCardList tokenIds =>", tokenIds);
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

      label.innerHTML = "";
      imgBox.innerHTML = `<label class="card-img" onclick="viewInOpensea(${arr[i].tokenId})" />
          <img style="width: auto; height: auto; max-width: 200px; "  src="${arr[i].image}" ></img>
          `;

      tokenId.innerHTML = `#${arr[i].tokenId} </label>`;
      card.appendChild(imgBox);
      card.appendChild(descriptionBox);
      descriptionBox.appendChild(tokenId);
      card.style.marginBottom = "10px";

      switch (kind) {
        case "mintresult":
          document.getElementById("cards_deck").appendChild(card);
          if (openMyCardsView) {
            showCardList("mintedcards", null);
          }
          break;
        case "mintedcards":
          $("#showcard-btn").hide();
          $(".mycardscnt").html("My Cards : " + arr.length);

          document.getElementById("minted_cards_deck").appendChild(card);
          break;
      }
    }
  }

  cardsDeck(arr);
  $("#minting-loading").hide();
};

function viewInOpensea(tokenid) {
  // console.log("viewInOpensea =>", tokenid);
  var popup = window.open(openseaurl[chainId] + tokenid, "OpenSea");
}
