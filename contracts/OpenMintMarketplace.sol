// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./OpenMint.sol";
import "./PaymentGateway.sol";
import "./MarkToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";




contract OpenMintMarketplace is Ownable,ReentrancyGuard {

   uint256  listfees = 0.025 ether;
  OpenMint private _OpenMint;
  address payable private owners;
  PaymentGateway private _PaymentGateway;
  MarkToken private _MarkToken;
  address payable publisherWallet;
  using Counters for Counters.Counter;
   Counters.Counter private _tokensSold;
 


  struct Offer{
    address payable seller;
    address tokenAddress;
    uint256 price;
    uint256 offerId;
    uint256 tokenId;
    bool isSold;
    bool active;
  }

  mapping(uint256 => Offer) private marketItemIdToMarketItem;
  Offer[] public offers;

  mapping(uint256 => Offer) tokenIdToOffer;
  

  event artworkAdded(address tokenAddress, address seller, uint256 price, uint256 tokenId, uint256 offerId, bool isSold);
  event artworkSold(address tokenAddress, address buyer, uint256 price, uint256 tokenId, uint256 offerId);
  event priceChanged(address owner, uint256 price, address tokenAddress, uint256 tokenId, uint256 offerId);
  event artworkRemoved(address owner, uint256 tokenId, address tokenAddress);

  constructor(address _OpenMintContractAddress, address _PaymentGatewayAddress, address payable _publisherWallet,address _MarkTokenContractAddress) {
    _setOpenMintContract(_OpenMintContractAddress);
    _setPaymentGatewayContract(_PaymentGatewayAddress);
    _setMarkTokenContract(_MarkTokenContractAddress);
    publisherWallet = _publisherWallet;
    owners = payable(msg.sender);
 
  }
  

   function getListingFee() public view returns (uint256) {
        return listfees;
    }

  function _setPaymentGatewayContract(address _PaymentGatewayAddress) private onlyOwner{
    _PaymentGateway = PaymentGateway(_PaymentGatewayAddress);
  }

  function _setMarkTokenContract(address _MarkTokenContractAddress) private onlyOwner{
    _MarkToken = MarkToken(_MarkTokenContractAddress);
  }
   function _setOpenMintContract(address _OpenMintContractAddress) private onlyOwner{
    _OpenMint = OpenMint(_OpenMintContractAddress);
  }


  function setOffer(uint256 price, uint256 tokenId,address nftContractAddress) public payable nonReentrant {
    require(_OpenMint.ownerOf(tokenId) == msg.sender, "Only the owner of the artwork is allowed to do this");
    require(_OpenMint.isApprovedForAll(msg.sender, address(this)) == true, "Not approved to sell");
    require(price >= 0, "Price must be greater than or equal to 1 wei");
    require(tokenIdToOffer[tokenId].active == false, "Item is already on sale");
   require(price >= listfees, "Price should be at least same as listing price");
    
  //IERC20(_MarkToken).approve( address(this), listfees);
   IERC20(_MarkToken).transferFrom(msg.sender, address(this), listfees);
   IERC721(nftContractAddress).transferFrom(msg.sender, address(this), tokenId);
    uint256 offerId = offers.length;

    Offer memory offer = Offer(payable(msg.sender), nftContractAddress, price, offerId, tokenId, false, true);

    tokenIdToOffer[tokenId] = offer;

    offers.push(offer);

    emit artworkAdded(address(_OpenMint), msg.sender, price, tokenId, offerId, false);
  }

  function changePrice(uint256 newPrice, uint256 tokenId, address tokenAddress) public{
    require(offers[tokenIdToOffer[tokenId].offerId].seller == msg.sender, "Must be seller");
    require(newPrice >= 1000, "Price must be greater than or equal to 1000 wei");
    require(offers[tokenIdToOffer[tokenId].offerId].active == true, "Offer must be active");
    require(offers[tokenIdToOffer[tokenId].offerId].isSold == false, "Item already sold");

    offers[tokenIdToOffer[tokenId].offerId].price = newPrice;

    emit priceChanged(msg.sender, newPrice, tokenAddress, tokenId, offers[tokenIdToOffer[tokenId].offerId].offerId);
  }

  function removeOffer(uint256 tokenId, address tokenAddress) public{
    require(offers[tokenIdToOffer[tokenId].offerId].seller == msg.sender, "Must be the seller/owner to remove an offer");

    offers[tokenIdToOffer[tokenId].offerId].active = false;
    delete tokenIdToOffer[tokenId];

    emit artworkRemoved(msg.sender, tokenId, tokenAddress);
  }

  function buyArt(uint256 tokenId, address tokenAddress) public payable nonReentrant{
    Offer memory offer = tokenIdToOffer[tokenId];
    require(offers[offer.offerId].price == msg.value, " must Paymentbe equal to price of the art");
    require(offers[offer.offerId].seller != msg.sender, "Cannot buy your own artwork");
    require(offers[offer.offerId].active == true, "Offer must be active");
    require(  (_MarkToken).balanceOf(msg.sender) >= offers[offer.offerId].price , "You don't have enough funds!");
    require( IERC20(_MarkToken).allowance(msg.sender, address(this)) >= offers[offer.offerId].price, "Marketplace is not allowed to use your funds, check the allowance!");
     
    uint256 price = offers[offer.offerId].price;
    // uint256 tokenId = marketItemIdToMarketItem[marketItemId].tokenId;
    delete tokenIdToOffer[tokenId];
    offers[offer.offerId].isSold = true;
    offers[offer.offerId].active = false;
   // _OpenMint.safeTransferFrom(offer.seller, msg.sender, tokenId);
     IERC20(_MarkToken).transferFrom(msg.sender, address(this), price);
      IERC721(_OpenMint).transferFrom(address(this), msg.sender, tokenId);
     
   _tokensSold.increment();
    _distributeFees(tokenId, offers[offer.offerId].price, offer.seller);
     //IERC20(_MarkToken).transfer(owners, listfees );
    emit artworkSold(tokenAddress, msg.sender, offers[offer.offerId].price, offers[offer.offerId].tokenId, offers[offer.offerId].offerId);
      IERC20(_MarkToken).transfer(offer.seller, price); //transfer tokens to seller from NFTMarket

  }

    function createMarketSale(
        address nftContractAddress,
        address erc20ContractAddress,
        uint256 marketItemId
    ) public payable nonReentrant {
      Offer memory offer = tokenIdToOffer[marketItemId];
   
       uint256 price = offers[offer.offerId].price;
        uint256 tokenId = offers[offer.offerId].tokenId;

      delete tokenIdToOffer[tokenId];
      offers[offer.offerId].isSold = true;
      offers[offer.offerId].active = false;

        uint8 creatorRoyalty = _OpenMint.getRoyalty(tokenId);
        uint256 creatorFee = _computeCreatorFee(price, creatorRoyalty);
        uint256 publisherFee = _computePublisherFee(price);
        uint256 payment = price - creatorFee - publisherFee;

        address payable creator = _OpenMint.getCreator(tokenId);
        MarkToken(erc20ContractAddress).transferFrom(msg.sender, offer.seller, payment);
        IERC721(nftContractAddress).transferFrom(address(this), msg.sender, tokenId);
        MarkToken(erc20ContractAddress).transferFrom(msg.sender, creator, creatorFee);
        MarkToken(erc20ContractAddress).transferFrom(msg.sender, publisherWallet, publisherFee);
    //_distributeFees(tokenId, offers[offer.offerId].price, offer.seller);
        _tokensSold.increment();

        MarkToken(erc20ContractAddress).transfer(owners, listfees);
        emit artworkSold(nftContractAddress, msg.sender, offers[offer.offerId].price, offers[offer.offerId].tokenId, offers[offer.offerId].offerId);

    }

  function _computeCreatorFee(uint256 price, uint8 royalty) internal pure returns(uint256){
    uint256 creatorFee = price * royalty / 100;
    return creatorFee;
  }

  function _computePublisherFee(uint256 price) internal pure returns(uint256){
    uint256 publisherFee = price * 2 / 100;
    return publisherFee;
  }

  function _distributeFees(uint256 tokenId, uint256 price, address payable seller) internal{
    uint8 creatorRoyalty = _OpenMint.getRoyalty(tokenId);
    uint256 creatorFee = _computeCreatorFee(price, creatorRoyalty);
    uint256 publisherFee = _computePublisherFee(price);
    uint256 payment = price - creatorFee - publisherFee;

    address payable creator = _OpenMint.getCreator(tokenId);

    _PaymentGateway.sendPayment{value: creatorFee}(creator);
    _PaymentGateway.sendPayment{value: payment}(seller);
    _PaymentGateway.sendPayment{value: publisherFee}(publisherWallet);
  }
}
