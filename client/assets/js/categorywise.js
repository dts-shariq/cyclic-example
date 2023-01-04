


$(document).ready(async function(){
  web3 = new Web3(Web3.givenProvider || "wss://192.168.100.161");
  OpenMintTokenInstance = new web3.eth.Contract(abi.OpenMintToken, OpenMintTokenAddress);
  OpenMintMarketplaceInstance = new web3.eth.Contract(abi.OpenMintMarketplace, OpenMintMarketplaceAddress);
  OpenMintMarketplaceTokenErc20 = new web3.eth.Contract(abi.MarkToken, OpenMintErc20);
  ethPrice = await getEthPrice();
 

});


$( "#realestate" ).click(function() {
  $('#unlockableContentModal').modal('show')
  $( "#logindt" ).click(function() {
  var password =  $("#password").val();
  var username = $("#username").val();

  console.log(password);
  console.log(username);  

  // if(username=="dts" && password=="123"){
  //   window.location.href = "http://192.168.100.161/categoryRealEstate.html";
  // }
  // else
   if(username=="harada" && password=="harada123"){
    window.location.href = "http://192.168.100.161/categoryRealEstate.html";
  }
  else {

    $('#unlockableContentText').html('TO access this permission signup');

  }
});


});





if(unlockableContent && user.attributes.ethAddress.toLowerCase() == owner.toLowerCase()){
    $('.unlockable-div').css('display', 'block');
    $('#unlockableContentBtn' + tokenAddress + id).addClass('unlockable-content-shadow');
    $('#unlockableContentBtn' + tokenAddress + id).html('Unlocked');
  } else if(unlockableContent){
    $('.unlockable-div').css('display', 'block');
    $('#unlockableContentBtn' + tokenAddress + id).removeClass('unlockable-content-shadow');
    $('#unlockableContentBtn' + tokenAddress + id).html('Unlockable');
  }



  function getUnlockableContentFrontEnd(tokenAddress, id, owner){
    $('#realestate').click(async()=>{
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

