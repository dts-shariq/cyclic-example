class MyHeader extends HTMLElement{

    connectedCallback(){
        this.innerHTML=`<nav class="navbar fixed-top navbar-expand-lg navbar-light bg-light">
        <a class="navbar-brand" href="index.html">
          <img src="assets/images-icons/OpenMintLogo.png" width="30" height="30" class="d-inline-block align-top" alt="OpenMint logo">
          <span id="open" class="ml-1">ILife <span id="mint">Marketplace</span></span>
        </a>
        <span class="input-group searchbar">
          <span id="exitSearchBtn">
            <span class="exit-search">⬅️</span>
          </span>
          <input type="search" id="searchInput" class="form-control search-input" placeholder="Search by creator, artwork title, or wallet address" aria-label="Search by creator, artwork title, or wallet address">
        </span>
        <button class="btn search-button" id="searchBtn">🔍</button>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse flex-row-reverse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item active">
              <a class="nav-link" id="create" href="index.html">Discover <span class="sr-only">(current)</span></a>
            </li>
            <li class="nav-item active">
            <a class="nav-link" id="create" href="Categorywise.html">Category</a>
            </li>
            <li class="nav-item active">
              <a class="nav-link" id="create" href="following.html">Following<span class="sr-only">(current)</span></a>
            </li>
           
            <li class="nav-item active">
              <a class="nav-link" id="create" href="create.html">Create</a>
            </li>
            
            <li class="nav-item mr-1" id="connectWalletTag">
              <button type="button" class="btn btn-primary button-styling shadow-sm" id="connectWalletBtn">Connect</button>
            </li>
            <li class="nav-item dropdown mr-2" id="profileTag" style="display: none;">
              <a class="nav-link dropdown-toggle shadow-sm" href="#" id="profile" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span id="userAddress"></span>
                <span id="spinnerBorderInNav" class="spinner-border text-primary" style="margin: 0 5px; width: 1.25rem; height: 1.25rem;" role="status">
                  <span class="sr-only">Loading...</span>
                </span>
                <img src="" class="shadow-sm" id="profilePhotoInNav" width="30px">
                <img id="rankInNav" src="" width="12px" alt="seller badge">
              </a>
              <div class="dropdown-menu" aria-labelledby="profile">
                <a class='dropdown-item' href="stats.html">My Stats</a>
                <a id="myProfile" class='dropdown-item'>My Profile</a>
                <a class='dropdown-item' href="edit-profile.html">Edit Profile</a>
                <hr>
                <a class="dropdown-item" id="Metamask">Add token </a>
                <hr>
                <a class="dropdown-item" id="disconnectWalletBtn">Disconnect Wallet</a>
              </div>
            </li>
           
        </div>
  
      </nav>
  
      `

    }

}

customElements.define('my-header',MyHeader);

