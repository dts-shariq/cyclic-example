Moralis.initialize("021");  // Application id from moralis.io
Moralis.serverURL = 'http://192.168.100.161:1337/server'; //Server url from moralis.io

//Moralis.start("https://2e1jk4mlcyr3.usemoralis.com:2053/server","V3YPB41ScC14PnIUtkMoxaZnLKE7q83H4XauIiJx");
const user = Moralis.User.current();

const OpenMintTokenAddress = "0xd5630E240556bf69FdE3D549c49c290e9b9685d8";
//const OpenMintMarketplaceAddress = "0xdc83167293BF0f9715c1b0180D925ff3fdF71317";
//const OpenMintMarketplaceAddress = "0x9F5AD9D37546Ba03c19c13dbA52bdf2d25bA691A";
const OpenMintMarketplaceAddress = "0x488FB64318dB284eb767D6e0CbBa501360E0ADB0";

const OpenMintErc20 = "0x39B72f4850300662e2E7DeeA13C3FAFEf0cb830C";
let OpenMintTokenInstance;
let OpenMintMarketplaceInstance;
let web3;
let nft;
let nfts;
let cover;
let royalty = 08;
let ethPrice;
const BASE_URL = "https://api.coingecko.com/api/v3";
const ETH_USD_PRICE_URL = "/simple/price?ids=ethereum&vs_currencies=usd";
console.log(user);

$(document).ready(async function () {
  //web3 = await Moralis.enableWeb3(Web3.givenProvider || "ws://192.168.100.161.sslip.io:8545");
  web3 = new Web3(Web3.givenProvider || "wss://192.168.100.161");
  OpenMintTokenInstance = new web3.eth.Contract(abi.OpenMintToken, OpenMintTokenAddress);
  OpenMintMarketplaceInstance = new web3.eth.Contract(abi.OpenMintMarketplace, OpenMintMarketplaceAddress);
  OpenMintMarketplaceTokenErc20 = new web3.eth.Contract(abi.MarkToken, OpenMintErc20);
  
  ethPrice = await getEthPrice();
  checkIfApproved();
});

let selected = document.querySelector(".selected");

const optionsContainer = document.querySelector(".options-container");

const optionsList = document.querySelectorAll(".option");


selected.addEventListener("click", () => {
  optionsContainer.classList.toggle("active");
});


optionsList.forEach(o => {
  o.addEventListener("click", () => {
    selected.innerHTML = o.querySelector("label").innerHTML;
    optionsContainer.classList.remove("active");
    
    

  });
});







if (user == null) {
  $('#ifWalletNotConnectedModal').modal('show');

  $('#nftImgFile').prop('disabled', true);
  $('#nftCoverFile').prop('disabled', true);
  $('#onSaleSwitch').prop('disabled', true);
  $('#salePriceInput').prop('disabled', true);
  $('#royaltySlider').prop('disabled', true);
  $('#title').prop('disabled', true);
  $('#descriptionInput').prop('disabled', true);
  $('#additionalInfoInput').prop('disabled', true);
  $('#createButton').prop('disabled', true);
  $('#createModal').modal('hide');
  $('#setApprovalBtn').prop('disabled', true);
  $('#saveToIPFSBtn').prop('disabled', true);
  $('#setOffer').prop('disabled', true);
  $('#categoryinput').prop('disabled', true);
}

//button in connect modal
$('#connectWalletModalBtn').click(async () => {
  $('#connectWalletModalBtn').prop('disabled', true);
  $('#connectWalletModalBtn').html(`Connecting... <div class="spinner-border spinner-border-sm text-light" role="status">
                                                        <span class="sr-only">Loading...</span>
                                                      </div>`);
  //this is the one in the nav
  $('#connectWalletBtn').html(`Connecting... <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                  <span class="sr-only">Loading...</span>`);
  try {
    let currentUser = await Moralis.Web3.authenticate();
    if (currentUser) {
      location.reload();
    }
  } catch (error) {
    alert(error.message);
    console.log(error);
    $('#connectWalletModalBtn').prop('disabled', false);
    $('#connectWalletModalBtn').html('Connect Wallet');
    $('#connectWalletBtn').html('Connect');
  }
});

$('#goBackBtn').click(() => {
  window.history.back();
});

async function getEthPrice() {
  let ethPrice = BASE_URL + ETH_USD_PRICE_URL;
  const response = await fetch(ethPrice);
  const data = await response.json();
  let usdEthPrice = data.ethereum.usd;
  return usdEthPrice;
};

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})
const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});
async function readURL(input) {
  if (input.files && input.files[0]) {
    let reader = new FileReader();

    let fileType = input.files[0].type;
    let fileSize = input.files[0].size;

    if (fileSize > 64000000) {
      $('#fileSizeModalBody').html('File size cannot exceed 64 MB.');
      $('#fileSizeModal').modal('show');
      $('#createButton').prop('disabled', true);
      $('#nftSizeExceededText').html('File too large, please utilize unlockable content');
      nft = '';
    }

    reader.onload = function (file) {
      if (fileType == 'image/png' || fileType == 'image/jpeg' || fileType == 'image/gif' || fileType == 'image/webp') {
        $('#nftImgEx').attr('src', file.target.result);
        if (input.files[0].size <= 3000000) {
          $('#formToUploadCover').css('display', 'none');
          //cover = new Moralis.File(input.files[0].name, input.files[0]);

          const coverFile = input.files[0];

          const coverfileName = input.files[0].name;
      
          let coverExtension = coverfileName.split('.').pop();
      
          const cleanedCoverFileName = 'coooover.' + coverExtension;
          
          console.log(cleanedCoverFileName);
      
          cover = new Moralis.File(cleanedCoverFileName, coverFile);
          console.log("covvveeeveverrr", cover);



        } else {
          $('#nftCoverEx').prop('required');
        }
      } else if (fileType == "video/mp4" || fileType == "video/webm") {
        $('#nftImgEx').css('display', 'none');
        $('#nftVidEx').css('display', 'inline-block');
        $('#nftVidEx').attr('src', file.target.result);
        $('#nftCoverEx').prop('required');
      } else if (fileType == "audio/mp3" || fileType == "audio/webm" || fileType == "audio/mpeg") {
        $('#nftImgEx').css('display', 'none');
        $('#nftAudEx').css('display', 'inline-block');
        $('#nftAudEx').attr('src', file.target.result);
        $('#nftCoverEx').prop('required');
      }
    };

    reader.readAsDataURL(input.files[0]);

    const file = input.files[0];

    const fileName = input.files[0].name;

    let extension = fileName.split('.').pop();

    const cleanedFileName = 'nft.' + extension;

    console.log(cleanedFileName);
    const data = (await toBase64(file)).split(',')[1];
    await Moralis.start({
      serverUrl: 'http://192.168.100.161:1337/server',
      appId:"021", 
      apiKey: 'WNiUaG8V160i1ViysWj3WBGwnUD8Zzyh6zLwNPyDYe1YbD1KWbWjxjb0qs2YZsx1',
     // Application id from moralis.io
     
    });
    const options = {

      abi: [
    
        {
    
          path: cleanedFileName,  
          content: data
          
    
        },
    
      ],
    
    };
   // nft = new Moralis.File(cleanedFileName, file);
    nft = await Moralis.Web3API.storage.uploadFolder(options);

nfts = new Moralis.File(cleanedFileName, file);
    console.log('NFT To MINT: ',nft);
  
  }
};


$("#nftImgFile").change(function () {
  readURL(this);
  $('.upload-button-div').css('display', 'none');
  $('#imageFileLabel').css('display', 'none');

  $('#clearFile').css('display', 'block');

  $('#formToUploadCover').css('display', 'block');
});

$('#closeIcon1').click(() => {
  location.reload();
});

$('#closeIcon2').click(() => {
  location.reload();
});






function coverURL(input) {
  if (input.files && input.files[0]) {
    let reader = new FileReader();

    let fileType = input.files[0].type;
    let fileSize = input.files[0].size;

    reader.onload = function (file) {
      if (fileType == 'image/png' || fileType == 'image/jpeg' || fileType == 'image/gif' || fileType == 'image/webp') {
        $('#nftCoverEx').attr('src', file.target.result);
        if (fileSize > 3000000) {
          $('#fileSizeModalBody').html('File size cannot exceed 3 MB.');
          $('#fileSizeModal').modal('show');
          $('#createButton').prop('disabled', true);
          $('#fileSizeExceededText').html('File too large, please use smaller file');
          cover = '';
        }
      } else {
        $('#nftCoverEx').html('Incorrect File Format');
      }
    };

    reader.readAsDataURL(input.files[0]);

    const coverFile = input.files[0];

    const coverfileName = input.files[0].name;

    let coverExtension = coverfileName.split('.').pop();

    const cleanedCoverFileName = 'cover.' + coverExtension;

    cover = new Moralis.File(cleanedCoverFileName, coverFile);
    console.log(cover);
  }
};


let files = [],
dragArea = document.querySelector('.drag-area'),
input = document.querySelector('.drag-area input'),
button = document.querySelector('.card button'),
select = document.querySelector('.drag-area .select'),
containers = document.querySelector('.containers');
let arr = [];
/** CLICK LISTENER */
select.addEventListener('click', () => input.click());
let imgmul;
/* INPUT CHANGE EVENT */
let j;
let nftPaths;
let mularr=[];
let mulFile=[];
let arrmul = [];


 input.addEventListener('change', async () => {
	let file = input.files;
  let reader = new FileReader();
    // if user select no image
    if (file.length == 0) return;

         
	for(let i = 0; i < file.length; i++) {
        if (file[i].type.split("/")[0] != 'image') continue;
        if (!files.some(e => e.name == file[i].name)) files.push(file[i])
       // datafile = new Moralis.File( file[i].name, file[i]); 
  
       const data = (await toBase64(file[i])).split(',')[1];

   /*    arrmul.push(new Promise( (res, rej) => {
       
            
            ipfsArray.push({
              path: file[i].name,  
              content:data
            })
           
       
    }))
     */

    await Moralis.start({
      serverUrl: 'http://192.168.100.161:1337/server',
      appId:"021", 
      apiKey: 'WNiUaG8V160i1ViysWj3WBGwnUD8Zzyh6zLwNPyDYe1YbD1KWbWjxjb0qs2YZsx1',
     // Application id from moralis.io
     
    });

    const options = {

      abi: [
    
        {
    
          path: file[i].name,  
          content: data
          
    
        },
    
      ],
    
    }; 
    const datafile= await Moralis.Web3API.storage.uploadFolder(options);
    console.log("DATA",datafile[0].path);
        
        uploadIPFS(datafile[0].path);
     

       j=i;
         console.log(j);
    
    }
 
    

	showImages();
  console.log("MulCover");

});

async function uploadIPFS(indexfile) {
  try {
      
;
    arrmul.push(indexfile);
   
    console.log("data armuk",arrmul);
  } catch (err) {
    console.log(err);
    alert("Error saving art to ipfs");
    $('#saveToIPFSBtn').prop('disabled', false);
    $('#saveToIPFSBtn').html("Upload and Mint");
  }
};

function showImages() {
	containers.innerHTML = files.reduce((prev, curr, index) => {
    const url = URL.createObjectURL(curr);
    arr.push(url);
    return `${prev}
    
		    <div class="image">
			    <span onclick="delImage(${index})">&times;</span>
        
			    <img src="${url}" />
			</div>`
	}, '');
};



$("#nftCoverFile").change(function () {
  coverURL(this);
  $('.cover-upload-button-div').css('display', 'none');
  $('#coverLabel').css('display', 'none');

  $('#clearCover').css('display', 'block');
});

$('#onSaleSwitch').click(() => {
  if ($('#onSaleSwitch').prop('checked')) {
    console.log('going to marketplace');
    $('#priceInputGroup').css('display', '');
    $('#unlockableContent').css('display', '');
    $('#setApprovalBtn').css('display', 'block');
    $('#saveToIPFSBtn').prop('disabled', true);
    $('#setOffer').css('display', 'block');
    $('#salePriceInput').prop('required', true);
    checkIfApproved();
    $("#createButton").prop('disabled', true);
  } else {
    console.log('not going on sale');
    $('#priceInputGroup').css('display', 'none');
    $('#unlockableContent').css('display', 'none');
    $('#unlockableContentInputGroup').css('display', 'none');
    $('#unlockableSwitch').prop('checked', false);
    $('#unlockableContentText').val('');
    $('#salePriceInput').val('');
    $('#saleProfit').html('0 ILIFETOKEN');
    $('#usdProfit').html('$0.00');
    $('#setApprovalBtn').css('display', 'none');
    $('#saveToIPFSBtn').prop('disabled', false);
    $('#setOffer').css('display', 'none');
    $('#salePriceInput').prop('required', false);
    $("#createButton").prop('disabled', false);
  }
});

$('#salePriceInput').keyup(() => {
  let price = $('#salePriceInput').val();

  let profit = price - (price * .02);
  $('#saleProfit').html(`${profit} ILIFETOKEN`);
  let usdProfit = (profit * ethPrice).toFixed(2);
  $('#usdProfit').html(`$${usdProfit}`);

  let reg = /^\d{0,18}(\.\d{1,15})?$/;
  //price = price.replace(/^0+/, '').replace(/\.?0+$/, '');

  if (price !== '' && reg.test(price)) {
    $('#createButton').prop('disabled', false);
  } else {
    $('#createButton').prop('disabled', true);
  }
});

$('#unlockableSwitch').click(() => {
  if ($('#unlockableSwitch').prop('checked')) {
    console.log('unlockable content enabled');
    $('#unlockableContentInputGroup').css('display', 'block');
    $('#unlockableContentText').prop('required', true);
  } else {
    console.log('unlockable content disabled');
    $('#unlockableContentInputGroup').css('display', 'none');
    $('#unlockableContentText').val('');
    $('#unlockableContentText').prop('required', false);
  }
});

$('#royaltySlider').change(() => {
  royalty = $('#royaltySlider').val();

  $('#royaltyAmount').html(`${royalty}%`);
  console.log(royalty / 100);
});

$("form").on('submit', function (e) {
  e.preventDefault();
  //disabling prevents accidental last minute changes that can mess up upload
  $('#onSaleSwitch').prop('disabled', true);

  if (nft && cover) {
    $('#createModal').modal('show');
  }
});

async function checkIfApproved() {
  try {
    let approved = await OpenMintTokenInstance.methods.isApprovedForAll(user.attributes.ethAddress, OpenMintMarketplaceAddress).call();
    console.log("Approved: " + approved);

    if (approved) {
      $('#setApprovalBtn').css('display', 'none');
      $('#saveToIPFSBtn').prop('disabled', false);
      $('#setOffer').prop('disabled', true);
    } else {
      $('#setApprovalBtn').css('display', 'block');
      $('#saveToIPFSBtn').prop('disabled', true);
      $('#setOffer').prop('disabled', true);
    }
  } catch (err) {
    console.log(err);
  }
};

$('#setApprovalBtn').click(async () => {
  $('#setApprovalBtn').prop('disabled', true);
  $('#setApprovalBtn').html(`Setting Approval To Sell <div class="spinner-border spinner-border-sm text-light" role="status">
                              <span class="sr-only">Loading...</span>
                            </div>`);
  await OpenMintTokenInstance.methods.setApprovalForAll(OpenMintMarketplaceAddress, true).send({ from: user.attributes.ethAddress }, (err, txHash) => {
    if (err) {
      alert(err.message);
      $('#setApprovalBtn').prop('disabled', false);
      $('#setApprovalBtn').html('Set Approval To Sell')
    } else {
      console.log(txHash, "Approval Successfully Granted");
      $('#saveToIPFSBtn').prop('disabled', false);
      $('#setApprovalBtn').prop('disabled', true);
      $('#setApprovalBtn').html('Approval Successfully Granted');
      $('#setApprovalBtn').removeClass('btn-primary');
      $('#setApprovalBtn').addClass('btn-success');
    }
  });
});

$('#saveToIPFSBtn').click(async () => {
  $('#saveToIPFSBtn').prop('disabled', true);
  $('#saveToIPFSBtn').html(`Uploading art to IPFS <div class="spinner-border spinner-border-sm text-light" role="status">
                              <span class="sr-only">Loading...</span>
                            </div>`);
  uploadArtToIPFS();
});

async function uploadArtToIPFS() {
  try {
   

    let nftPath = nft[0].path;
   
    uploadMetaDataToIPFS(nftPath);
  } catch (err) {
    console.log(err);
    alert("Error saving art to ipfs");
    $('#saveToIPFSBtn').prop('disabled', false);
    $('#saveToIPFSBtn').html("Upload and Mint");
  }
};

async function uploadMetaDataToIPFS(nftPath) {
  $('#saveToIPFSBtn').html(`Uploading metadata to IPFS <div class="spinner-border spinner-border-sm text-light" role="status">
                              <span class="sr-only">Loading...</span>
                            </div>`);
  try {
    let allEmojiRegEx = /\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]/g;

    
 
    await Moralis.start({
      serverUrl: 'http://192.168.100.161:1337/server',
      appId:"021", 
      apiKey: 'WNiUaG8V160i1ViysWj3WBGwnUD8Zzyh6zLwNPyDYe1YbD1KWbWjxjb0qs2YZsx1',
     // Application id from moralis.io
     
    });
console.log(nftPath);
console.log("nftPath");
console.log(nftPath);



    const nftMetadatap = {
      abi: [
        {
          path:'nft-metadata.json',
          content:{

            name: $('#title').val().replace(allEmojiRegEx, ''),
            description: $('#descriptionInput').val().replace(allEmojiRegEx, ''),
            image: nftPath
          }
        },
      ],
    };

    
    const nftMetadataPaths = await Moralis.Web3API.storage.uploadFolder(nftMetadatap);
    const nftMetadataPath=  nftMetadataPaths[0].path;
        console.log("nftMetadata");
    console.log(nftMetadataPath);
    mint(nftMetadataPath, nftPath);
  } catch (err) {
    console.log(err);
    alert("Error saving metadata to ipfs");
    $('#saveToIPFSBtn').prop('disabled', false);
    $('#saveToIPFSBtn').html("Upload and Mint");
  }
};



async function mint(nftMetadataPath, nftPath) {
  $('#saveToIPFSBtn').html(`Minting artwork on blockchain <div class="spinner-border spinner-border-sm text-light" role="status">
                                                            <span class="sr-only">Loading...</span>
                                                          </div>`);
  try {
    let receipt = await OpenMintTokenInstance.methods.createArtwork(nftMetadataPath, royalty).send({ from: user.attributes.ethAddress });
    $('#saveToIPFSBtn').prop('disabled', true);
    $('#saveToIPFSBtn').html("Successfully Minted");
    let tokenId = receipt.events.Transfer.returnValues.tokenId;
    uploadToDB(tokenId, nftMetadataPath, nftPath);
    console.log(receipt)
;
    
  } catch (err) {
    console.log(err);
    alert("Error minting token");
    $('#saveToIPFSBtn').prop('disabled', false);
    $('#saveToIPFSBtn').html("Upload and Mint");
  }
};


async function uploadToDB(tokenId, nftMetadataPath, nftPath) {
  $('#saveToIPFSBtn').html(`Finishing upload to OpenMint <div class="spinner-border spinner-border-sm text-light" role="status">
                                                            <span class="sr-only">Loading...</span>
                                                          </div>`);
  try {
    let fileType = nfts._source.file.type;
    console.log(fileType);
    await cover.save();

    const Artwork = Moralis.Object.extend("Artwork");

    const artwork = new Artwork();
    artwork.set('name', $('#title').val());
    artwork.set('description', $('#descriptionInput').val());
    artwork.set('additionalInfo', $('#additionalInfoInput').val());
    artwork.set('unlockableContent', $('#unlockableContentText').val());
    artwork.set('unlockableContent', $('#unlockableContentText').val());
   
    artwork.set('fileType', fileType);
    artwork.set('path', nftPath);
    artwork.set('metadataPath', nftMetadataPath);
    artwork.set('royalty', Number(royalty));
    artwork.set('cover', cover);
    artwork.set('nftId', tokenId);
    artwork.set('tokenAddress', OpenMintTokenAddress.toLowerCase());
    artwork.set('currentOwner', user.attributes.ethAddress);
    artwork.set('creator', user.attributes.ethAddress);
    artwork.set('active', false);
    artwork.set('likes', 0);
    artwork.set('category', selected.innerHTML);
    artwork.set('picReader', arrmul );
    
    await artwork.save();
    console.log(artwork);

    $('#saveToIPFSBtn').html("Successfully Minted And Uploaded");
    $('#saveToIPFSBtn').removeClass('btn-primary');
    $('#saveToIPFSBtn').addClass('btn-success');

    if ($('#onSaleSwitch').prop('checked')) {
      $('#setOffer').prop('disabled', false);
      setArtForSale(tokenId);
    } else {
      confetti({
        zIndex: 9999
      });
      $('#successfulText').html('<a href="http://192.168.100.161/profile.html?address=' + user.attributes.ethAddress + '">Click here to view.</a> <a href="erc-721.html">Or click here to make another one.</a>');
    }

  } catch (err) {
    console.log(err);
    alert("Error uploading to OpenMint");
    $('#saveToIPFSBtn').prop('disabled', false);
    $('#saveToIPFSBtn').html("Upload and Mint");
  }
};

function setArtForSale(tokenId) {
  $('#setOffer').click(async () => {
    let price = $('#salePriceInput').val();
    const amountInWei = web3.utils.toWei(price, 'ether');

    $('#setOffer').prop('disabled', true);
    $('#setOffer').html(`Putting On Sale <div class="spinner-border spinner-border-sm text-light" role="status">
                            <span class="sr-only">Loading...</span>
                          </div>`);
    try {
    //  let listing = await OpenMintMarketplaceInstance.methods.getListingFee();
      var accounts = await web3.eth.getAccounts(); 
      account = accounts[0]; 
	//	listing=listing.toString();
		let etherValue = Web3.utils.toWei('0.0025', 'ether');
		etherValue=etherValue.toString();
	  //await OpenMintMarketplaceTokenErc20.approve(OpenMintMarketplaceAddress, price)
	  // await  OpenMintMarketplaceTokenErc20.methods.approve(OpenMintMarketplaceAddress, etherValue).send({from: account});	  
    
	 await OpenMintMarketplaceInstance.methods.setOffer(amountInWei, tokenId, OpenMintTokenAddress).send({from: account});	  
	
      //await OpenMintMarketplaceInstance.methods.setOffer(amountInWei, tokenId, OpenMintTokenAddress).send({ from: user.attributes.ethAddress });
      $('#setOffer').html('Successfully Put On Sale');
      $('#setOffer').removeClass('btn-primary');
      $('#setOffer').addClass('btn-success');
      confetti({
        zIndex: 9999
      });
      console.log("For Sale Data", OpenMintMarketplaceInstance);
      $('#successfulText').html('<a href="http://192.168.100.161/profile.html?address=' + user.attributes.ethAddress + '">Click here to view.</a> <a href="erc-721.html">Or click here to make another one.</a>');
    } catch (err) {
      alert(err.message);
      $('#setOffer').prop('disabled', false);
      $('#setOffer').html("Put On Sale");
    }
  });
};