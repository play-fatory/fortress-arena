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
      '<a target="_blank" style="font-size: 14px; text-decoration: underline;color:#818181;" href="' +
      explorer +
      "/address/" +
      addr +
      '">' +
      shortAddr +
      "</a>"
    );
  } else {
    return (
      '<a target="_blank" style="font-size: 14px; text-decoration: underline;color:#818181;" href="' +
      explorer +
      "/tx/" +
      addr +
      '">' +
      shortAddr +
      "</a>"
    );
  }
}
