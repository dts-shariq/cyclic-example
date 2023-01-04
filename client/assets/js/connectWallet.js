// const appId = "V3YPB41ScC14PnIUtkMoxaZnLKE7q83H4XauIiJx"; // Application id from moralis.io
// const serverUrl = "https://2e1jk4mlcyr3.usemoralis.com:2053/server"; //Server url from moralis.io
// Moralis.start ({serverUrl, appId });
//Moralis.start("https://2e1jk4mlcyr3.usemoralis.com:2053/server","V3YPB41ScC14PnIUtkMoxaZnLKE7q83H4XauIiJx");
Moralis.initialize("021"); // Application id from moralis.io
Moralis.serverURL = 'http://192.168.100.161:1337/server'; //Server url from moralis.io


$(document).ready(()=>{
  initUser();
});

//button in nav
$('#connectWalletBtn').click(()=>{
  $('#connectWalletBtn').prop('disabled', true);
  $('#connectWalletBtn').html(`Connecting... <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span class="sr-only">Loading...</span>`);
  login();
});
const connectToMetamask = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');

  const [accounts, chainId] = await Promise.all([
    provider.send('eth_requestAccounts', []),
    provider.send('eth_chainId', []),
  ]);

  const signer = provider.getSigner();
  return { signer, chain: chainId, account: accounts[0] };
};

async function handleAuth(provider) {
  await Moralis.enableWeb3({
      throwOnError: true,
      provider,
  });

  const { account, chainId } = Moralis;

  if (!account) {
      throw new Error("Connecting to chain failed, as no connected account was found");
  }
  if (!chainId) {
      throw new Error("Connecting to chain failed, as no connected chain was found");
  }

  const { message } = await Moralis.Cloud.run("requestMessage", {
      address: account,
      chain: parseInt(chainId, 16),
      network: "evm",
  });

  await Moralis.authenticate({
      signingMessage: message,
      throwOnError: true,
  }).then((user) => {
      console.log(user);
      location.reload();
  });
}
async function login(){

  try {
     handleAuth('Metamask');
 
  } catch (error) {
    alert(error.message);
    $('#connectWalletBtn').prop('disabled', false);
    $('#connectWalletBtn').html('Connect');
  }
  
     
  
 
};

async function initUser(){
  if (user){
   
    console.log(user.attributes.authData.moralisEth.data);
    $('#connectWalletTag').css('display', 'none');
    $('#profileTag').css('display', 'block');
    displayEthAddressInNav();
    displayProfilePhotoInNav();
    console.log('user logged in');
  } else{
    $('#connectWalletTag').css('display', 'block');
    $('#profileTag').css('display', 'none');
    $('#connectWallet').css('display', 'block');
    console.log('user NOT logged in');
    
  }
};

function displayEthAddressInNav(){
  let abbreivatedAddress = truncateStringInNav(user.attributes.ethAddress);
  $('#userAddress').html(abbreivatedAddress);
};

function truncateStringInNav(str) {
  let lastChar = str.length;
  return str.slice(0, 6) + '...' + str.slice((lastChar - 3), lastChar);
};

function displayProfilePhotoInNav(){
  if(user.attributes.profilePhoto){
    displaySellerRankInNav();
    $('#profilePhotoInNav').attr('src', user.attributes.profilePhoto._url);
    $('#profilePhotoInNav').css('display', 'none');

    let profilePhoto = user.attributes.profilePhoto._url;

      let img = new Image;

      img.src = profilePhoto;

      img.onload = function(){
        $('#spinnerBorderInNav').css('display', 'none');
        $('#profilePhotoInNav').css('display', 'inline');

        console.log('profilePhoto succesfully loaded!')
      };

      img.onerror = function(){
        $('#spinnerBorderInNav').css('display', 'none');
        $('#profilePhotoInNav').css('display', 'inline');
        $('#profilePhotoInNav').attr('src', './assets/images-icons/cantFindProfilePhoto.png');
        console.log('No network connection or profile photo is not available.')
      };

  } else{
    displaySellerRankInNav();
    $('#profilePhotoInNav').attr('src', './assets/images-icons/default.png');
    $('#profilePhotoInNav').css('display', 'none');

    let profilePhoto = './assets/images-icons/default.png';

      let img = new Image;

      img.src = profilePhoto;

      img.onload = function(){
        $('#spinnerBorderInNav').css('display', 'none');
        $('#profilePhotoInNav').css('display', 'inline');

        console.log('profilePhoto succesfully loaded!')
      };

      img.onerror = function(){
          alert('No network connection or profile photo is not available.')
      };
  }
};

function displaySellerRankInNav(){
  let amountSold = user.attributes.amountSold;
  if (amountSold == undefined){
    $('#rankInNav').attr('src', './assets/images-icons/noSales.png');
  } else if(amountSold >= 1 && amountSold <= 4){
    $('#rankInNav').attr('src', './assets/images-icons/oneSale.png');
  } else if(amountSold >= 5 && amountSold <= 9){
    $('#rankInNav').attr('src', './assets/images-icons/fiveSales.png');
  } else if(amountSold >= 10 && amountSold <= 19){
    $('#rankInNav').attr('src', './assets/images-icons/tenSales.png');
  } else if(amountSold >= 20 && amountSold <= 34){
    $('#rankInNav').attr('src', './assets/images-icons/twentySales.png');
  } else if(amountSold >= 35 && amountSold <= 49){
    $('#rankInNav').attr('src', './assets/images-icons/thirtyfiveSales.png');
  } else if(amountSold >= 50 && amountSold <= 74){
    $('#rankInNav').attr('src', './assets/images-icons/fiftySales.png');
  } else if(amountSold >= 75 && amountSold <= 99){
    $('#rankInNav').attr('src', './assets/images-icons/seventyfiveSales.png');
  } else if(amountSold >= 100){
    $('#rankInNav').attr('src', './assets/images-icons/hundredPlusSales.png');
  }
};

$('#myProfile').click(()=>{
  const base = 'http://192.168.100.161/profile.html?address=';
  let destination = user.attributes.ethAddress.toLowerCase();
  let profile = base + destination;
  $('#myProfile').attr('href', profile);
});

$('#disconnectWalletBtn').click(()=>{
  logout();
});

async function logout(){
  try {
    let loggedOut = await Moralis.User.logOut();
    if(loggedOut){
      initUser();
    }
    window.location.href="index.html";
  } catch (error) {
    alert(error.message)
  }
};

const tokenAddress = '0x39B72f4850300662e2E7DeeA13C3FAFEf0cb830C';
const tokenSymbol = 'I-LIFE-TkN';
const tokenDecimals = 18;
const tokenImage = 'https://assets.codepen.io/4625073/1.jpeg';

async function addTokenFunction() {

try {
  
  const wasAdded = await ethereum.request({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20', 
      options: {
        address: tokenAddress, 
        symbol: tokenSymbol, 
        decimals: tokenDecimals, 
        image: tokenImage, 
      },
    },
  });

  if (wasAdded) {
    console.log('Thanks for your interest!');
  } else {
    console.log('HelloWorld Coin has not been added');
  }
} catch (error) {
  console.log(error);
}
}

$('#Metamask').click(()=>{
  addTokenFunction();
});