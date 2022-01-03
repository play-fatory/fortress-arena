function getLink(addr, chainId) {
  var explorer;
  if (chainId == 1) {
    explorer = "https://etherscan.io";
  } else if (chainId == 3) {
    explorer = "https://ropsten.etherscan.io";
  } else if (chainId == 4) {
    explorer = "https://rinkeby.etherscan.io";
  } else if (chainId == 5) {
    explorer = "https://goerli.etherscan.io";
  } else if (chainId == 137) {
    explorer = "https://polygonscan.com";
  } else if (chainId == 80001) {
    explorer = "https://mumbai.polygonscan.com";
  } else {
    explorer = "";
    console.log("unsupported chainid " + chainId);
  }
  var shortAddr =
    addr.substring(0, 6) + "...." + addr.substring(addr.length - 4);

  if (addr.length == 42) {
    return (
      '<a target="_blank" style="text-decoration: underline;color:coral;" href="' +
      explorer +
      "/address/" +
      addr +
      '">' +
      shortAddr +
      "</a>"
    );
  } else {
    return (
      '<a target="_blank" style="text-decoration: underline;color:coral;" href="' +
      explorer +
      "/tx/" +
      addr +
      '">' +
      shortAddr +
      "</a>"
    );
  }
}

function getOpenSeaLink(chainId) {
  var explorer;
  if (chainId == 1) {
    explorer = "https://testnets.opensea.io/collection/test-fortress-arena-nft";
  } else if (chainId == 4) {
    explorer = "https://testnets.opensea.io/collection/test-fortress-arena-nft";
  } else {
    explorer = "";
    console.log("unsupported chainid " + chainId);
  }

  return (
    '<a target="_blank" style="text-decoration: underline;color:coral;" href="' +
    explorer +
    '">Fortress-Arena NFT</a>'
  );
}

function getGuideLink() {
  return '<a target="_blank" style="text-decoration: underline;color:coral;" href="/mintingguide.html">Show Minting Guide</a>';
}

async function apiPost(host, resource, data, accessToken) {
  // console.log("apiPost host =>", host);
  // console.log("apiPost data =>", data);
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (accessToken) {
    headers["Authorization"] = "Bearer " + accessToken;
  }
  const url = host + resource;
  return await fetch(url, {
    method: "POST",
    cache: "no-cache",
    headers: headers,
    body: JSON.stringify(data),
  });
}

async function getPreMintSig(contract, address) {
  let api = "https://gateway-ipfs.atomrigs.io/api/";
  const resource = "get_sig";
  data = { contract, address, method: "preMint" };
  res = await apiPost(api, resource, data);
  json = await res.json();
  // console.log("res => ", res);
  if (res.status == 200) {
    return json;

    /* json
  {
      "keyAddr": "0x9DB5171227C41198384442DA05B3938D1603c981",
      "hash": "0x7fb37f612b4edd66d4aaf9369c7984a5d467fff4b5c43ee2d49208ae252b2c1b",
      "v": 27,
      "r": "0x4b92550cf7df4b5304d14d6a50662b9752d08606c98b9663332ef120caf157ad",
      "s": "0x784e02b64a49f100c4067661d451c2dacf027194a927fb78f73c933dbadb5a1f"
  }
  */
  } else {
    console.log("apiPost error => ", json.err);
    // return json.err;
    return null;
  }
}

async function copyImg(tokenIds) {
  const api = "https://gateway-ipfs.atomrigs.io/api/";
  const resource = "copy_img";
  const data = { tokenIds };
  // console.log("copyImg => ", data);
  const res = await apiPost(api, resource, data);
  const json = await res.json();
  // console.log("res => ", json);
  if (res.status == 200) {
    return json;
  } else {
    return json.err;
  }
}

function getWindowWidth() {
  var width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  return width;
}

function getWindowHeight() {
  var height =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;
  return height;
}
