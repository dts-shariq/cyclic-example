// const appId = "FE4sLckwftC4tvv8wQYXZNfr97vexQplbKnamXww"; // Application id from moralis.io
// const serverUrl = 'https://caqw28zum9pe.usemoralis.com:2053/server'; //Server url from moralis.io
// Moralis.start ({serverUrl, appId });
Moralis.initialize(("021"));  // Application id from moralis.io
Moralis.serverURL = 'http://192.168.100.161:1337/server'; //Server url from moralis.io

//Moralis.start("https://2e1jk4mlcyr3.usemoralis.com:2053/server","V3YPB41ScC14PnIUtkMoxaZnLKE7q83H4XauIiJx");
const BASE_URL = "https://api.coingecko.com/api/v3";
const ETH_USD_PRICE_URL = "/simple/price?ids=ethereum&vs_currencies=usd";

const OpenMintTokenAddress = "0xd5630E240556bf69FdE3D549c49c290e9b9685d8";
const OpenMintMarketplaceAddress = "0x488FB64318dB284eb767D6e0CbBa501360E0ADB0";
const OpenMintErc20 = "0x39B72f4850300662e2E7DeeA13C3FAFEf0cb830C";



let OpenMintTokenInstance;
let OpenMintMarketplaceInstance;
let web3;
let ethPrice;
let user = Moralis.User.current();
const url_string = (window.location.href);
let url = new URL(url_string);
let token = url.searchParams.get('token');

$(document).ready(async function(){
 // web3 = await Moralis.enableWeb3();
 web3 = new Web3(Web3.givenProvider || "ws://192.168.100.161"); 
 OpenMintTokenInstance = new web3.eth.Contract(abi.OpenMintToken, OpenMintTokenAddress);
  OpenMintMarketplaceInstance = new web3.eth.Contract(abi.OpenMintMarketplace, OpenMintMarketplaceAddress);
  OpenMintMarketplaceTokenErc20 = new web3.eth.Contract(abi.MarkToken, OpenMintErc20);
  ethPrice = await getEthPrice();
  getActiveArtworkInfo();
  getInactiveArtworkInfo();
  getTimeCreated();
});



async function getEthPrice(){
  let ethPrice = BASE_URL + ETH_USD_PRICE_URL;
  const response = await fetch(ethPrice);
  const data = await response.json();
  let usdEthPrice = data.ethereum.usd;
  return usdEthPrice;
};

//button in connect modal
$('#connectWalletModalBtn').click(async () =>{
  $('#connectWalletModalBtn').prop('disabled', true);
  $('#connectWalletModalBtn').html(`Connecting... <div class="spinner-border spinner-border-sm text-light" role="status">
                                                        <span class="sr-only">Loading...</span>
                                                      </div>`);
  //this is the one in the nav
  $('#connectWalletBtn').html(`Connecting... <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                  <span class="sr-only">Loading...</span>`);
  try{
    let currentUser = await Moralis.Web3.authenticate();
    if(currentUser){
      location.reload();
    }
  } catch (error) {
    alert(error.message);
    $('#connectWalletModalBtn').prop('disabled', false);
    $('#connectWalletModalBtn').html('Connect Wallet');
    $('#connectWalletBtn').html('Connect');
  }
});

function removeDuplicates(data, key){
  return [
    ...new Map(
        data.map(x => [key(x), x])
    ).values()
  ]
};

async function getOnSaleDetails(){
  try {
    let offerDetails = await Moralis.Cloud.run("getOfferDetails");
    let offerDetailsLength = removeDuplicates(offerDetails, it => it.tokenId).length;
    let offerDetailsDuplicatesRemoved = removeDuplicates(offerDetails, it => it.tokenId);
    console.log(offerDetailsDuplicatesRemoved);
    for (i = 0; i < offerDetailsLength; i++) {
      if(offerDetailsDuplicatesRemoved[i].isSold == "false" && offerDetailsDuplicatesRemoved[i].active == true){
        let tokenAddress = offerDetailsDuplicatesRemoved[i].tokenAddress;
        let id = offerDetailsDuplicatesRemoved[i].tokenId;
        let price = offerDetailsDuplicatesRemoved[i].price;
        if(tokenAddress.toLowerCase() + id.toLowerCase() == token.toLowerCase()){
          return price;
        };
      }
    };
  } catch (err) {
    console.log(err);
  }
};

async function getCurrentOwner(){
  try {
    let owner = await Moralis.Cloud.run('getCurrentOwner');
    for (i = 0; i < owner.length; i++) {
      let tokenAddress = owner[i].tokenAddress;
      let tokenId = owner[i].tokenId;
      let currentOwner = owner[i].owner;
      if(tokenAddress.toLowerCase() + tokenId.toLowerCase() == token.toLowerCase()){
        return currentOwner;
        console.log(currentOwner);
      };
    };
  } catch (err) {
    console.log(err);
  }
};

async function getTimeCreated(){
  let tokenAddress = token.slice(0, 42);
  let tokenId = token.slice(42, token.length);
  const Artwork = Moralis.Object.extend("Artwork");
  const query = new Moralis.Query(Artwork);
  query.equalTo("tokenAddress", tokenAddress);
  query.equalTo("nftId", tokenId);
  const artwork = await query.first();
  return artwork.attributes.createdAt.toDateString() + " " + artwork.attributes.createdAt.toLocaleTimeString();
};

async function getActiveArtworkInfo(){
  try {
    let price = await getOnSaleDetails();
    let owner = await getCurrentOwner();
    let createdAt = await getTimeCreated();

    let activeArtwork = await Moralis.Cloud.run('getArtwork');
    console.log(activeArtwork)
    for (i = 0; i < activeArtwork.length; i++) {
      if(activeArtwork[i].active == true){
        let tokenAddress = activeArtwork[i].tokenAddress;
        let id = activeArtwork[i].tokenId;
        let name = activeArtwork[i].name;
        let description = activeArtwork[i].description;
        let additionalInfo = activeArtwork[i].additionalInfo;
        let unlockableContent = activeArtwork[i].unlockableContent;
        let path = activeArtwork[i].path;
        let creator = activeArtwork[i].creator;
        let fileType = activeArtwork[i].fileType;
        let royalty = activeArtwork[i].royalty;
        let active = activeArtwork[i].active;
        let likes = activeArtwork[i].likes;
        let category = activeArtwork[i].category;
        let picReader = activeArtwork[i].picReader;
        let imagedescription = activeArtwork[i].imagedescription;


        console.log(category);

        if(tokenAddress.toLowerCase() + id.toLowerCase() == token.toLowerCase()){
          $('#loader').css('display', 'none');
          cardDiv(tokenAddress, id, owner, creator, path);
          correctTag(tokenAddress, id, fileType);
          getCreatorPhoto(tokenAddress, id, creator);
          getOwnerPhoto(tokenAddress, id, owner);
          likeButton(tokenAddress, id, likes);
          showHeartsFilled(tokenAddress, id);
          quickActions(tokenAddress, id, owner, active, royalty, creator);
          getUnlockableContentFrontEnd(tokenAddress, id, owner);
          if(user == null){
            $('.if-owned').css('display', 'none');
            $(".if-onsale").css('display', 'block');
            $(".not-onsale").css('display', 'none');
            buy(tokenAddress, id, price, royalty, creator);
          }

          let priceInEth = web3.utils.fromWei(price, 'ether');
          let priceInUsd = (priceInEth * ethPrice).toFixed(2);
          // $('#forSale' + tokenAddress + id).html(`${priceInEth} ILIFETOKEN <span class="sub-text">($${priceInUsd})</span>`); ETH Price remove
          $('#forSale' + tokenAddress + id).html(`${priceInEth} ILIFETOKEN`);


          $('.not-on-sale-text').css('display', 'none'); 
           $('#nft' + tokenAddress + id).css('display', 'block');

          $('#nft' + tokenAddress + id).attr('src', path);
          $('#nft' + tokenAddress + id).css('display', 'none');
          if(fileType == 'image/png' || fileType == 'image/jpeg' || fileType == 'image/gif' || fileType == 'image/webp'){
            dismissLoadingPulse(tokenAddress, id, path);
          }else{
            $('#nft' + tokenAddress + id).css('display', 'block');
            $('#nftSpinner' + tokenAddress + id).css('display', 'none');
          }

          $('#title' + tokenAddress + id).html(name);
          if(imagedescription == ''){
            $('#imagedescription' + tokenAddress + id).css({'color': "#888", 'font-size': ".8rem", 'font-weight': '500'});
            $('#imagedescription' + tokenAddress + id).html('(No description given)');
          } else{
            $('#imagedescription' + tokenAddress + id).html(imagedescription);
          }

          
          $('#category' + tokenAddress + id).html(category);
          $('#createdAt' + tokenAddress + id).html(createdAt);
          $('#royalty' + tokenAddress + id).html(royalty);

        
      
   

          $('#picReader1' + tokenAddress + id).attr('src', picReader[0]);
          $('#picReader2' + tokenAddress + id).attr('src', picReader[1]);
          $('#picReader3' + tokenAddress + id).attr('src', picReader[2]);
          $('#picReader4' + tokenAddress + id).attr('src', picReader[3]);
          $('#picReader5' + tokenAddress + id).attr('src', picReader[4]);
          $('#picReader6' + tokenAddress + id).attr('src', picReader[5]);
          $('#picReader7' + tokenAddress + id).attr('src', picReader[6]);
          $('#picReader8' + tokenAddress + id).attr('src', picReader[7]);
          $('#picReader9' + tokenAddress + id).attr('src', picReader[8]);
          $('#picReader10' + tokenAddress + id).attr('src', picReader[9]);
         

          $('#picReader11' + tokenAddress + id).attr('src', picReader[0]);
          $('#picReader22' + tokenAddress + id).attr('src', picReader[1]);
          $('#picReader33' + tokenAddress + id).attr('src', picReader[2]);
          $('#picReader44' + tokenAddress + id).attr('src', picReader[3]);
          $('#picReader55' + tokenAddress + id).attr('src', picReader[4]);
          $('#picReader66' + tokenAddress + id).attr('src', picReader[5]);
          $('#picReader77' + tokenAddress + id).attr('src', picReader[6]);
          $('#picReader88' + tokenAddress + id).attr('src', picReader[7]);
          $('#picReader99' + tokenAddress + id).attr('src', picReader[8]);
          $('#picReader100' + tokenAddress + id).attr('src', picReader[9]);

          if(unlockableContent && user.attributes.ethAddress.toLowerCase() == owner.toLowerCase()){
            $('.unlockable-div').css('display', 'block');
            $('#unlockableContentBtn' + tokenAddress + id).addClass('unlockable-content-shadow');
            $('#unlockableContentBtn' + tokenAddress + id).html('Unlocked');
          } else if(unlockableContent){
            $('.unlockable-div').css('display', 'block');
            $('#unlockableContentBtn' + tokenAddress + id).removeClass('unlockable-content-shadow');
            $('#unlockableContentBtn' + tokenAddress + id).html('Unlockable');
          }

          getAdditionalInfo(tokenAddress, id, additionalInfo, owner);

          if(user.attributes.ethAddress.toLowerCase() == owner.toLowerCase()){
            $('.if-owned').css('display', 'block');
            $(".not-onsale").css('display', 'none');
            $(".if-onsale").css('display', 'none');

            if(owner.toLowerCase() == user.attributes.ethAddress.toLowerCase() && !additionalInfo){
            $('#additionalInfo' + tokenAddress + id).css('display', 'inline');
             $('#additionalInfo' + tokenAddress + id).html('Add Additional Info');
             $('#additionalInfoText').css('display', 'block');
             $('#additionalInfoText').html(additionalInfo);
             $('#additionalInfo' + tokenAddress + id).click(()=>{
               $('#additionalInfoModal').modal('show');
             });
           } else if(owner.toLowerCase() == user.attributes.ethAddress.toLowerCase() && additionalInfo){
             $('#additionalInfo' + tokenAddress + id).html('View/Edit Additional Info');
             $('#additionalInfoText').css('display', 'block');
             $('#additionalInfoText').html(additionalInfo);
             $('#additionalInfo' + tokenAddress + id).click(()=>{
               $('#additionalInfoModal').modal('show');
             });
           }

          } else{
            $('.if-owned').css('display', 'none');
            $(".if-onsale").css('display', 'block');
            $(".not-onsale").css('display', 'none');
            buy(tokenAddress, id, price, royalty, creator);
          }
        }
      };
    };
  } catch (err) {
    console.log(err);
  }
};

async function getInactiveArtworkInfo(){
  try {
    let price = await getOnSaleDetails();
    let owner = await getCurrentOwner();
    let createdAt = await getTimeCreated();

    let inactiveArtwork = await Moralis.Cloud.run('getArtwork');

    for (i = 0; i < inactiveArtwork.length; i++) {
      if(inactiveArtwork[i].active == false){
        let tokenAddress = inactiveArtwork[i].tokenAddress;
        let id = inactiveArtwork[i].tokenId;
        let name = inactiveArtwork[i].name;
        let description = inactiveArtwork[i].description;
        let additionalInfo = inactiveArtwork[i].additionalInfo;
        let unlockableContent = inactiveArtwork[i].unlockableContent;
        let path = inactiveArtwork[i].path;
        let creator = inactiveArtwork[i].creator;
        let fileType = inactiveArtwork[i].fileType;
        let royalty = inactiveArtwork[i].royalty;
        let active = inactiveArtwork[i].active;
        let likes = inactiveArtwork[i].likes;
        let category = inactiveArtwork[i].category;
        let encouragements = inactiveArtwork[i].encouragements;
        let picReader = inactiveArtwork[i].picReader;
        let imagedescription = inactiveArtwork[i].imagedescription;
       
        if(tokenAddress.toLowerCase() + id.toLowerCase() == token.toLowerCase()){
          $('#loader').css('display', 'none');
          cardDiv(tokenAddress, id, owner, creator, path);
          correctTag(tokenAddress, id, fileType);
          getCreatorPhoto(tokenAddress, id, creator);
          getOwnerPhoto(tokenAddress, id, owner);
          likeButton(tokenAddress, id, likes);
          showHeartsFilled(tokenAddress, id);
          quickActions(tokenAddress, id, owner, active, royalty, creator);
          getUnlockableContentFrontEnd(tokenAddress, id, owner);
          if(user == null){
            $('.if-owned').css('display', 'none');
            $(".if-onsale").css('display', 'none');
            $(".not-onsale").css('display', 'block');
          }

          $('.on-sale-text').css('display', 'none');
          $('#notForSale' + tokenAddress + id).html(`<button id="encourageBell`+tokenAddress+id+`" class="btn like-encourage-button fas fa-concierge-bell"><span class="like-encourage-text" id="encourageCounter`+tokenAddress+id+`"></span></button>`);
          if(encouragements < 1 || encouragements == undefined){
            $('#encourageCounter' + tokenAddress + id).html(' Encourage To Sell');
          } else{
            $('#encourageCounter' + tokenAddress + id).html(` ${encouragements}`);
          }
          encourageButton(tokenAddress, id);
          showBellsFilled(tokenAddress, id);
          encourageToSellButton(tokenAddress, id);

          $('#nft' + tokenAddress + id).attr('src', path);
          $('#nft' + tokenAddress + id).css('display', 'none');
          if(fileType == 'image/png' || fileType == 'image/jpeg' || fileType == 'image/gif' || fileType == 'image/webp'){
            dismissLoadingPulse(tokenAddress, id, path);
          }else{
            $('#nft' + tokenAddress + id).css('display', 'block');
            $('#nftSpinner' + tokenAddress + id).css('display', 'none');
          }

          $('#title' + tokenAddress + id).html(name);
          if(imagedescription == ''){
            $('#imagedescription' + tokenAddress + id).css({'color': "#888", 'font-size': ".8rem", 'font-weight': '500'});
            $('#imagedescription' + tokenAddress + id).html('(No description given)');
          } else{
            $('#imagedescription' + tokenAddress + id).html(imagedescription);
          }

          
          $('#category' + tokenAddress + id).html(category);
          $('#createdAt' + tokenAddress + id).html(createdAt);
          $('#royalty' + tokenAddress + id).html(royalty);


          $('#picReader1' + tokenAddress + id).attr('src', picReader[0]);
          $('#picReader2' + tokenAddress + id).attr('src', picReader[1]);
          $('#picReader3' + tokenAddress + id).attr('src', picReader[2]);
          $('#picReader4' + tokenAddress + id).attr('src', picReader[3]);
          $('#picReader5' + tokenAddress + id).attr('src', picReader[4]);
          $('#picReader6' + tokenAddress + id).attr('src', picReader[5]);
          $('#picReader7' + tokenAddress + id).attr('src', picReader[6]);
          $('#picReader8' + tokenAddress + id).attr('src', picReader[7]);
          $('#picReader9' + tokenAddress + id).attr('src', picReader[8]);
          $('#picReader10' + tokenAddress + id).attr('src', picReader[9]);

          $('#picReader11' + tokenAddress + id).attr('src', picReader[0]);
          $('#picReader22' + tokenAddress + id).attr('src', picReader[1]);
          $('#picReader33' + tokenAddress + id).attr('src', picReader[2]);
          $('#picReader44' + tokenAddress + id).attr('src', picReader[3]);
          $('#picReader55' + tokenAddress + id).attr('src', picReader[4]);
          $('#picReader66' + tokenAddress + id).attr('src', picReader[5]);
          $('#picReader77' + tokenAddress + id).attr('src', picReader[6]);
          $('#picReader88' + tokenAddress + id).attr('src', picReader[7]);
          $('#picReader99' + tokenAddress + id).attr('src', picReader[8]);
          $('#picReader100' + tokenAddress + id).attr('src', picReader[9]);
       
       
        

        
          if(unlockableContent && user.attributes.ethAddress.toLowerCase() == owner.toLowerCase()){
            $('.unlockable-div').css('display', 'block');
            $('#unlockableContentBtn' + tokenAddress + id).addClass('unlockable-content-shadow');
            $('#unlockableContentBtn' + tokenAddress + id).html('Unlocked');
          } else if(unlockableContent){
            $('.unlockable-div').css('display', 'block');
            $('#unlockableContentBtn' + tokenAddress + id).removeClass('unlockable-content-shadow');
            $('#unlockableContentBtn' + tokenAddress + id).html('Unlockable');
          }

          getAdditionalInfo(tokenAddress, id, additionalInfo, owner);
          
          if(user.attributes.ethAddress.toLowerCase() == owner.toLowerCase()){
            $('.if-owned').css('display', 'block');
            $(".not-onsale").css('display', 'none');
            $(".if-onsale").css('display', 'none');

            if(owner.toLowerCase() == user.attributes.ethAddress.toLowerCase() && !additionalInfo){
            $('#additionalInfo' + tokenAddress + id).css('display', 'inline');
             $('#additionalInfo' + tokenAddress + id).html('Add Additional Info');
             $('#additionalInfoText').css('display', 'block');
             $('#additionalInfoText').html(additionalInfo);
           
             $('#additionalInfo' + tokenAddress + id).click(()=>{
              $('#additionalInfoModal').modal('show');
        
           
             });
             


           } else if(owner.toLowerCase() == user.attributes.ethAddress.toLowerCase() && additionalInfo){
             $('#additionalInfo' + tokenAddress + id).html('View/Edit Additional Info');
             $('#additionalInfoText').css('display', 'block');
             $('#additionalInfoText').html(additionalInfo);
             $('#additionalInfo' + tokenAddress + id).click(()=>{
               $('#additionalInfoModal').modal('show');
             });
             $('#addadditionalpic' + tokenAddress + id).click(()=>{
              $('#additionalInfoModal').modal('show');
            });
             
           }

          } else{
            $('.if-owned').css('display', 'none');
            $(".if-onsale").css('display', 'none');
            $(".not-onsale").css('display', 'block');
          }
        }
      };
    };
  } catch (err) {
    console.log(err);
  }
};

function dismissLoadingPulse(tokenAddress, id, path){
  let nft = new Image;

  nft.src = path;
  nft.onload = function(){
    $('#nftSpinner' + tokenAddress + id).css('display', 'none');
    $('#nft' + tokenAddress + id).css('display', 'block');
  };
  nft.onerror = function(){
    $('#nftSpinner' + tokenAddress + id).css('display', 'none');
    $('#nft' + tokenAddress + id).css('display', 'block');
    $('#nft' + tokenAddress + id).attr('src', './assets/images-icons/cantFindNFT.png');
    console.log('No network connection or NFT is not available.')
  };
};

async function getOwnerPhoto(tokenAddress, id, owner){
  $('#ownerPhoto' + tokenAddress + id).css('display', 'none');
  $('#ownerRank' + tokenAddress + id).css('display', 'none');
  ifOwnerNotInDatabase(tokenAddress, id, owner);
  try{
    let users = await Moralis.Cloud.run('getAllUsers');
    for (i = 0; i < users.length; i++) {
      let profilePhoto = users[i].profilePhoto;
      let username = users[i].username;
      let ethAddress = users[i].ethAddress;
      let amountSold = users[i].amountSold;

      if(ethAddress == owner){
        $('#ownerName' + tokenAddress + id).html(username);
      }

      if(ethAddress == owner && profilePhoto){
        addSellerBadgeForOwner(tokenAddress, id, amountSold);
        $('#ownerPhoto' + tokenAddress + id).attr('src', profilePhoto._url);
        dismissLoadingPulseOnOwnerPhoto(tokenAddress, id, profilePhoto._url);
      } else if (ethAddress == owner && !profilePhoto){
        addSellerBadgeForOwner(tokenAddress, id, amountSold);
        console.log('did not set profile photo, default used');
        $('#ownerPhoto' + tokenAddress + id).attr('src', './assets/images-icons/default.png');
        let defaultProfilePhoto = "./assets/images-icons/default.png"
        dismissLoadingPulseOnOwnerPhoto(tokenAddress, id, defaultProfilePhoto);
      }
    }
  } catch(err){
    console.log(err);
  }
};

function dismissLoadingPulseOnOwnerPhoto(tokenAddress, id, profilePhoto){
  let img = new Image;
  img.src = profilePhoto;
  img.onload = function(){
    $('#ownerSpinner' + tokenAddress + id).css('display', 'none');
    $('#ownerPhoto' + tokenAddress + id).css('display', 'inline');
    $('#ownerRank' + tokenAddress + id).css('display', 'block');
    console.log('owners profilePhoto succesfully loaded!')
  };
  img.onerror = function(){
    $('#ownerSpinner' + tokenAddress + id).css('display', 'none');
    $('#ownerPhoto' + tokenAddress + id).css('display', 'inline');
    $('#ownerRank' + tokenAddress + id).css('display', 'block');
    $('#ownerPhoto' + tokenAddress + id).attr('src', './assets/images-icons/cantFindProfilePhoto.png');
    console.log('No network connection or profilephoto is not available.')
  };
};


function addSellerBadgeForOwner(tokenAddress, id, amountSold){
  if (amountSold == undefined){
    $('#ownerRank' + tokenAddress + id).attr('src', './assets/images-icons/noSales.png');
  } else if(amountSold >= 1 && amountSold <= 4){
    $('#ownerRank' + tokenAddress + id).attr('src', './assets/images-icons/oneSale.png');
  } else if(amountSold >= 5 && amountSold <= 9){
    $('#ownerRank' + tokenAddress + id).attr('src', './assets/images-icons/fiveSales.png');
  } else if(amountSold >= 10 && amountSold <= 19){
    $('#ownerRank' + tokenAddress + id).attr('src', './assets/images-icons/tenSales.png');
  } else if(amountSold >= 20 && amountSold <= 34){
    $('#ownerRank' + tokenAddress + id).attr('src', './assets/images-icons/twentySales.png');
  } else if(amountSold >= 35 && amountSold <= 49){
    $('#ownerRank' + tokenAddress + id).attr('src', './assets/images-icons/thirtyfiveSales.png');
  } else if(amountSold >= 50 && amountSold <= 74){
    $('#ownerRank' + tokenAddress + id).attr('src', './assets/images-icons/fiftySales.png');
  } else if(amountSold >= 75 && amountSold <= 99){
    $('#ownerRank' + tokenAddress + id).attr('src', './assets/images-icons/seventyfiveSales.png');
  } else if(amountSold >= 100){
    $('#ownerRank' + tokenAddress + id).attr('src', './assets/images-icons/hundredPlusSales.png');
  }
};

async function getCreatorPhoto(tokenAddress, id, creator){
  $('#creatorPhoto' + tokenAddress + id).css('display', 'none');
  $('#creatorRank' + tokenAddress + id).css('display', 'none');
  try{
    let users = await Moralis.Cloud.run('getAllUsers');
    for (i = 0; i < users.length; i++) {
      let profilePhoto = users[i].profilePhoto;
      let username = users[i].username;
      let ethAddress = users[i].ethAddress;
      let amountSold = users[i].amountSold;

      if(ethAddress == creator){
        $('#creatorName' + tokenAddress + id).html(username);
      }

      if(ethAddress == creator && profilePhoto){
        addSellerBadgeForCreator(tokenAddress, id, amountSold);
        $('#creatorPhoto' + tokenAddress + id).attr('src', profilePhoto._url);
        dismissLoadingPulseOnCreatorPhoto(tokenAddress, id, profilePhoto._url)
      } else if (ethAddress == creator && !profilePhoto){
        addSellerBadgeForCreator(tokenAddress, id, amountSold);
        console.log('did not set profile photo, default used')
        $('#creatorPhoto' + tokenAddress + id).attr('src', './assets/images-icons/default.png');
        let defaultProfilePhoto = "./assets/images-icons/default.png"
        dismissLoadingPulseOnCreatorPhoto(tokenAddress, id, defaultProfilePhoto);
      }
    }
  } catch(err){
    console.log(err);
  }
};

function dismissLoadingPulseOnCreatorPhoto(tokenAddress, id, profilePhoto){
  let img = new Image;
  img.src = profilePhoto;
  img.onload = function(){
    $('#creatorSpinner' + tokenAddress + id).css('display', 'none');
    $('#creatorPhoto' + tokenAddress + id).css('display', 'inline');
    $('#creatorRank' + tokenAddress + id).css('display', 'block');
    console.log('creator profilePhoto succesfully loaded!')
  };
  img.onerror = function(){
    $('#creatorSpinner' + tokenAddress + id).css('display', 'none');
    $('#creatorPhoto' + tokenAddress + id).css('display', 'inline');
    $('#creatorRank' + tokenAddress + id).css('display', 'block');
    $('#creatorPhoto' + tokenAddress + id).attr('src', './assets/images-icons/cantFindProfilePhoto.png')
    console.log('No network connection or profilephoto is not available.')
  };
};

function addSellerBadgeForCreator(tokenAddress, id, amountSold){
  if (amountSold == undefined){
    $('#creatorRank' + tokenAddress + id).attr('src', './assets/images-icons/noSales.png');
  } else if(amountSold >= 1 && amountSold <= 4){
    $('#creatorRank' + tokenAddress + id).attr('src', './assets/images-icons/oneSale.png');
  } else if(amountSold >= 5 && amountSold <= 9){
    $('#creatorRank' + tokenAddress + id).attr('src', './assets/images-icons/fiveSales.png');
  } else if(amountSold >= 10 && amountSold <= 19){
    $('#creatorRank' + tokenAddress + id).attr('src', './assets/images-icons/tenSales.png');
  } else if(amountSold >= 20 && amountSold <= 34){
    $('#creatorRank' + tokenAddress + id).attr('src', './assets/images-icons/twentySales.png');
  } else if(amountSold >= 35 && amountSold <= 49){
    $('#creatorRank' + tokenAddress + id).attr('src', './assets/images-icons/thirtyfiveSales.png');
  } else if(amountSold >= 50 && amountSold <= 74){
    $('#creatorRank' + tokenAddress + id).attr('src', './assets/images-icons/fiftySales.png');
  } else if(amountSold >= 75 && amountSold <= 99){
    $('#creatorRank' + tokenAddress + id).attr('src', './assets/images-icons/seventyfiveSales.png');
  } else if(amountSold >= 100){
    $('#creatorRank' + tokenAddress + id).attr('src', './assets/images-icons/hundredPlusSales.png');
  }
};

function correctTag(tokenAddress, id, fileType){
  let tag;
  if(fileType == 'image/png' || fileType == 'image/jpeg' || fileType == 'image/gif' || fileType == 'image/webp'){
    tag = `<img loading="lazy" class="nft-img shadow-sm" id='nft`+tokenAddress+id+`' src="" alt="">`
    $('.path').append(tag);
  } else if (fileType == "video/mp4" || fileType == "video/webm") {
    tag = `<video src="" class="nft-img shadow-sm" id="nft`+tokenAddress+id+`" autoplay controls loop disablePictureInPicture controlsList="nodownload"></video>`
    $('.path').append(tag);
    console.log('its a video1')
  } else if (fileType == "audio/mp3" || fileType == "audio/webm" || fileType == "audio/mpeg"){
    tag = `<audio src="" class="nft-img shadow-sm" id="nft`+tokenAddress+id+`" autoplay controls controlsList="nodownload"></audio>`
    $('.path').append(tag);
  }
};

async function showBellsFilled(tokenAddress, id){
  if(user){
    const params = {
      tokenAddress: tokenAddress,
      tokenId: id
      };
    let likeQuery = await Moralis.Cloud.run('userEncouragedThisArtwork', params);
    if(likeQuery){
      $('#encourageToSellBtn' + tokenAddress + id).removeClass('btn-secondary');
      $('#encourageToSellBtn' + tokenAddress + id).addClass('btn-warning');
      $('#encourageToSellBtn' + tokenAddress + id).html('Encouraged To Sell ✅');
      $('#encourageToSellText' + tokenAddress + id).html('Item has been encouraged to be put on sale')
      $('#encourageBell' + tokenAddress + id).css('color', '#fac418');
    } else{
      $('#encourageToSellBtn' + tokenAddress + id).removeClass('btn-warning');
      $('#encourageToSellBtn' + tokenAddress + id).addClass('btn-secondary');
      $('#encourageToSellBtn' + tokenAddress + id).html('Encourage To Sell');
      $('#encourageBell' + tokenAddress + id).css('color', '#aaa');
    }
  }
};

function encourageButton(tokenAddress, id){
  $('#encourageBell' + tokenAddress + id).click(async ()=>{
    if(user){
      $('#encourageBell' + tokenAddress + id).prop('disabled', true);
      $('#encourageToSellBtn' + tokenAddress + id).prop('disabled', true);

      const params = {
        tokenAddress: tokenAddress,
        tokenId: id
        };
      let encourage = await Moralis.Cloud.run('encourage', params);
      if(encourage == 0 || encourage == undefined){
        $('#encourageCounter' + tokenAddress + id).html(' Encourage To Sell');
        $('#encourageBell' + tokenAddress + id).prop('disabled', false);
        $('#encourageToSellBtn' + tokenAddress + id).prop('disabled', false);
      }else{
        $('#encourageCounter' + tokenAddress + id).html(` ${encourage}`);
        $('#encourageBell' + tokenAddress + id).prop('disabled', false);
        $('#encourageToSellBtn' + tokenAddress + id).prop('disabled', false);
      }
      let encourageQuery = await Moralis.Cloud.run('userEncouragedThisArtwork', params);
      if(encourageQuery){
        $('#encourageToSellBtn' + tokenAddress + id).removeClass('btn-secondary');
        $('#encourageToSellBtn' + tokenAddress + id).addClass('btn-warning');
        $('#encourageToSellBtn' + tokenAddress + id).html('Encouraged To Sell ✅');
        $('#encourageBell' + tokenAddress + id).css('color', '#fac418');
        $('#encourageToSellText' + tokenAddress + id).html('Item has been encouraged to be put on sale');
      } else{
        $('#encourageToSellBtn' + tokenAddress + id).removeClass('btn-warning');
        $('#encourageToSellBtn' + tokenAddress + id).addClass('btn-secondary');
        $('#encourageToSellBtn' + tokenAddress + id).html('Encourage To Sell');
        $('#encourageBell' + tokenAddress + id).css('color', '#aaa');
        $('#encourageToSellText' + tokenAddress + id).html('Item is not on sale, but you can encourage them to put on sale');
      }
    } else{
      $('#ifWalletNotConnectedModal').modal('show');
    }
  });
};

function encourageToSellButton(tokenAddress, id){
  $('#encourageToSellBtn' + tokenAddress + id).click(async ()=>{
    if(user){
      $('#encourageBell' + tokenAddress + id).prop('disabled', true);
      $('#encourageToSellBtn' + tokenAddress + id).prop('disabled', true);
      const params = {
        tokenAddress: tokenAddress,
        tokenId: id
        };
      let encourage = await Moralis.Cloud.run('encourage', params);
      if(encourage == 0 || encourage == undefined){
        $('#encourageCounter' + tokenAddress + id).html(' Encourage To Sell');
        $('#encourageBell' + tokenAddress + id).prop('disabled', false);
        $('#encourageToSellBtn' + tokenAddress + id).prop('disabled', false);
      }else{
        $('#encourageCounter' + tokenAddress + id).html(` ${encourage}`);
        $('#encourageBell' + tokenAddress + id).prop('disabled', false);
        $('#encourageToSellBtn' + tokenAddress + id).prop('disabled', false);
      }
      let encourageQuery = await Moralis.Cloud.run('userEncouragedThisArtwork', params);
      if(encourageQuery){
        $('#encourageBell' + tokenAddress + id).css('color', '#fac418');
        $('#encourageToSellText' + tokenAddress + id).html('Item has been encouraged to be put on sale');
        $('#encourageToSellBtn' + tokenAddress + id).removeClass('btn-secondary');
        $('#encourageToSellBtn' + tokenAddress + id).addClass('btn-warning');
        $('#encourageToSellBtn' + tokenAddress + id).html('Encouraged To Sell ✅');
      } else{
        $('#encourageToSellBtn' + tokenAddress + id).removeClass('btn-warning');
        $('#encourageToSellBtn' + tokenAddress + id).addClass('btn-secondary');
        $('#encourageToSellBtn' + tokenAddress + id).html('Encourage To Sell');
        $('#encourageBell' + tokenAddress + id).css('color', '#aaa');
        $('#encourageToSellText' + tokenAddress + id).html('Item is not on sale, but you can encourage them to put on sale')
      }
    } else{
      $('#ifWalletNotConnectedModal').modal('show');
    }
  });
};

async function showHeartsFilled(tokenAddress, id){
  if(user){
    const params = {
      tokenAddress: tokenAddress,
      tokenId: id
      };
    let likeQuery = await Moralis.Cloud.run('userLikesThisArtwork', params);
    if(likeQuery){
      $('#like' + tokenAddress + id).removeClass('far');
      $('#like' + tokenAddress + id).addClass('fas');
    } else{
      $('#like' + tokenAddress + id).removeClass('fas');
      $('#like' + tokenAddress + id).addClass('far');
    }
  }
};

function likeButton(tokenAddress, id, likes){
  if(likes > 0){
    $('#likeCounter' + tokenAddress + id).html(likes);
  }
  $('#like' + tokenAddress + id).click(async ()=>{
    if(user){
      $('#like' + tokenAddress + id).prop('disabled', true);
      const params = {
        tokenAddress: tokenAddress,
        tokenId: id
        };
      let like = await Moralis.Cloud.run('like', params);
      if(like || !like){
        $('#likeCounter' + tokenAddress + id).html(like);
        $('#like' + tokenAddress + id).prop('disabled', false);
      }
      let likeQuery = await Moralis.Cloud.run('userLikesThisArtwork', params);
      if(likeQuery){
        $('#like' + tokenAddress + id).removeClass('far');
        $('#like' + tokenAddress + id).addClass('fas');
      } else{
        $('#like' + tokenAddress + id).removeClass('fas');
        $('#like' + tokenAddress + id).addClass('far');
      }
    } else{
      $('#ifWalletNotConnectedModal').modal('show');
    }
  });
};

function getAdditionalInfo(tokenAddress, id, additionalInfo, owner){
  if(additionalInfo){
    $('#additionalInfo' + tokenAddress + id).html('View Additional Info');
    $('#additionalInfoText').css('display', 'block');
    $('#additionalInfoText').html(additionalInfo);
    $('#additionalInfo' + tokenAddress + id).click(()=>{
      $('#additionalInfoModal').modal('show');
    });
  } else {
    $('#additionalInfo' + tokenAddress + id).css('display', 'none');
    $('#additionalInfoText').css('display', 'none');
  }
  editAdditionalInfoIfOwner(tokenAddress, id, owner);
};

$('#additionalInfoModal').on('hidden.bs.modal', function (e) {
  $('#status').html('');
});

function editAdditionalInfoIfOwner(tokenAddress, id, owner){
  if(owner.toLowerCase() == user.attributes.ethAddress.toLowerCase()){
    $('#editAdditionalInfo').css('display', 'block');

    $('#editAdditionalInfo').click(()=>{
      let currentInfo = $('#additionalInfoText').html();
      console.log(currentInfo)
      $('#additionalInfoInput').css('display', 'block');
      $('#additionalInfoInput').val(currentInfo);
      $('#additionalInfoText').css('display', 'none');
      $('#editAdditionalInfo').css('display', 'none');
      $('#saveAdditionalInfo').css('display', 'block');
      saveNewInfo(tokenAddress, id);
    });
  } else{
    $('#editAdditionalInfo').css('display', 'none');
  }
};

function saveNewInfo(tokenAddress, id){
  $('#saveAdditionalInfo').click(async()=>{
    $('#saveAdditionalInfo').prop('disabled', true);
    $('#saveAdditionalInfo').html(`Saving <div class="spinner-border spinner-border-sm text-light" role="status">
                                    <span class="sr-only">Loading...</span>
                                  </div>`);
    try{
      saveNewInfoCloudFunction(tokenAddress, id)
      $('#saveAdditionalInfo').prop('disabled', false);
      $('#saveAdditionalInfo').html('Save');
      $('#status').removeClass('text-danger');
      $('#status').addClass('text-success');
      $('#status').html('Successfully Saved');
      $('#additionalInfoText').css('display', 'block');
      $('#editAdditionalInfo').css('display', 'block');
      $('#additionalInfoInput').css('display', 'none');
      $('#saveAdditionalInfo').css('display', 'none');
      let newInfo = $('#additionalInfoInput').val();
      console.log(newInfo)
      $('#additionalInfoText').html(newInfo);
      $('#additionalInfo' + tokenAddress + id).html('View/Edit Additional Info');
    } catch(err){
      console.log(err);
      alert(err.message);
      $('#saveAdditionalInfo').prop('disabled', false);
      $('#saveAdditionalInfo').html("Try Again")
      $('#status').removeClass('text-success');
      $('#status').addClass('text-danger');
      $('#status').html('Something Went Wrong');
      $('#saveAdditionalInfo').click(async ()=>{
        saveNewInfoCloudFunction(tokenAddress, id)
      });
    }
  });
};

async function saveNewInfoCloudFunction(tokenAddress, id){
  const params = {
    tokenAddress: tokenAddress,
    tokenId: id,
    updatedAdditionalInfo: $('#additionalInfoInput').val()
  };
  const update = await Moralis.Cloud.run('updateAdditionalInfo', params);
};

function quickActions(tokenAddress, id, owner, active, royalty, creator){
  if(user == null || user.attributes.ethAddress.toLowerCase() !== owner.toLowerCase()){
    $('#quickActions' + tokenAddress + id).html(`<a class="dropdown-item quick-action" id="shareQuickAction`+tokenAddress+id+`" data-toggle="modal" data-target="#shareModal`+tokenAddress+id+`">Share</a>`);
  } else if(user.attributes.ethAddress.toLowerCase() == owner.toLowerCase() && active == true){
    $('#quickActions' + tokenAddress + id).html(` <a class="dropdown-item quick-action" id="changePriceQuickAction`+tokenAddress+id+`" data-toggle="modal" data-target="#changePriceModal`+tokenAddress+id+`">Change price</a>
                                                   
                                                  <a class="dropdown-item quick-action" id="shareQuickAction`+tokenAddress+id+`" data-toggle="modal" data-target="#shareModal`+tokenAddress+id+`">Share</a>`
                                                );
  } else if(user.attributes.ethAddress.toLowerCase() == owner.toLowerCase() && active == false){
    $('#quickActions' + tokenAddress + id).html(` <a class="dropdown-item quick-action" id="putForSaleQuickAction`+tokenAddress+id+`" data-toggle="modal" data-target="#putForSaleModal`+tokenAddress+id+`">Put for sale</a>
                                                    
                                                  <a class="dropdown-item quick-action" id="shareQuickAction`+tokenAddress+id+`" data-toggle="modal" data-target="#shareModal`+tokenAddress+id+`">Share</a>`
                                                );
  }
  shareQuickActionButton(tokenAddress, id);
  putForSaleQuickActionButton(tokenAddress, id, royalty, creator);
  removeFromSaleQuickActionButton(tokenAddress, id, royalty, creator);
  changePriceQuickActionButton(tokenAddress, id, royalty, creator);
  transferTokenQuickActionButton(tokenAddress, id);
  darkmodeForDynamicContent();
};

function shareQuickActionButton(tokenAddress, id){
  $("#shareQuickAction" + tokenAddress + id).click(()=>{
    shareModalHTML(tokenAddress, id);
    shareOptions(tokenAddress, id);

    onModalClose(tokenAddress, id);
    darkmodeForDynamicContent();
  });
};

function putForSaleQuickActionButton(tokenAddress, id, royalty, creator){
  $('#putForSaleQuickAction' + tokenAddress + id).click(() =>{
    putForSaleModalHTML(tokenAddress, id);
    if(creator == user.attributes.ethAddress){
      $('#ifOwnerNotCreator' + tokenAddress + id).css('display', 'none');
    } else{
      $('#ifOwnerNotCreator' + tokenAddress + id).css('display', 'block');
      $('#royalty' + tokenAddress + id).html(`${royalty}%`);
    }

    checkForApprovalBeforePuttingOnSale(tokenAddress, id);
    setApprovalIfNeeded(tokenAddress, id);
    putOnSale(tokenAddress, id, royalty, creator);
    putForSaleInput(tokenAddress, id, royalty, creator);

    onModalClose(tokenAddress, id);
    darkmodeForDynamicContent();
  });
};

function removeFromSaleQuickActionButton(tokenAddress, id, royalty, creator){
  $('#removeFromSaleQuickAction' + tokenAddress + id).click(() =>{
    removeFromSaleModalHTML(tokenAddress, id);

    removeFromSale(tokenAddress, id, royalty, creator);

    onModalClose(tokenAddress, id);
    darkmodeForDynamicContent();
  });
};

function changePriceQuickActionButton(tokenAddress, id, royalty, creator){
  $('#changePriceQuickAction' + tokenAddress + id).click(() =>{
    changePriceModalHTML(tokenAddress, id);
    if(creator == user.attributes.ethAddress){
      $('#ifOwnerNotCreator' + tokenAddress + id).css('display', 'none');
    } else{
      $('#ifOwnerNotCreator' + tokenAddress + id).css('display', 'block');
      $('#royalty' + tokenAddress + id).html(`${royalty}%`);
    }

    changePriceFrontEnd(tokenAddress, id, royalty, creator);
    changePriceInput(tokenAddress, id, royalty, creator);

    onModalClose(tokenAddress, id);
    darkmodeForDynamicContent();
  });
};

function transferTokenQuickActionButton(tokenAddress, id){
  $('#transferTokenQuickAction' + tokenAddress + id).click(() =>{
    transferTokenModalHTML(tokenAddress, id);

    transferToken(tokenAddress, id);
    toAddressInput(tokenAddress, id);

    onModalClose(tokenAddress, id);
    darkmodeForDynamicContent();
  });
};

function shareOptions(tokenAddress, id){
  //obviously changing 192.168.100.161.sslip.io to real url when hosted
  let left = screen.width / 3;
  let top = screen.height / 3;
  let width = screen.width / 3;
  let height = screen.height / 3;
  let tokenPage = window.location.href;
  let tweet = `https://twitter.com/intent/tweet?text=Check%20out%20this%20NFT%20on%20OpenMint!&hashtags=OpenMint%2Cbsc%2Cnonfungible%2Cdigitalasset%2Cnft&via=OpenMint&url=${tokenPage}`;
  let post = `https://www.facebook.com/sharer/sharer.php?u=${tokenPage}%3F&quote=Check%20out%20this%20NFT%20on%20OpenMint`;

  $('#twitterBtnInModal' + tokenAddress + id).click(()=>{
    window.open(tweet, 'popup', `width=${width},height=${height},top=${top},left=${left}`);
  });

  $('#facebookBtnInModal' + tokenAddress + id).click(()=>{
    window.open(post, 'popup', `width=${width},height=${height},top=${top},left=${left}`);
  });

  $('#emailBtnInModal' + tokenAddress + id).click(()=>{
    window.location.href = `mailto:user@example.com?subject=Check%20out%20this%20NFT%20on%20OpenMint&body=Never%20seen%20anything%20quite%20like%20this,%20${tokenPage}`;
  });
};

function onModalClose(tokenAddress, id){
  $('.modal').on('hidden.bs.modal', function (e) {
    $('.modals').empty();
    $('#changePriceInput' + tokenAddress + id).val('');
    $('#changePriceBtn' + tokenAddress + id).prop('disabled', true);
    $('#changePriceSaleProfit' + tokenAddress + id).html('0 ILIFETOKEN');
    $('#changePriceUSDProfit' + tokenAddress + id).html('$0.00');

    $('#salePriceInput' + tokenAddress + id).val('');
    $('#putOnSaleBtn' + tokenAddress + id).prop('disabled', true);
    $('#saleProfit' + tokenAddress + id).html('0 ILIFETOKEN');
    $('#usdProfit' + tokenAddress + id).html('$0.00');

    $('#toAddressInput' + tokenAddress + id).val('');
    $('#transferTokenBtn' + tokenAddress + id).prop('disabled', true);

    $('#removeFromSaleBtn' + tokenAddress + id).prop('disabled', true);
    $('#yesContinueBtn' + tokenAddress + id).prop('disabled', false);
  });
};

async function checkForApprovalBeforePuttingOnSale(tokenAddress, id){
  try{
    let approved = await OpenMintTokenInstance.methods.isApprovedForAll(user.attributes.ethAddress, OpenMintMarketplaceAddress).call();
    console.log("Approved: " + approved);

    if(!approved){
      $('#salePriceInput' + tokenAddress + id).prop('disabled', true);
      $('#setApprovalBtn' + tokenAddress + id).css('display', 'block');
    } else{
      $('#salePriceInput' + tokenAddress + id).prop('disabled', false);
      $('#setApprovalBtn' + tokenAddress + id).css('display', 'none');
    }
  } catch(err){
    alert(err.message);
  }
};

function setApprovalIfNeeded(tokenAddress, id){
  $('#setApprovalBtn' + tokenAddress + id).click(async() =>{
    $('#setApprovalBtn' + tokenAddress + id).prop('disabled', true);
    $('#setApprovalBtn' + tokenAddress + id).html(`Setting Approval <div class="spinner-border spinner-border-sm text-light" role="status">
                                                    <span class="sr-only">Loading...</span>
                                                  </div>`);
    await OpenMintTokenInstance.methods.setApprovalForAll(OpenMintMarketplaceAddress, true).send({from: user.attributes.ethAddress}, (err, txHash) => {
      if(err){
        alert(err.message);
        $('#setApprovalBtn' + tokenAddress + id).html("Set Approval To Sell");
        $('#setApprovalBtn' + tokenAddress + id).prop('disabled', false);
        $('#salePriceInput' + tokenAddress + id).prop('disabled', true);
      }else{
        console.log(txHash, "Approval Successfully Granted");
        $('#setApprovalBtn' + tokenAddress + id).prop('disabled', true);
        $('#setApprovalBtn' + tokenAddress + id).removeClass('btn-primary');
        $('#setApprovalBtn' + tokenAddress + id).addClass('btn-success');
        $('#setApprovalBtn' + tokenAddress + id).html('Approval Successfully Granted');
        $('#salePriceInput' + tokenAddress + id).prop('disabled', false);
      }
    });
  });
};

function putOnSale(tokenAddress, id, royalty, creator){
  $('#putOnSaleBtn' + tokenAddress + id).click(async()=>{
    let price = $('#salePriceInput' + tokenAddress + id).val();
    //price = price.replace(/^0+/, '').replace(/\.?0+$/, '');
    const amountInWei = web3.utils.toWei(price, 'ether');

    $('#putOnSaleBtn' + tokenAddress + id).prop('disabled', true);
    $('#putOnSaleBtn' + tokenAddress + id).html(`Put For Sale <div class="spinner-border spinner-border-sm text-light" role="status">
                                                  <span class="sr-only">Loading...</span>
                                                </div>`);
    try{
      let listing = await OpenMintMarketplaceInstance.methods.getListingFee();
      var accounts = await web3.eth.getAccounts(); 
      account = accounts[0]; 
	//	listing=listing.toString();
		let etherValue = Web3.utils.toWei('0.025', 'ether');
		etherValue=etherValue.toString();
	  //await OpenMintMarketplaceTokenErc20.approve(OpenMintMarketplaceAddress, price)
	  await  OpenMintMarketplaceTokenErc20.methods.approve(OpenMintMarketplaceAddress, etherValue).send({from: account});	  
    
	 await OpenMintMarketplaceInstance.methods.setOffer(amountInWei, id, OpenMintTokenAddress).send({from: account});	 
      $('#putOnSaleBtn' + tokenAddress + id).html('Successfully Put On Sale');
      $('#putOnSaleBtn' + tokenAddress + id).removeClass('btn-primary');
      $('#putOnSaleBtn' + tokenAddress + id).addClass('btn-success');

      $('#salePriceInput' + tokenAddress + id).prop('disabled', true);

      confetti({
        zIndex: 9999,
        particleCount: 200
      });

      $('#notForSale' + tokenAddress + id).css('display', 'none');

      $('#forSale' + tokenAddress + id).css('display', 'block');
      let priceInUsd = (price * ethPrice).toFixed(2);
      // $('#forSale' + tokenAddress + id).html(`${price} ILIFETOKEN <span class="sub-text">($${priceInUsd})</span>`);
       $('#forSale' + tokenAddress + id).html(`${price} ILIFETOKEN`);


      $('#quickActions' + tokenAddress + id).html(` <a class="dropdown-item quick-action" id="changePriceQuickAction`+tokenAddress+id+`" data-toggle="modal" data-target="#changePriceModal`+tokenAddress+id+`">Change price</a>
                                                     
                                                    <a class="dropdown-item quick-action" id="shareQuickAction`+tokenAddress+id+`" data-toggle="modal" data-target="#shareModal`+tokenAddress+id+`">Share</a>`
                                                  );
      removeFromSaleQuickActionButton(tokenAddress, id, royalty, creator);
      changePriceQuickActionButton(tokenAddress, id, royalty, creator);
      shareQuickActionButton(tokenAddress, id);
    } catch(err){
      alert(err.message);
      $('#putOnSaleBtn' + tokenAddress + id).prop('disabled', false);
      $('#putOnSaleBtn' + tokenAddress + id).html('Put On Sale');
      $('#salePriceInput' + tokenAddress + id).prop('disabled', false);
      $('.modal').modal('hide');
    }
  });
};

function putForSaleInput(tokenAddress, id, royalty, creator){
  $('#salePriceInput' + tokenAddress + id).keyup(async() =>{
    let reg = new RegExp(/^\d{0,18}(\.\d{1,15})?$/);
    let price = $('#salePriceInput' + tokenAddress + id).val();
    //price = price.replace(/^0+/, '').replace(/\.?0+$/, '');
    if(price !== '' && reg.test(price)){
      $('#putOnSaleBtn' + tokenAddress + id).prop('disabled', false);
    } else{
      $('#putOnSaleBtn' + tokenAddress + id).prop('disabled', true);
    }

    if(creator == user.attributes.ethAddress){
      let profit = price - (price * .02);
      $('#saleProfit' + tokenAddress + id).html(`${profit} ILIFETOKEN`);
      let usdProfit = (profit * ethPrice).toFixed(2);
      $('#usdProfit' + tokenAddress + id).html(`$${usdProfit}`);
    } else{
      let profit = price - (price * .02) - (price * (royalty/100));
      $('#saleProfit' + tokenAddress + id).html(`${profit} ILIFETOKEN`);
      let usdProfit = (profit * ethPrice).toFixed(2);
      $('#usdProfit' + tokenAddress + id).html(`$${usdProfit}`);
    }
  });
};

function removeFromSale(tokenAddress, id, royalty, creator){
  $('#yesContinueBtn' + tokenAddress + id).click(()=>{
    $('#removeFromSaleBtn' + tokenAddress + id).prop('disabled', false);
    $('#yesContinueBtn' + tokenAddress + id).prop('disabled', true);
  });

  $('#removeFromSaleBtn' + tokenAddress + id).click(async()=>{
    $('#removeFromSaleBtn' + tokenAddress + id).prop('disabled', true);
    $('#removeFromSaleBtn' + tokenAddress + id).html(`Remove From Sale <div class="spinner-border spinner-border-sm  text-light" role="status">
                                                        <span class="sr-only">Loading...</span>
                                                      </div>`);
    try{

      let listing = await OpenMintMarketplaceInstance.methods.getListingFee();
      var accounts = await web3.eth.getAccounts(); 
      account = accounts[0]; 
	//	listing=listing.toString();
		//let etherValue = Web3.utils.toWei('0.025', 'ether');
		//etherValue=etherValue.toString();
	  //await OpenMintMarketplaceTokenErc20.approve(OpenMintMarketplaceAddress, price)
	//  await  OpenMintMarketplaceTokenErc20.methods.removeOffer(OpenMintMarketplaceAddress, etherValue).send({from: account});	
   
       await OpenMintMarketplaceInstance.methods.removeOffer(id, OpenMintTokenAddress).send({from: account});	 


    //  await OpenMintMarketplaceInstance.methods.removeOffer(id, tokenAddress).send({from: user.attributes.ethAddress});
      $('#removeFromSaleBtn' + tokenAddress + id).html('Successfully Removed');
      $('#removeFromSaleBtn' + tokenAddress + id).removeClass('btn-danger');
      $('#removeFromSaleBtn' + tokenAddress + id).addClass('btn-success');

      $('#forSale' + tokenAddress + id).css('display', 'none');

      $('#notForSale' + tokenAddress + id).css('display', 'block');
      $('#notForSale' + tokenAddress + id).html(`<button id="encourageBell`+tokenAddress+id+`" class="btn like-encourage-button fas fa-concierge-bell"><span class="like-encourage-text" id="encourageCounter`+tokenAddress+id+`"></span></button>`);

      $('#quickActions' + tokenAddress + id).html(` <a class="dropdown-item quick-action" id="putForSaleQuickAction`+tokenAddress+id+`" data-toggle="modal" data-target="#putForSaleModal`+tokenAddress+id+`">Put for sale</a>
                                                      
                                                    <a class="dropdown-item quick-action" id="shareQuickAction`+tokenAddress+id+`" data-toggle="modal" data-target="#shareModal`+tokenAddress+id+`">Share</a>`
                                                  );
      putForSaleQuickActionButton(tokenAddress, id, royalty, creator);
      transferTokenQuickActionButton(tokenAddress, id);
      shareQuickActionButton(tokenAddress, id);
      encourageButton(tokenAddress, id);
      encourageToSellButton(tokenAddress, id);
      $('#encourageCounter' + tokenAddress + id).html(' Encourage To Sell');
    } catch(err){
      alert(err.message);
      $('#removeFromSaleBtn' + tokenAddress + id).prop('disabled', false);
      $('#removeFromSaleBtn' + tokenAddress + id).html('Remove From Sale');
      $('#yesContinueBtn' + tokenAddress + id).prop('disabled', false);
      $('.modal').modal('hide');
    }
  })
};

function changePriceFrontEnd(tokenAddress, id, royalty, creator){
  $('#changePriceBtn' + tokenAddress + id).click(async()=>{
    let price = $('#changePriceInput' + tokenAddress + id).val();
    //price = price.replace(/^0+/, '').replace(/\.?0+$/, '');
    const amountInWei = web3.utils.toWei(price, 'ether');

    $('#changePriceBtn' + tokenAddress + id).prop('disabled', true);
    $('#changePriceBtn' + tokenAddress + id).html(`Change Price <div class="spinner-border spinner-border-sm text-light" role="status">
                                                    <span class="sr-only">Loading...</span>
                                                  </div>`);
    try{
  //    let listing = await OpenMintMarketplaceInstance.methods.getListingFee();
      var accounts = await web3.eth.getAccounts(); 
      account = accounts[0]; 
	//	listing=listing.toString();
		// let etherValue = Web3.utils.toWei('0.025', 'ether');
		// etherValue=etherValue.toString();
	  // await OpenMintMarketplaceTokenErc20.approve(OpenMintMarketplaceAddress, price)
	   
    
	 await OpenMintMarketplaceInstance.methods.changePrice(amountInWei, id, OpenMintTokenAddress).send({from: account});	 
      
    //  await OpenMintMarketplaceInstance.methods.changePrice(amountInWei, id, tokenAddress).send({from: user.attributes.ethAddress});
      $('#changePriceBtn' + tokenAddress + id).html('Successfully Changed Price');
      $('#changePriceBtn' + tokenAddress + id).removeClass('btn-primary');
      $('#changePriceBtn' + tokenAddress + id).addClass('btn-success');

      $('#changePriceInput' + tokenAddress + id).prop('disabled', true);

      $('#notForSale' + tokenAddress + id).css('display', 'none');

      $('#forSale' + tokenAddress + id).css('display', 'block');
      let priceInUsd = (price * ethPrice).toFixed(2);
      // $('#forSale' + tokenAddress + id).html(`${price} ILIFETOKEN <span class="sub-text">($${priceInUsd})</span>`);
      $('#forSale' + tokenAddress + id).html(`${price} ILIFETOKEN`);

      $('#quickActions' + tokenAddress + id).html(` <a class="dropdown-item quick-action" id="changePriceQuickAction`+tokenAddress+id+`" data-toggle="modal" data-target="#changePriceModal`+tokenAddress+id+`">Change price</a>
                                                     
                                                    <a class="dropdown-item quick-action" id="shareQuickAction`+tokenAddress+id+`" data-toggle="modal" data-target="#shareModal`+tokenAddress+id+`">Share</a>`
                                                  );
      removeFromSaleQuickActionButton(tokenAddress, id, royalty, creator);
      changePriceQuickActionButton(tokenAddress, id, royalty, creator);
      shareQuickActionButton(tokenAddress, id);
    } catch(err){
      alert(err.message);
      $('#changePriceBtn' + tokenAddress + id).prop('disabled', false);
      $('#changePriceBtn' + tokenAddress + id).html('Change Price');
      $('#changePriceInput' + tokenAddress + id).prop('disabled', false);
      $('.modal').modal('hide');
    }
  });
};

function changePriceInput(tokenAddress, id, royalty, creator){
  $('#changePriceInput' + tokenAddress + id).keyup(async() =>{
    let reg = new RegExp(/^\d{0,18}(\.\d{1,15})?$/);
    let price = $('#changePriceInput' + tokenAddress + id).val();
    //price = price.replace(/^0+/, '').replace(/\.?0+$/, '');
    if(price !== '' && reg.test(price)){
      $('#changePriceBtn' + tokenAddress + id).prop('disabled', false);
    } else{
      $('#changePriceBtn' + tokenAddress + id).prop('disabled', true);
    }

    if(creator == user.attributes.ethAddress){
      let profit = price - (price * .02);
      $('#changePriceSaleProfit' + tokenAddress + id).html(`${profit} ILIFETOKEN`);
      let usdProfit = (profit * ethPrice).toFixed(2);
       // $('#changePriceUSDProfit' + tokenAddress + id).html(`$${usdProfit}`);
    } else{
      let profit = price - (price * .02) - (price * (royalty/100));
      $('#changePriceSaleProfit' + tokenAddress + id).html(`${profit} ILIFETOKEN`);
      let usdProfit = (profit * ethPrice).toFixed(2);
       // $('#changePriceUSDProfit' + tokenAddress + id).html(`$${usdProfit}`);
    }
  });
};

function transferToken(tokenAddress, id){
  $('#transferTokenBtn' + tokenAddress + id).click(async()=>{

    let toAddress = $('#toAddressInput' + tokenAddress + id).val();


    $('#transferTokenBtn' + tokenAddress + id).prop('disabled', true);
    $('#transferTokenBtn' + tokenAddress + id).html(`Transfer Token <div class="spinner-border spinner-border-sm text-light" role="status">
                                                      <span class="sr-only">Loading...</span>
                                                    </div>`);
    try{
      await OpenMintTokenInstance.methods.safeTransferFrom(user.attributes.ethAddress, toAddress, id).send({from: user.attributes.ethAddress});
      $('#transferTokenBtn' + tokenAddress + id).html('Successfully Transferred Token');
      $('#transferTokenBtn' + tokenAddress + id).removeClass('btn-primary');
      $('#transferTokenBtn' + tokenAddress + id).addClass('btn-success');

      $('#ownerNameAnchor' + tokenAddress + id).attr('href', "http://192.168.100.161/profile.html?address=" + toAddress);
      $('#owner' + tokenAddress + id).attr('href', "http://192.168.100.161/profile.html?address=" + toAddress);
      $('#ownerSpinner' + tokenAddress + id).css('display', 'block');
      newOwnerPhotoAndNameQuery(tokenAddress, id, toAddress);

      $('#unlockableContentBtn' + tokenAddress + id).html('Unlockable');
      $('#unlockableContentBtn' + tokenAddress + id).removeClass('unlockable-content-shadow');
      $('#unlockableContentBtn' + tokenAddress + id).prop('disabled', true);

      $('#toAddressInput').prop('disabled', true);

      $('#quickActions' + tokenAddress + id).html(`<a class="dropdown-item quick-action" id="shareQuickAction`+tokenAddress+id+`" data-toggle="modal" data-target="#shareModal`+tokenAddress+id+`">Share</a>`);
      shareQuickActionButton(tokenAddress, id);

      $('.if-owned').css('display', 'none');
      $('.not-onsale').css('display', 'block');
    } catch(err){
      alert(err.message);
      $('#transferTokenBtn' + tokenAddress + id).prop('disabled', false);
      $('#transferTokenBtn' + tokenAddress + id).html('Put On Sale');
      $('#toAddressInput' + tokenAddress + id).prop('disabled', false);
      $('.modal').modal('hide');
    }
  });
};

function toAddressInput(tokenAddress, id){
  $('#toAddressInput' + tokenAddress + id).keyup(() =>{
    let address = $('#toAddressInput' + tokenAddress + id).val();
    let addressRegEx = /^0x[a-fA-F0-9]{40}$/;

    if(address.toLowerCase() == user.attributes.ethAddress.toLowerCase()){
      $('#transferTokenBtn' + tokenAddress + id).prop('disabled', true);
      $('#regexMessage' + tokenAddress + id).removeClass('text-success');
      $('#regexMessage' + tokenAddress + id).addClass('text-danger');
      $('#regexMessage' + tokenAddress + id).html('This is your current address');
    } else if(addressRegEx.test(address)){
      $('#transferTokenBtn' + tokenAddress + id).prop('disabled', false);
      $('#regexMessage' + tokenAddress + id).removeClass('text-danger');
      $('#regexMessage' + tokenAddress + id).addClass('text-success');
      $('#regexMessage' + tokenAddress + id).html('Valid ethereum address')
    } else{
      $('#transferTokenBtn' + tokenAddress + id).prop('disabled', true);
      $('#regexMessage' + tokenAddress + id).removeClass('text-success');
      $('#regexMessage' + tokenAddress + id).addClass('text-danger');
      $('#regexMessage' + tokenAddress + id).html('Invalid ethereum address')
    }
  });
};

async function ifOwnerNotInDatabase(tokenAddress, id, owner){
  const params = { ethAddress: owner };
  let isAddressIn = await Moralis.Cloud.run('isAddressInDatabase', params);
  if(!isAddressIn){
    let amountSold = undefined;
    addSellerBadgeForOwner(tokenAddress, id, amountSold);
    $('#ownerPhoto' + tokenAddress + id).attr('src', './assets/images-icons/unknown.png');
    let unknownProfilePhoto = "./assets/images-icons/unknown.png"
    $('#ownerName' + tokenAddress + id).html("Wallet Not Yet Connected");
    dismissLoadingPulseOnOwnerPhoto(tokenAddress, id, unknownProfilePhoto);
  }
};

async function newOwnerPhotoAndNameQuery(tokenAddress, id, toAddress){
  $('#ownerPhoto' + tokenAddress + id).css('display', 'none');
  $('#ownerRank' + tokenAddress + id).css('display', 'none');
  ifOwnerNotInDatabase(tokenAddress, id, toAddress);
  try{
    let users = await Moralis.Cloud.run('getAllUsers');
    for (i = 0; i < users.length; i++) {
      if(users[i].ethAddress.toLowerCase() == toAddress.toLowerCase()){
        let profilePhoto = users[i].profilePhoto;
        let username = users[i].username;
        let amountSold = users[i].amountSold;

        $('#ownerName' + tokenAddress + id).html(username);

        if(profilePhoto){
          addSellerBadgeForOwner(tokenAddress, id, amountSold);
          $('#ownerPhoto' + tokenAddress + id).attr('src', profilePhoto._url);
          dismissLoadingPulseOnOwnerPhoto(tokenAddress, id, profilePhoto._url)
        } else{
          addSellerBadgeForOwner(tokenAddress, id, amountSold);
          $('#ownerPhoto' + tokenAddress + id).attr('src', './assets/images-icons/default.png');
          let photo = "./assets/images-icons/default.png";
          dismissLoadingPulseOnOwnerPhoto(tokenAddress, id, photo);
        }
      }
    }
  } catch(err){
    console.log(err);
  }
};

async function buy(tokenAddress, id, price, royalty, creator){
  $('#buy' + tokenAddress + id).click(async function(){
    if(user){
      $('#buy' + tokenAddress + id).prop('disabled', true);
      $('#buy' + tokenAddress + id).html(`Buy Now <div class="spinner-border spinner-border-sm text-light" role="status">
                                            <span class="sr-only">Loading...</span>
                                          </div>`);
      $('#unlockableContentBtn' + tokenAddress + id).addClass('unlock-shake-before-buy');
      var accounts = await web3.eth.getAccounts(); 
      account = accounts[0]; 
      price=price.toString();
     await OpenMintMarketplaceTokenErc20.methods.approve(OpenMintMarketplaceAddress, price).send({from: account});
      //await  OpenMintMarketplaceTokenErc20.methods.approve(OpenMintMarketplaceAddress, price).send({from: account});
     
     
      //OpenMintMarketplaceTokenErc20.methods.transferFrom(account,OpenMintMarketplaceInstance.Offer.seller,price);
     // await OpenMintMarketplaceTokenErc20.methods.approve(OpenMintMarketplaceAddress, price);
      await OpenMintMarketplaceInstance.methods.createMarketSale(OpenMintTokenAddress,OpenMintErc20,id).send({from: account}, (err, txHash) => {
         if(err){
          alert(err.message);
          $('#buy' + tokenAddress + id).prop('disabled', false);
          $('#buy' + tokenAddress + id).html("Buy Now");
          $('#unlockableContentBtn' + tokenAddress + id).html('Unlockable');
          $('#unlockableContentBtn' + tokenAddress + id).removeClass('unlock-shake-before-buy');
          $('#unlockableContentBtn' + tokenAddress + id).removeClass('unlockable-content-shadow');
          $('#unlockableContentBtn' + tokenAddress + id).removeClass('magnify');
        }else{
          console.log(txHash, "Artwork successfully bought");
          $('#buy' + tokenAddress + id).html('Successfully Purchased');
          $('#buy' + tokenAddress + id).removeClass('btn-primary');
          $('#buy' + tokenAddress + id).addClass('disabled btn-success');
          $('#buy' + tokenAddress + id).prop('disabled', true);
          $('#unlockableContentBtn' + tokenAddress + id).removeClass('unlock-shake-before-buy');
          $('#unlockableContentBtn' + tokenAddress + id).addClass('unlockable-content-shadow');
          $('#unlockableContentBtn' + tokenAddress + id).html('Unlocked');
          $('#unlockableContentBtn' + tokenAddress + id).addClass('magnify');
          let toAddress = user.attributes.ethAddress;
          $('#ownerNameAnchor' + tokenAddress + id).attr('href', "http://192.168.100.161/profile.html?address=" + toAddress);
          $('#owner' + tokenAddress + id).attr('href', "http://192.168.100.161/profile.html?address=" + toAddress);
          $('#ownerSpinner' + tokenAddress + id).css('display', 'block');
          newOwnerPhotoAndNameQuery(tokenAddress, id, toAddress);
          customConfetti();
          getUnlockableContentFrontEnd(tokenAddress, id, toAddress);
          $('#quickActions' + tokenAddress + id).html(` <a class="dropdown-item quick-action" id="putForSaleQuickAction`+tokenAddress+id+`" data-toggle="modal" data-target="#putForSaleModal`+tokenAddress+id+`">Put for sale</a>
                                                          
                                                        <a class="dropdown-item quick-action" id="shareQuickAction`+tokenAddress+id+`" data-toggle="modal" data-target="#shareModal`+tokenAddress+id+`">Share</a>`
                                                      );
          putForSaleQuickActionButton(tokenAddress, id, royalty, creator);
          transferTokenQuickActionButton(tokenAddress, id, royalty, creator);
          shareQuickActionButton(tokenAddress, id);
          darkmodeForDynamicContent();
        }
      });
    } else{
      $("#ifWalletNotConnectedModal").modal('show');
    }
  });
};

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
};

function customConfetti(){
  var duration = 10 * 1000;
  var animationEnd = Date.now() + duration;
  var defaults = { startVelocity: 30, spread: 180, ticks: 100, zIndex: 0 };

  var interval = setInterval(function() {
    var timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    var particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
  }, 250);
};

function getUnlockableContentFrontEnd(tokenAddress, id, owner){
  $('#unlockableContentBtn' + tokenAddress + id).click(async()=>{
    $('#unlockableContentModal').modal('show');
    try{
      if(user.attributes.ethAddress.toLowerCase() == owner.toLowerCase()){
        const params = {
          currentOwner: user.attributes.ethAddress,
          tokenAddress: tokenAddress,
          tokenId: id
        };
        const content = await Moralis.Cloud.run('getUnlockableContent', params);
        console.log(content);
        $("#contentUnlockedTitle").html('Content Unlocked');
        $('#unlockableContentText').html(content);
        let copyBtn = `<button type="button" class="btn btn-primary button-styling" id="copyUnlockableContentBtn" data-clipboard-text="${content}">Copy</button>`;
        $('#unlockableFooter').append(copyBtn);
        copyButton();
      } else{
        $("#contentUnlockedTitle").html('Not So Fast..')
        $('#unlockableContentText').html('You must be the owner to view this content, purchase the artwork to become the owner. If the artwork is not available to purchase, encourage the owner to sell.');
      }
    } catch(err){
      alert(err.message);
    }
  });
};

function copyButton(){
  let clipboard = new ClipboardJS('#copyUnlockableContentBtn',{container: document.getElementById('unlockableContentModal')});//jquery doesn't work here

  clipboard.on('success', function (e) {
      $('#copyStatus').removeClass('text-danger');
      $('#copyStatus').addClass('text-success');
      $('#copyStatus').html('Copied to clipboard');
      console.log(e);
    });

    clipboard.on('error', function (e) {
      $('#copyStatus').removeClass('text-success');
      $('#copyStatus').addClass('text-danger');
      $('#copyStatus').html('Could not copy to clipboard');
      console.log(e);
    });
};

$('#unlockableContentModal').on('hidden.bs.modal', function (e) {
  $('#copyUnlockableContentBtn').remove();
  $('#copyStatus').html('');
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////



function cardDiv(tokenAddress, id, owner, creator, path){
  let nftCard = `<!-- image -->
                <div class="nft-wrapperrr col-xs-12 col-sm-12 col-md-12 col-lg-8">
                             
                 
                <div class="container">
                <div class="row">
                  <div class="col-md-12">

                    <div id="custCarousel" class="carousel slide" data-ride="carousel" align="center">

                      <!-- slides -->
                      <div class="carousel-inner">
                        <div class="carousel-item active">
                          <img id='picReader1`+tokenAddress+id+`' src="" alt="">
                        </div>
              
                        <div class="carousel-item">
                          <img id='picReader2`+tokenAddress+id+`' src="" alt="">
                        </div>
              
                        <div class="carousel-item">
                          <img id='picReader3`+tokenAddress+id+`' src="" alt="">
                        </div>
              
                        <div class="carousel-item">
                          <img id='picReader4`+tokenAddress+id+`' src="" alt="">
                        </div>
                     
                      <div class="carousel-item">
                      <img id='picReader5`+tokenAddress+id+`' src="" alt="">
                    </div>
          
                    <div class="carousel-item">
                      <img id='picReader6`+tokenAddress+id+`' src="" alt="">
                    </div>

                    <div class="carousel-item">
                    <img id='picReader7`+tokenAddress+id+`' src="" alt="">
                  </div>
        
                  <div class="carousel-item">
                    <img id='picReader8`+tokenAddress+id+`' src="" alt="">
                  </div>
                  <div class="carousel-item">
                  <img id='picReader9`+tokenAddress+id+`' src="" alt="">
                </div>
      
                <div class="carousel-item">
                  <img id='picReader10`+tokenAddress+id+`' src="" alt="">
                </div>
          
                    </div>


              
                      <!-- Left right -->
                      <a class="carousel-control-prev" href="#custCarousel" data-slide="prev">
                        <span class="carousel-control-prev-icon"></span>
                      </a>
                      <a class="carousel-control-next" href="#custCarousel" data-slide="next">
                        <span class="carousel-control-next-icon"></span>
                      </a>
              
                      <!-- Thumbnails -->
                      <ol class="carousel-indicators list-inline">

                      <li class="list-inline-item active">
                      <a id="carousel-selector-0" class="selected" data-slide-to="0" data-target="#custCarousel">
                        <img id="picReader11`+tokenAddress+id+`" src=""  class="img-fluid">
                      </a>
                    </li>
                              
                        <li class="list-inline-item">
                          <a id="carousel-selector-1" data-slide-to="1" data-target="#custCarousel">
                            <img id='picReader22`+tokenAddress+id+`' src=""  class="img-fluid">
                          </a>
                        </li>
              
                        <li class="list-inline-item">
                          <a id="carousel-selector-2" data-slide-to="2" data-target="#custCarousel">
                            <img id="picReader33`+tokenAddress+id+`" src=""  class="img-fluid">
                          </a>
                        </li>
              
                         <li class="list-inline-item">
                          <a id="carousel-selector-2" data-slide-to="3" data-target="#custCarousel">
                             <img id="picReader44`+tokenAddress+id+`" src=""  class="img-fluid">
                          </a>
                        </li>

                        <li class="list-inline-item">
                        <a id="carousel-selector-4" data-slide-to="4" data-target="#custCarousel">
                          <img id="picReader55`+tokenAddress+id+`" src=""  class="img-fluid">
                        </a>
                      </li>
            
                       <li class="list-inline-item">
                        <a id="carousel-selector-5" data-slide-to="5" data-target="#custCarousel">
                           <img id="picReader66`+tokenAddress+id+`" src=""   class="img-fluid">
                        </a>
                      </li>
                      <li class="list-inline-item">
                      <a id="carousel-selector-6" data-slide-to="6" data-target="#custCarousel">
                        <img id="picReader77`+tokenAddress+id+`" src=""  class="img-fluid">
                      </a>
                    </li>
          
                     <li class="list-inline-item">
                      <a id="carousel-selector-7" data-slide-to="7" data-target="#custCarousel">
                         <img id="picReader88`+tokenAddress+id+`" src=""   class="img-fluid">
                      </a>
                    </li> <li class="list-inline-item">
                    <a id="carousel-selector-8" data-slide-to="8" data-target="#custCarousel">
                      <img id="picReader99`+tokenAddress+id+`" src=""  class="img-fluid">
                    </a>
                  </li>
        
                   <li class="list-inline-item">
                    <a id="carousel-selector-8" data-slide-to="9" data-target="#custCarousel">
                       <img id="picReader100`+tokenAddress+id+`" src=""   class="img-fluid">
                    </a>
                  </li>



                       </ol>
                    </div>
                  </div>
                </div>
              </div>
              
                </div>






                <!-- info -->
                <div class="info-wrapper col-xs-12 col-sm-12 col-md-12 col-lg-4">
                  <div class="info-section">
                    <div class="top-row-token-page">
                      <div class="owner-div row">
                       
                     
                      <div class="additional-infoo">
                   
                    <div class="imagedescription">
                    <span style="color: rgb(104 234 255 / 90%);"> Description :<\span> <div class="text-white" id="imagedescription`+tokenAddress+id+`"></div>                 
                   

                 
                    </div>
                  
                    <div class="additional-info">
                  
                    <a class="btn btn-primary button-styling shadow-sm"  class="nav-link" id="create" href="http://192.168.100.161/token.html?token=`+tokenAddress+id+`">BACK TO NFT</a>
                   
                    </div>
                    </div>
                
                  <div class="dividing-line"></div>


                
                  
                    </div>
                  </div>
                </div>`
  $('.cardDiv').prepend(nftCard);
  darkmodeForDynamicContent();
};














function changePriceModalHTML(tokenAddress, id){
  let changePriceModal = `<div class="modal fade" id="changePriceModal`+tokenAddress+id+`" data-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title">Change Price 🧐</h5>
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body">
                      <form>
                        <div id="changePriceInputGroup`+tokenAddress+id+`" class="price-input-group">
                          <div class="input-group">
                            <input id="changePriceInput`+tokenAddress+id+`" type="text" class="form-control input-styling" placeholder="Enter price in ILIFETOKEN" aria-label="ether amount">
                          </div>
                          <div class="price-calculator price-info">
                            <span>Service Fee Upon Sale <span>2%</span></span><br>
                            <span id="ifOwnerNotCreator`+tokenAddress+id+`">Creator's Royalty <span id="royalty`+tokenAddress+id+`"></span><br></span>
                            <span>Your profit will be: <span id="changePriceSaleProfit`+tokenAddress+id+`" class="sale-profit">0 ILIFETOKEN</span> <span id="changePriceUSDProfit`+tokenAddress+id+`">$0.00</span></span>
                          </div>
                        </div>
                      </form>
                    </div>
                    <div class="modal-footer change-price-footer">
                      <button type="button" class="btn btn-secondary button-styling" data-dismiss="modal">Close</button>
                      <button type="button" class="btn btn-primary button-styling" disabled id="changePriceBtn`+tokenAddress+id+`">Change Price</button>
                    </div>
                  </div>
                </div>
              </div>`

  $('.modals').append(changePriceModal);
};

function putForSaleModalHTML(tokenAddress, id){
let putForSaleModal =`<div class="modal fade" id="putForSaleModal`+tokenAddress+id+`" data-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered" role="document">
                          <div class="modal-content">
                            <div class="modal-header">
                              <h5 class="modal-title">Put For Sale 🤑</h5>
                              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                              </button>
                            </div>
                            <div class="modal-body">
                              <button type="button" class="btn btn-primary btn-block button-styling" id="setApprovalBtn`+tokenAddress+id+`">Set Approval To Sell</button>
                              <form>
                                <div id="priceInputGroup`+tokenAddress+id+`" class="price-input-group">
                                  <div class="input-group">
                                    <input id="salePriceInput`+tokenAddress+id+`" type="text" class="form-control input-styling" placeholder="Enter price in ILIFETOKEN" aria-label="ether amount">
                                  </div>
                                  <div class="price-calculator price-info">
                                    <span>Service Fee Upon Sale <span>2%</span></span><br>
                                    <span id="ifOwnerNotCreator`+tokenAddress+id+`">Creator's Royalty <span id="royalty`+tokenAddress+id+`"></span><br></span>
                                    <span>Your profit will be: <span id="saleProfit`+tokenAddress+id+`" class="sale-profit">0 ILIFETOKEN</span> <span id="usdProfit`+tokenAddress+id+`">$0.00</span></span>
                                  </div>
                                </div>
                              </form>
                            </div>
                            <div class="modal-footer">
                              <button type="button" class="btn btn-secondary button-styling" data-dismiss="modal">Close</button>
                              <button type="button" class="btn btn-primary button-styling" disabled id="putOnSaleBtn`+tokenAddress+id+`">Put For Sale</button>
                            </div>
                          </div>
                        </div>
                      </div>`
  $('.modals').append(putForSaleModal);
};

function removeFromSaleModalHTML(tokenAddress, id){
  let removeFromSaleModal = `<div class="modal fade" id="removeFromSaleModal`+tokenAddress+id+`" data-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
                              <div class="modal-dialog modal-dialog-centered" role="document">
                                <div class="modal-content">
                                  <div class="modal-header">
                                    <h5 class="modal-title">Remove From Sale 🥺</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                      <span aria-hidden="true">&times;</span>
                                    </button>
                                  </div>
                                  <div class="modal-body">
                                    <p class="modal-text">Are you sure you want to remove this artwork from being on sale?</p>
                                    <button type="button" class="btn btn-primary btn-block button-styling" id="yesContinueBtn`+tokenAddress+id+`">Yes, continue</button>
                                  </div>
                                  <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary button-styling" data-dismiss="modal">Close</button>
                                    <button type="button" class="btn btn-danger button-styling" disabled id="removeFromSaleBtn`+tokenAddress+id+`">Remove From Sale</button>
                                  </div>
                                </div>
                              </div>
                            </div>`
  $('.modals').append(removeFromSaleModal);
};

function transferTokenModalHTML(tokenAddress, id){
  let transferTokenModal = ` <div class="modal fade" id="transferTokenModal`+tokenAddress+id+`" data-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
                              <div class="modal-dialog modal-dialog-centered" role="document">
                                <div class="modal-content">
                                  <div class="modal-header">
                                    <h5 class="modal-title">Transfer Token 🎁</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                      <span aria-hidden="true">&times;</span>
                                    </button>
                                  </div>
                                  <div class="modal-body">
                                    <form>
                                      <div id="toAddressInputGroup`+tokenAddress+id+`" class="price-input-group">
                                        <div class="input-group">
                                          <input id="toAddressInput`+tokenAddress+id+`" type="text" class="form-control input-styling" placeholder="0x..." aria-label="receiver address">
                                        </div>
                                        <div class="price-info">
                                          <span>Enter the address where you want to send this artwork</span><br>
                                          <span id="regexMessage`+tokenAddress+id+`"></span>
                                        </div>
                                      </div>
                                    </form>
                                  </div>
                                  <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary button-styling" data-dismiss="modal">Close</button>
                                    <button type="button" class="btn btn-primary button-styling" disabled id="transferTokenBtn`+tokenAddress+id+`">Transfer Token</button>
                                  </div>
                                </div>
                              </div>
                            </div>`
  $('.modals').append(transferTokenModal);
};

function shareModalHTML(tokenAddress, id){
  let shareModal = `<div class="modal fade" id="shareModal`+tokenAddress+id+`" tabindex="-1" role="dialog" aria-hidden="true">
                              <div class="modal-dialog modal-dialog-centered" role="document">
                                <div class="modal-content">
                                  <div class="modal-header center-content">
                                    <h5 class="modal-title">Share This NFT</h5>
                                  </div>
                                  <div class="modal-body center-content">
                                  <button id='twitterBtnInModal`+tokenAddress+id+`' target="popup" type="button" class="btn btn-primary m-2 button-styling">Twitter</button>
                                  <button id='facebookBtnInModal`+tokenAddress+id+`' target="popup" type="button" class="btn btn-primary m-2 button-styling">Facebook</button>
                                  <button id='emailBtnInModal`+tokenAddress+id+`' type="button" class="btn btn-primary m-2 button-styling">Email</button>
                                  </div>
                                </div>
                              </div>
                            </div>`
  $('.modals').append(shareModal);
};

function darkmodeForDynamicContent(){
  let darkmodeCookie = Cookies.get('darkmode');

  if(darkmodeCookie == 'true'){
    $('.btn-light').addClass('btn-dark');
    $('.btn-light').removeClass('btn-light');

    $('.card').css({'background': '#2a2a2a', 'border': '1px solid #444'});

    $('.dropdown-menu').css('background', 'black');
    $('.dropdown-item').css('color', '#8a8a8a');

    $('.slider-title').css('color', 'white');

    $('.social-tag').css('color', 'white');

    $('.modal-content').css('background', '#343a40');

    $('.anchor').css('color', 'white');

    $('.spinner-grow').removeClass('text-light');
    $('.spinner-grow').addClass('text-dark');

    $('.imagedescription').removeClass('bg-light');
    $('.imagedescription').addClass('bg-dark');
    $('.category').removeClass('bg-light');
    $('.category').addClass('bg-dark');

  } else if (darkmodeCookie == 'false') {
    $('.btn-dark').addClass('btn-light');
    $('.btn-dark').removeClass('btn-dark');

    $('.card').css({'background': 'white', 'border': '1px solid #ddd'});

    $('.dropdown-menu').css('background', 'white');
    $('.dropdown-item').css('color', 'black');

    $('.slider-title').css('color', 'black');

    $('.social-tag').css('color', 'black');

    $('.modal-content').css('background', 'white');

    $('.anchor').css('color', 'black');

    $('.spinner-grow').removeClass('text-dark');
    $('.spinner-grow').addClass('text-light');

    $('.imagedescription').removeClass('bg-dark');
    $('.imagedescription').addClass('bg-light');
    
    $('.category').removeClass('bg-dark');
    $('.category').addClass('bg-light');
  }
};
