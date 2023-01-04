Moralis.initialize("021");  // Application id from moralis.io
Moralis.serverURL = 'http://192.168.100.161:1337/server'; //Server url from moralis.io

//Moralis.start("https://2e1jk4mlcyr3.usemoralis.com:2053/server","V3YPB41ScC14PnIUtkMoxaZnLKE7q83H4XauIiJx");


let user = Moralis.User.current();

$('#singleButton').click(() =>{
  window.location.href='erc-721.html';
});

$('#multipleButton').click(() =>{
  // window.location.href='erc-1155.html';
});
